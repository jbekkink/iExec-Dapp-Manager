import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {gql, useQuery, useSubscription} from '@apollo/client';
import { checkName} from './iexec';
import { IExec } from 'iexec';

const ORDER_PAGE_LENGTH = 3;

const GetOrders = gql`
subscription getDatasets($id: String, $length: Int = 6, $skip: Int = 0) {
    account(id: $id) {
        dealBeneficiary(first: $length, skip:$skip, orderBy: timestamp, orderDirection: desc, where:{appOwner: $id}) {
            id
            app {
                id
                name
            }
            appPrice
            timestamp
        }
    }
}`;

const GetDapps = gql`
subscription getDatasets($id: String, $length: Int = 3, $skip: Int = 0) {
    account(id: $id) {
        apps(first: 3, orderBy:timestamp, orderDirection: desc){
            name
            timestamp
            id
            usages {
                appPrice
            }
        }
    }
}`;

function WelcomeText(time) {
  var hours = time.getHours();
  if(hours < 12) return 'Good Morning, ';
  else if(hours < 18) return 'Good Afternoon, ';
  return 'Good Evening, ';
}
//Shorten addresses to only display a few characters of the string
function Shorten(text) {
  return text.substring(0,6) + '..' + text.substring((text.length - 3), text.length);
}

const Wallet = (props) => {
    const [accountName, setAccountName] = useState("");
    const [namesSet, setNamesSet] = useState(false);
    const [smap, setMap] = useState(null);
    const [page, setPage] = useState(0);
    const [completed, setCompleted] = useState(false);
    const navigate = useNavigate();
    const sub = useSubscription(GetDapps, {
      variables: { id: props.id },
    });  
    //const dapps = !sub.loading && sub.data && sub.data.account && sub.data.account.apps;
    const dapps = !sub.loading && sub.data && sub.data.account && sub.data.account.apps;

    const orders_sub = useSubscription(GetOrders, {
      variables: { skip: ORDER_PAGE_LENGTH * page, length: ORDER_PAGE_LENGTH, id: props.id },
  });
  const deals = !orders_sub.loading && orders_sub.data && orders_sub.data.account && orders_sub.data.account.dealBeneficiary;


  function nextPage(length) {
    console.log(length);
    if(length  < ORDER_PAGE_LENGTH) return;
    setPage(page + 1);
  }
  function prevPage() {
      if(page === 0) return; 
      setPage(page - 1);
  }
  
  useEffect(() => {
    async function introName() {
        const name = await checkName(props.iexec, props.id)();
        if(name) setAccountName(name.split(".")[0]);
        else setAccountName(Shorten(props.id));
    }
    if(props.id) {
        introName();
    }
  }, [props.id]);


  useEffect(() => {
    async function introName() {
        let map = new Map();
        for(let i = 0; i < dapps.length; i++) {
          const name = await checkName(props.iexec, dapps[i].id)();
          if(name) map.set(dapps[i].id, name);
          else map.set(dapps[i].id, Shorten(dapps[i].id));
        }
        setMap(map);
    } 
    if(dapps) {
        introName();
    }
  }, [dapps]);

  function totalPrice(usages) {
    let sum = 0; 
    if(usages.length === 0) return 0;
    for(let i = 0; i < usages.length; i++) {
        sum = sum + parseInt(usages[i].appPrice); 
    } 
    return sum;
  }  

  return (
        <div className="p-4 font-semibold flex-1 flex flex-col gap-16 text-primary-50 text-center overflow-y-auto">
          <div>
            <h1 className="text-left text-2xl p-1">{WelcomeText(new Date())} {accountName}</h1>
          </div>

          <div className='flex flex-col gap-3'>
            <div className="flex justify-between items-center">
                <h1 className="text-left text-2xl">Your Dapps</h1>
                <button className="bg-yellow rounded-md px-5 py-2 hover:bg-secondary-200 text-neutral-900 transition duration-500" onClick={() => navigate('/manage-dapp')}>View All</button>
            </div>
            <div className="flex flex-col md:grid grid-cols-3 gap-4 ">
            {dapps && dapps.length > 0 &&
                              dapps.map(({ timestamp, name, id, usages}) => 
                              <div className="bg-overlay1 rounded-md p-0.75em text-left cursor-pointer hover:bg-hover shadow-lg transition duration-500" id={id} key={id} onClick={() =>navigate(`/manage-dapp/${id}`)}>
                                  <div className="">
                                      <h3 className="text-2xl font-bold">{name}</h3>
                                      {smap && <p className="text-yellow">{smap.get(id)}</p>}                             
                                  </div>
                                  
                                  <div className="mt-3 text-neutral-300">
                                      <p>{totalPrice(usages)} RLC Earned</p>
                                  </div>
                                  <div className="mt-3 text-neutral-300">
                                      <p>{usages.length} Usages</p>
                                  </div>
                                  <div className="mt-3 text-neutral-300">
                                      <p>Upload Date:</p>
                                      <p>{(new Date(timestamp * 1000)).toLocaleString()}</p>
                                  </div>
                                  </div>)}
            {(!dapps || dapps.length === 0) && <h2 className="w-max text-gray-400">No Dapps uploaded yet</h2>}
            </div>
          </div>

          <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row justify-between items-center">
                  <h1 className="text-left text-2xl">Recent Deals</h1>
                  <div className="flex gap-6"> 
                    <button className="bg-yellow rounded-md px-5 py-2 hover:bg-secondary-200 text-neutral-900 transition duration-500" onClick={prevPage}>Previous</button>
                    <button className="bg-yellow rounded-md px-5 py-2 hover:bg-secondary-200 text-neutral-900 transition duration-500"onClick={() => nextPage(deals.length)}>Next</button>
                  </div>
              </div>
              <div className="flex flex-col gap-4" >
              {deals &&
                        deals.map(({id, appPrice, app, timestamp}) => 
                        <div className="bg-overlay1 rounded-md p-3 text-left cursor-pointer hover:bg-hover shadow-lg transition duration-500"  id={id} key={id} onClick={() =>navigate(`/manage-dapp/${app.id}`)}>
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="first-line:text-lg font-extrabold">{app.name}</h4>
                                <p className="text-neutral-300">{(new Date(timestamp * 1000)).toLocaleString()}</p>
                                
                              </div>
                              <div>
                                <p className="text-emerald-400 text-xl">+{appPrice} RLC</p>
                              </div>
                            </div>
                        </div>)}
              {(!deals || deals.length === 0) && <h2 className="w-max text-gray-400">No recent deals available</h2>}
              </div>
          </div>
        </div>     
    );

}

export default Wallet;