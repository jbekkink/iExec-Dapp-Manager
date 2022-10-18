import Wallet from './components/Wallet';
import Sidebar from './components/NavBar';
import Userbar from './components/UserBar';
import DappOverview from './components/DappOverview';
import ManageDapp from './components/Order';
import Account from './components/Account';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {init, refreshUser} from "./components/iexec";
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function App(props) {
  const [iexec, setIexec] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  
  //Initialize the iexec object here --> connection with metamask
  useEffect(() => {
    async function initialize() {
      const res = await init();
      setIexec(res);
    }
    initialize();
  }, []); 

  //Get the user address (returns a promise)
  useEffect(() => {
    async function getUserAddress() {
      const id = await refreshUser(iexec)().then(result => {
        return result.toString().toLowerCase();
      });
      setUserAddress(id);
    }
    if(iexec) {
      getUserAddress();
    }
  }, [iexec]);

  return (
    <div className="flex w-screen h-screen">
      <Router>
        <Toaster />
        <Sidebar />
        <Routes>
          {iexec && <Route path="/" element={<><Wallet iexec={iexec} id={userAddress}/><Userbar iexec={iexec} id={userAddress}/></>} />}
          {iexec && <Route path="/manage-dapp" element={<DappOverview iexec={iexec} id={userAddress}/>}/>}
          {iexec && <Route path="/manage-dapp/:id" element={<ManageDapp iexec={iexec} id={userAddress}/>}/>}
          {iexec && <Route path="/name-setup" element={<Account iexec={iexec} id={userAddress}/>}/>}
        </Routes>
      </Router>
    </div>

  );
}

export default App;
