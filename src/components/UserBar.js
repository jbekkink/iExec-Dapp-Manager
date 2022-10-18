import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {gql, useQuery, useSubscription} from '@apollo/client';
import { refreshUser, checkName} from './iexec';
import { copyToClipBoard } from './Notifications';



const AccountInformation = gql`
query AccountInformation($id: String) {
    account(id: $id) {
        apps {
            id
        }
        balance
    }
}`; 

//Shorten addresses to only display a few characters of the string
function Shorten(text) {
    return text.substring(0,6) + '..' + text.substring((text.length - 3), text.length);
}

const Userbar = (props) => {
    const [accountName, setAccountName] = useState("");
    //Retrieve balance and number of dapps querying the theGraph
    const userInfo = useQuery(AccountInformation, {
        variables: { id: props.id },
      });
    const userinfo = !userInfo.loading && userInfo.data && userInfo.data.account;

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

    function copyText(text) {
        copyToClipBoard('Copied to clipboard!');
        navigator.clipboard.writeText(text);
    }

    return (
        <div className="flex w-1/6 md:w-1/5 hidden lg:block h-screen">
            <div className={`h-full bg-overlay1 text-neutral-50 flex flex-col gap-16 text-center w-full md:p-4 md:block`}>
                <div className='flex flex-col gap-16 text-lg'>
                    <div className="bg-background p-1 rounded-md border inline-block overflow-auto break-words shadow-lg">
                        <h3 className="font-medium">Connected to iExec Sidechain</h3>
                    </div>
                    <div className="bg-background p-1 rounded-md overflow-auto break-words shadow-lg">
                        <h3 className="text-white font-semibold">iExec Account</h3>
                        <div className='flex text-xl text-neutral-300 justify-center'>
                            <h3>{accountName}</h3>
                            <span className="material-symbols-outlined text-neutral-100 cursor-pointer" title="Click to Copy!" onClick={() => {copyText(props.id)}}>content_copy</span>
                        </div>
                    </div>
                    <div className="bg-background p-1 rounded-md inline-block overflow-auto break-words shadow-lg">
                        <h3 className="text-white font-semibold">Account Balance</h3>
                        <h3 className="text-3xl text-neutral-300">{userinfo && userinfo.balance}</h3>
                    </div>
                    <div className="bg-background p-1 rounded-md inline-block overflow-auto break-words shadow-lg">
                        <h3 className="text-white font-semibold">Number of Dapps</h3>
                        <h3 className="text-3xl text-neutral-300">{userinfo && userinfo.apps.length}</h3>
                    </div>
                </div>
            </div>
        </div>             
    );

}

export default Userbar;