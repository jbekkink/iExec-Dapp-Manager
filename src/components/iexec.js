import { IExec } from 'iexec';
import {uploadFailed, uploadSuccessful, loadingNotif} from './Notifications';
import toast from 'react-hot-toast';

const checkName = (iexec, id) => async () => {
  const name = iexec.ens.lookupAddress(id).then(res => {
    return res;
  })
  return name;
}

const claimDomainName = (iexec, id, name, domain ) => async() => { 
  if(domain === "-1") return; 
  if(!name) {
    uploadFailed('Please enter a name');
    return;
  }
  let ens_domain; 
  let owner; 
  
  if(domain === "0") {
      owner = await iexec.ens.getOwner(name + '.apps.iexec.eth');
      ens_domain = 'apps.iexec.eth';
  }
  else if(domain === "1") {
    owner = await iexec.ens.getOwner(name + '.users.iexec.eth');
    ens_domain = 'users.iexec.eth';
  }

  if(owner === id) {
      uploadFailed('You already own this name');
      return; 
  }
  else if(owner !== '0x0000000000000000000000000000000000000000') {
    uploadFailed('Name is owned by another user');
    return;
  } 

  try {
    const prom = iexec.ens.claimName(name, ens_domain);
    toast.promise(prom, 
    {
      loading: 'Claming name...',
      success: 'Name successfully claimed',
      error: 'Could not claim name'
    }, 
    {
      style: {
        background: '#111115',
        padding: '1.5em',
        color: 'white',
        border: '1px solid #322c3c',
        borderRadius: '5px'
        },
       
        error: {
          position: 'top-right',
          iconTheme: {
            primary: '#FF4D4C',
            secondary: '#FFF',
          },
        },
        success: {
          position: 'top-right',

        },
        loading: {
          style: {
            background: '#111115',
            padding: '0.5em',
            color: 'white',
            border: '1px solid #322c3c',
            borderRadius: '5px'
          },
          position: 'bottom-right',
          iconTheme: {
            primary: '#FFEA61',
            secondary: '#202020',
          },
        },
        
    });
    return;
  } catch(error) {
    throw Error(error);
  }
}

const setName = (iexec, name, domain, appAddress, id) => async () => {
  if(name.length === 0) {
    uploadFailed('Please enter a name');
    return;
  }

  const loading = loadingNotif(`Setting name`);
  const owner = await iexec.ens.getOwner(name + domain);  
  if(owner.toLowerCase() !== id.toLowerCase()) {
    toast.dismiss(loading);
    uploadFailed('You do not own this name');
    return; 
  }
  try {
    if(appAddress) {
      await iexec.ens.configureResolution(name + domain, appAddress).then(result => {
        toast.dismiss(loading);
        uploadSuccessful(`Name successfully changed`);
      });
    }
    else {
      await iexec.ens.configureResolution(name + domain).then(result => {
        toast.dismiss(loading);
        uploadSuccessful(`Name sucessfully updated`);
      });
    }
  } catch(error) {
    toast.dismiss(loading);
    throw Error(error);
  }
  return;
}

const refreshUser = (iexec) => async () => {
  const userAddress = await iexec.wallet.getAddress();
  const [wallet, account] =  await Promise.all([iexec.wallet.checkBalances(userAddress),
    iexec.account.checkBalance(userAddress)]); 

  return userAddress;
}; 

const checkStorage = (iexec) => async () => {
  try {
    const isStorageInitialized = await iexec.storage.checkStorageTokenExists(
      await iexec.wallet.getAddress()
    );
    if(!isStorageInitialized) {
        alert('Please initialize your iExec storage');
        initStorage(iexec)();
    }
  } catch (error) {
    alert(error);
  }
};

const initStorage = (iexec) => async () => {
  try {
    const storageToken = await iexec.storage.defaultStorageLogin();
    await iexec.storage.pushStorageToken(storageToken, { forceUpdate: true });
    checkStorage(iexec)();
  } catch (error) {
    alert(error);
  }
};

async function init () {
  try {
    let ethProvider;
    if (window.ethereum) {
      console.log("using default provider");
      ethProvider = window.ethereum;
      ethProvider.on("chainChanged", (_chainId) => window.location.reload());
      ethProvider.on("accountsChanged", (_accounts) =>
        window.location.reload()
      );
      await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x86",
            chainName: "Bellecour (iExec sidechain)",
            nativeCurrency: {
              name: "xRLC",
              symbol: "xRLC",
              decimals: 18
            },
            rpcUrls: ["https://bellecour.iex.ec"],
            blockExplorerUrls: ["https://blockscout-bellecour.iex.ec"]
          }
        ]
      });
    }

    const { result } = await new Promise((resolve, reject) =>
      ethProvider.sendAsync(
        {
          jsonrpc: "2.0",
          method: "net_version",
          params: []
        },
        (err, res) => {
          if (!err) resolve(res);
          reject(Error(`Failed to get network version from provider: ${err}`));
        }
      )
    );
    const networkVersion = result;

    if (networkVersion !== "134") {
      const error = `Unsupported network ${networkVersion}, please switch to Bellecour (iExec Sidechain)`;
      throw Error(error);
    }

    const iexec = new IExec({
      ethProvider
    });

    await refreshUser(iexec)();
    await checkStorage(iexec)();

    console.log("initialized");
    return iexec;
  } catch (e) {
    console.error(e.message);
  }
};

export {init, refreshUser, checkName, claimDomainName, setName};