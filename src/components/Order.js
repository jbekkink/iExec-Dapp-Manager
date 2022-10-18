import { useState, useEffect } from 'react';
import { NavLink, Link, useParams } from 'react-router-dom';
import {gql, useQuery, useSubscription} from '@apollo/client';
import {publishOrder, showOrderbook, unpublishOrder} from './iexecOrder';
import {uploadFailed, uploadSuccessful, loadingNotif, copyToClipBoard} from './Notifications';
import toast from 'react-hot-toast';

const GET_ORDERS = gql`
subscription getOrders($id: String){
    apps(where:{id: $id}) {
        usages(orderBy: timestamp, orderDirection: desc) {
            id
            timestamp
            app {
                id
                name
            }
            appPrice
        }
    }
}`;

//Shorten addresses to only display a few characters of the string
function Shorten(text) {
    return text.substring(0,6) + '..' + text.substring((text.length - 3), text.length);
}

const ManageDapp = (props) => {
    const appAddress = useParams().id;
    const [openOrder, setOpenOrder] = useState(true);
    const [usages, setUsages] = useState([]);
    const [display, setDisplay] = useState([]);
    const [price, setPrice] = useState(0);
    const [volume, setVolume] = useState(1);
    const [nftRestrict, setNftRestrict] = useState("0x0000000000000000000000000000000000000000");
    const [orderDisplay, setOrderDisplay] = useState(null);
    const [filled, setFilled] = useState(false);
    const [filledNFTRestrict, setFilledNFTRestrict] = useState("0x0000000000000000000000000000000000000000");


    async function update() {
        let list = []
        for(let i = 0; i < usages.length; i++) {
            list.push(
                <tr key={i}>
                    <td className="py-4 px-3">{new Date(usages[i].timestamp * 1000).toLocaleString()}</td>
                    <td className="py-4 px-3">{usages[i].appPrice}</td>
                    <td className="py-4 px-3 text-secondary-200" title={usages[i].app.id}><div className='flex items-center gap-1'>{Shorten(usages[i].app.id)} <span className="material-symbols-outlined text-neutral-100 cursor-pointer" title="Click to Copy!"  onClick={() => {copyText(usages[i].app.id)}}>content_copy</span></div></td>
                    <td className="py-4 px-3" title={usages[i].id}><div className='flex items-center gap-1'>{Shorten(usages[i].id)} <span className="material-symbols-outlined text-neutral-100 cursor-pointer" title="Click to Copy!" onClick={() => {copyText(usages[i].id)}}>content_copy</span></div></td>
                </tr>
            )
        }
        setDisplay(list);
    }

    function copyText(text) {
        copyToClipBoard('Copied to clipboard!');
        navigator.clipboard.writeText(text);
    }

    async function displayOpenOrders() {
        let order = [];
        const orders = await showOrderbook(props.iexec, appAddress, filledNFTRestrict)();
        console.log(filledNFTRestrict);
        for(let i =  0; i < orders.count; i++) {
            var date = new Date(orders.orders[i].publicationTimestamp).toLocaleString();
            order.push(
                <tr className="border-b border-b-form hover:bg-hover transition duration-200" key={i} title={`Restricted to: ${orders.orders[i].order.datasetrestrict}`}>
                    <td className="py-4 px-3">{date}</td>
                    <td className="py-4 px-3">{orders.orders[i].order.appprice}</td>
                    <td className="py-4 px-3">{orders.orders[i].order.volume}</td>
                    <td className="py-4 px-3">{orders.orders[i].remaining}</td>
                    <td className="py-4 px-3"><span className="text-red-400 font-semibold cursor-pointer"onClick={(e) =>UnpublishOrder(e, orders.orders[i].orderHash)}>unpublish</span></td>
                </tr>
            )
        }
        setOrderDisplay(order);
    }

    async function PublishOrder() {
        const orderHash = await publishOrder(props.iexec, appAddress, price, volume, nftRestrict)();
        if(orderHash) {
            uploadSuccessful('Order Published!');
            await displayOpenOrders();
        }
    }

    async function UnpublishOrder(e, orderHash) {
        e.preventDefault();
        try {
            await unpublishOrder(props.iexec, orderHash)();
            uploadSuccessful('Order Unpublished!');
            await displayOpenOrders();
        }
        catch(error) {
            uploadFailed('Could not unpublish order');
            console.error(error);
        }  
    }

    const sub = useSubscription(
        GET_ORDERS, 
        {variables: {
            id: appAddress,
        },
        onSubscriptionData: (data) => {
                const message = data.subscriptionData.data.apps[0].usages
                if(message.length === usages.length) {
                    return;
                }
                setUsages(message);
                
                if(usages.length === 0) {
                    return;
                }
                setFilled(true);
                
        }
    });

    const firstusage = !sub.loading && sub.data && sub.data.apps[0].usages;
    
    useEffect(() => {
        async function refresh() {
            await displayOpenOrders();
        }
        if(filled) {
            refresh();
            setFilled(false);
        }
    }, [filled]);

    useEffect(() => {
        if(firstusage === false) return;
        update();
        async function display() {
            await displayOpenOrders();
        }
        display();
    }, [firstusage]);

    function changeFilledNFTRestrict(e) {
        setFilledNFTRestrict(e.target.value);
        console.log(e.target.value);
        e.preventDefault();
    }

    return (
    <div className="p-4 flex-1 flex flex-col gap-10 text-primary-50 overflow-auto">
        <div className='flex flex-col gap-6'>
            <div className="flex flex-col-reverse lg:flex-row gap-6">             
                <div className="flex flex-col bg-overlay1 rounded-md p-3 lg:w-1/2 gap-1em">
                    <div className='text-xl font-bold border-b border-b-form px-3'>Create Order</div>
                    <div className="flex flex-wrap">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block text-neutral-200 text-md font-bold mb-2" for="price">Price</label>
                            <input className="appearance-none block w-full bg-form text-neutral-400 border border-neutral-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-white" id="price" type="number" placeholder={price} onChange={(e) => setPrice(e.target.value)}></input>
                        </div>
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block text-neutral-200 text-md font-bold mb-2" for="price">Volume</label>
                            <input className="appearance-none block w-full bg-form text-neutral-400 border border-neutral-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-white" id="volume" type="number" placeholder={volume}  onChange={(e) => setVolume(e.target.value)}></input>
                        </div>
                    </div>
                    <div className="w-full px-3 mb-6 md:mb-0">
                        <label className="block text-neutral-200 text-md font-bold mb-2" for="price">NFT Restrict</label>
                        <input className="appearance-none block w-full bg-form text-neutral-400 border border-neutral-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-white" id="restrict" type="text" placeholder={nftRestrict}  onChange={(e) => setNftRestrict(e.target.value)}></input>
                    </div>
                    <div className="w-full px-3 flex justify-center items-center">
                        <button className="bg-yellow font-semibold text-neutral-900 rounded-md w-full px-4 py-3 hover:bg-secondary-200 transition duration-500" onClick={PublishOrder}>Publish Order</button>
                    </div>
                </div>

                <div className="flex flex-col lg:w-1/2 gap-6">
                    <div className="text-center bg-overlay1 flex flex-col gap-6 text-md rounded-md p-3 mb-6 md:mb-0">
                        <div className='text-xl font-bold border-b border-b-form px-3'>Address</div>
                        <div className='flex justify-center text-center'>
                            <div className="px-3 text-yellow">{appAddress}</div>
                            <span className="material-symbols-outlined text-neutral-100 cursor-pointer" title="Click to Copy!"  onClick={() => {copyText(appAddress)}}>content_copy</span>
                        </div>
                    </div>
                    <div className="text-center bg-overlay1 flex flex-col gap-4 text-md rounded-md p-3">
                            <h1 className="text-xl border-b border-b-form text-left font-bold">Renting your Dapps</h1>
                            <p className='text-md leading-relaxed bg-form p-2 rounded-md justify-center items-center align-middle text-left'>By publishing a Dapp order, you will be able to rent your Dapps to other users. Dapps can be traded on the iExec Marketplace. Whenever
                                a user on the iExec Marketplace rents your Dapp, you will get paid in RLC. You can select which NFTs can be used by the Dapp by setting 'NFT Restrict'. Leave it to 0x00.. if all NFTs may be used. 
                            </p>
                    </div>
                                        
                </div>
            </div>
            <div className="flex gap-6">
                <div className="flex flex-col bg-overlay1 rounded-md p-3 mb-6 w-full gap-1em overflow-x-scroll">
                        <div className='flex border-b border-b-form text-left gap-6 font-bold'>
                            <div className={`${openOrder ? "text-secondary-200" : "text-neutral-400"} cursor-pointer`} onClick={() => setOpenOrder(true)}>Open Orders</div>
                            <div className={`${!openOrder ? "text-secondary-200" : "text-neutral-400"} cursor-pointer`} onClick={() => setOpenOrder(false)}>Filled Orders</div>
                        </div>
                        {!openOrder && <table className="table-auto">
                            <thead className="px-3 text-xs font-bold text-neutral-200 rounded-md bg-form text-left">
                                <tr>
                                    <th scope="col" className="text-sm font-medium px-3 py-3">Time</th>
                                    <th scope="col" className="text-sm font-medium px-3 py-3">Price</th>
                                    <th scope="col" className="text-sm font-medium px-3 py-3">Dapp</th>
                                    <th scope="col" className="text-sm font-medium px-3 py-3">Deal ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {display}
                            </tbody>
                        </table>}
                        {openOrder && <table className="table-auto">
                        <thead className="px-3 text-xs font-bold text-neutral-200 rounded-md bg-form text-left">
                            <tr>
                                <th scope="col" className="text-sm font-medium px-3 py-3">Time</th>
                                <th scope="col" className="text-sm font-medium px-3 py-3 ">Price</th>
                                <th scope="col" className="text-sm font-medium px-3 py-3">Volume</th>
                                <th scope="col" className="text-sm font-medium px-3 py-3 ">Remaining</th>
                                <th scope="col" className="text-sm font-medium px-3 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderDisplay}
                        </tbody>
                    </table>}
                    {openOrder && <div className="">
                    <label>Include orders for NFT:</label>
                        <div className='w-1/2'>
                            <input className="appearance-none block w-full bg-form text-neutral-400 border border-neutral-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-white" id="restrict" type="text" name="nftRestrict" placeholder={filledNFTRestrict} onChange={(e) => changeFilledNFTRestrict(e)}/>
                            <button className="bg-yellow font-semibold text-neutral-900 rounded-md w-full px-4 py-3 hover:bg-secondary-200 transition duration-500"  onClick={async () => displayOpenOrders()}>View</button>
                        </div>
                    </div>}
                    </div>
            </div>

        </div>
    </div>
    );

}

export default ManageDapp;