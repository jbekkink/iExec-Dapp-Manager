import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {gql, useQuery, useSubscription} from '@apollo/client';
import { refreshUser, checkName, claimDomainName, setName} from './iexec';
import { type } from '@testing-library/user-event/dist/type';
import { uploadFailed } from './Notifications';

const DAPP_PAGE_LENGTH = 3;

const GetDapps = gql`
subscription getDatasets($id: String, $length: Int = 9, $skip: Int = 0) {
    account(id: $id) {
        apps(first: $length, orderBy:timestamp, orderDirection: desc, skip: $skip){
            name
            timestamp
            id
        }
    }
}`;

//Shorten addresses to only display a few characters of the string


const Account = (props) => {

    const [page, setPage] = useState(0);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [domainName, setdomainName] = useState(true);
    const [namesSet, setNamesSet] = useState(false);
    const [smap, setMap] = useState(null);
    const [selectedDomain, setSelectedDomain] = useState("-1");
    const [claimName, setClaimName] = useState("");
    const [newName, setNewName] = useState("");
    
    //Retrieve balance and number of dapps querying the theGraph
    const sub = useSubscription(GetDapps, {
        variables: { skip: DAPP_PAGE_LENGTH * page, length: DAPP_PAGE_LENGTH, id: props.id },
        });
        const dapps = !sub.loading && sub.data && sub.data.account && sub.data.account.apps;

    function nextPage(length) {
        if(length  < DAPP_PAGE_LENGTH) return;
        setPage(page + 1);
    }
    function prevPage() {
        if(page === 0) return; 
        setPage(page - 1);
    }

    async function nameClaim() {
        console.log(selectedDomain);
        if(selectedDomain==="-1") {
            uploadFailed("Please select a domain");
            return;
        }
        await claimDomainName(props.iexec, props.id, claimName.toLowerCase(), selectedDomain)();
        return;
    }

    async function nameSet(domain, username) {
        if(username) {
            setSelectedAddress(null);
        } 
        await setName(props.iexec, newName.toLowerCase(), domain, selectedAddress, props.id)();
        setSelectedAddress(null);
        return;
    }

    function Shorten(text) {
        return text.substring(0,6) + '..' + text.substring((text.length - 3), text.length);
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

      function setDomain(e) {
        setSelectedDomain(e.target.value);
        e.preventDefault();
        return;
      }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 text-primary-50 overflow-auto">
             <div className='flex flex-col md:flex-row w-full gap-4'>
                <div className="flex flex-col gap-4 justify-between text-center bg-overlay1 p-3 md:w-1/2 text-md rounded-md">
                        <h1 className="text-xl border-b border-b-form text-left font-semibold">Claim iExec Name</h1>
                        <div>
                            <label className="block text-neutral-200 text-md text-left font-bold" htmlFor="price">Select domain: </label>
                                <select value={selectedDomain} onChange={(e) => setDomain(e)} className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-form border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500">
                                    <option value={-1}>Choose a domain</option>
                                    <option value={0}>Dapp domain name</option>
                                    <option value={1}>User domain name</option>
                                </select>
                        </div>
                        <div className="w-full mb-6 md:mb-0">
                                <label className="block text-neutral-200 text-md text-left font-bold" htmlFor="name">Name:</label>
                                <input className="appearance-none block w-full bg-form text-neutral-400 border border-neutral-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-white" id="name" type="name" onChange={(e) => setClaimName(e.target.value)} ></input>                        
                        </div>
                        <button onClick={async() => nameClaim()} className="bg-yellow font-semibold text-neutral-900 rounded-md w-full px-4 py-3 hover:bg-secondary-200  transition duration-500">Claim iExec name</button>
                </div>
                <div className="flex flex-col gap-3 justify-between text-center bg-overlay1 p-3 md:w-1/2 text-md rounded-md">
                    <h1 className="text-xl border-b border-b-form text-left font-semibold">Set iExec Account Domain</h1>
                    <div className='flex flex-col justify-between'>
                        <p className='text-md leading-relaxed bg-form p-2 rounded-md justify-center items-center align-middle text-left'>
                            Enter a claimed name to set your Account Domain name to name.users.iexec.eth
                        </p>
                        <div className='w-full'>
                            <div className="w-full mb-6 md:mb-0">
                                <label className="block text-neutral-200 text-md text-left font-bold mb-2" htmlFor="price">Name:</label>
                                <input className="appearance-none block w-full bg-form text-neutral-400 border border-neutral-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-white" id="title" type="title" onChange={(e) => setNewName(e.target.value)} required></input>                        
                            </div>
                            <button onClick={async() => nameSet('.users.iexec.eth', true)} className="bg-yellow font-semibold text-neutral-900 rounded-md w-full px-4 py-3 hover:bg-secondary-200 transition duration-500">Set Name</button>
                        </div>
                    </div>
                </div>
            </div>
           
                <div className="flex flex-col gap-4 text-center bg-overlay1 p-4 w-full text-md rounded-md">
                    
                    <div className="flex flex-col gap-6 text-center bg-overlay1 text-md rounded-md">
                        <h1 className="text-xl border-b border-b-form text-left font-semibold">Set iExec Dapp Domain</h1>
                    </div>
                    {domainName && <div className="flex flex-col-reverse md:flex-row-reverse gap-6 w-full items-center">
                        <div className='w-full md:w-1/2'>
                            <div className='flex flex-col'>
                            <p className='text-md leading-relaxed bg-form p-2 rounded-md justify-center items-center align-middle text-left'>
                                Enter a claimed name to set your Dapp Domain name to name.apps.iexec.eth
                            </p>
                            <div className="w-full mb-6 md:mb-0">
                                <label className="block text-neutral-200 text-md text-left font-bold mb-2" htmlFor="price">Dapp Address</label>
                                <input className="appearance-none block w-full bg-form text-neutral-400 border border-neutral-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-white" id="number" placeholder={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)} required></input>                        
                            </div>
                            <div className="w-full mb-6 md:mb-0">
                                <label className="block text-neutral-200 text-md text-left font-bold mb-2" htmlFor="price">Name:</label>
                                <input className="appearance-none block w-full bg-form text-neutral-400 border border-neutral-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-white" id="title" type="title" onChange={(e) => setNewName(e.target.value)} required></input>                        
                            </div>
                            <button onClick={async() => nameSet('.apps.iexec.eth')} className="bg-yellow font-semibold text-neutral-900 rounded-md w-full px-4 py-3 hover:bg-secondary-200  transition duration-500">Set Dapp domain name</button>
                            </div>
                        </div>
                        <div className='w-full md:w-1/2'>
                            <div className="flex flex-col gap-1em transition duration-500 border border-neutral-500 rounded-md bg-background p-2">
                                {dapps && dapps.length > 0 && dapps.map(({ name, id}) => 
                                <div className="bg-overlay1 rounded-md p-2 text-left cursor-pointer hover:bg-hover shadow-lg" id={id} key={id} onClick={() => setSelectedAddress(id)}>
                                    <div className="">
                                        <h3 className="text-2xl font-bold">{name}</h3>
                                        {smap && <p className="text-yellow font-bold" >{smap.get(id)}</p>}
                                    </div>
                                </div>)}
                                {(!dapps || dapps.length === 0) && <h2>No Dapps uploaded yet</h2>}
                                
                                {dapps && dapps.length > 0 && <div className="flex gap-6 text-center justify-center"> 
                                    <button className="bg-neutral-700 font-semibold rounded-md px-5 py-2 hover:bg-secondary-200 hover:text-neutral-900 transition duration-500" onClick={prevPage}>Previous</button>
                                    <button className="bg-neutral-700 font-semibold rounded-md px-5 py-2 hover:bg-secondary-200 hover:text-neutral-900 transition duration-500"onClick={() => nextPage(dapps.length)}>Next</button>
                                </div>}
                            </div>
                        </div>
                    </div>}
                    
                    
                </div>

            
        </div>         
    );

}

export default Account;