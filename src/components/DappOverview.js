import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {gql, useQuery, useSubscription} from '@apollo/client';
import { refreshUser, checkName} from './iexec';

const DAPP_PAGE_LENGTH = 9;

const GetDapps = gql`
subscription getDatasets($id: String, $length: Int = 9, $skip: Int = 0) {
    account(id: $id) {
        apps(first: $length, orderBy:timestamp, skip: $skip, orderDirection: desc){
            name
            timestamp
            id
            usages {
                appPrice
            }
        }
    }
}`;

//Shorten addresses to only display a few characters of the string
function Shorten(text) {
    return text.substring(0,6) + '..' + text.substring((text.length - 3), text.length);
}

const DappOverview = (props) => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [namesSet, setNamesSet] = useState(false);
    const [smap, setMap] = useState(null);
    //Display 9 Dapps per page
    const sub = useSubscription(GetDapps, {
    variables: { skip: DAPP_PAGE_LENGTH * page, length: DAPP_PAGE_LENGTH, id: props.id },
    });
    const dapps = !sub.loading && sub.data && sub.data.account && sub.data.account.apps;

    //Navigation for the Grid
    function nextPage(length) {
        if(length  < DAPP_PAGE_LENGTH) return;
        setPage(page + 1);
    }
    function prevPage() {
        if(page === 0) return; 
        setPage(page - 1);
    }

    function totalPrice(usages) {
        let sum = 0; 
        if(usages.length === 0) return 0;
        for(let i = 0; i < usages.length; i++) {
            sum = sum + parseInt(usages[i].appPrice); 
        } 
        return sum;
    } 

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
    

    return (
    <div className="p-4 font-semibold flex-1 flex flex-col text-primary-50 overflow-y-auto">
         <div class="cont_rond_head">
                <div class="r_1"></div>
                <div class="r_2"></div>
                <div class="r_3"></div>
            </div>
        <div className='flex flex-col gap-6'>
            <div className="flex-col md:flex-row flex justify-between items-center">
                  <h1 className="text-left text-2xl">Your Dapps</h1>
                  <div className="flex gap-6"> 
                    <button className="bg-yellow rounded-md px-5 py-2 hover:bg-secondary-200 text-neutral-900 transition duration-500" onClick={prevPage}>Previous</button>
                    <button className="bg-yellow rounded-md px-5 py-2 hover:bg-secondary-200 text-neutral-900 transition duration-500"onClick={() => nextPage(dapps.length)}>Next</button>
                  </div>
              </div>
            <div className="flex flex-col md:grid grid-cols-3 gap-2em transition duration-500">
            {dapps && dapps.length > 0 && 
                            dapps.map(({timestamp, name, id, usages, index}) => 
                            <div className="bg-overlay1 rounded-md p-0.75em text-left cursor-pointer hover:bg-hover shadow-lg" id={id} key={id} onClick={() => {navigate(`/manage-dapp/${id}`)}}>
                                <div className="">
                                    <h3 className="text-2xl font-bold">{name}</h3>
                                    {smap && <p className="text-yellow font-bold" >{smap.get(id)}</p>}
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
                                {(!dapps || dapps.length === 0) && <h2 className='w-max text-center text-gray-400'>No Dapps uploaded yet... </h2>}
            </div>
            {dapps && dapps.length > 9 && <div className="md:hidden flex gap-6 text-center"> 
                <button className="bg-yellow rounded-md px-5 py-2 hover:bg-secondary-200 text-neutral-900 transition duration-500" onClick={prevPage}>Previous</button>
                <button className="bg-yellow rounded-md px-5 py-2 hover:bg-secondary-200 text-neutral-900 transition duration-500"onClick={() => nextPage(dapps.length)}>Next</button>
            </div>}
        </div>
    </div>
    );

}

export default DappOverview;