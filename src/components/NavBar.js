import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-white.svg';
import icon from '../assets/icon.png';

const Sidebar = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const menuItem = [
    {
        path: "/",
        name: "Wallet",
        icon: <span className="material-icons-outlined">account_balance_wallet</span>
    },
    {
        path: "/manage-dapp",
        name: "Manage Dapp",
        icon: <span className="material-icons-outlined">settings</span>
    }, 
    {
        path: "/name-setup",
        name: "Name Setup",
        icon: <span class="material-symbols-outlined">person</span>
    }
];

    return (
        <div className={`${open ? "w-full fixed h-full" : "w-1/6"} h-screen flex md:w-1/5`}>
            <div className={`bg-overlay1 text-neutral-50 flex flex-col justify-between w-full h-full md:p-4`}>
                <div className='flex flex-col gap-16 text-lg'>
                    <div>
                        <div className="w-full">
                            <div onClick={() => navigate("/")}className="cursor-pointer"><h1 className={`hidden md:block text-2xl font-semibold p-1`}>iExec Dapp Manager</h1></div>
                            {!open && <div onClick={() => setOpen(true)}className="md:hidden justify-center text-center p-3 hover:bg-active hover:transition-all cursor-pointer"><span className="material-icons-outlined">menu</span></div>}
                            {open && <div onClick={() => setOpen(false)}className="md:hidden justify-center text-center p-3 hover:bg-active hover:transition-all cursor-pointer"><span className="material-icons-outlined">close</span></div>}
                        </div>
                    </div>
                    {
                    menuItem.map((item, index) => (
                    <NavLink to={item.path} key={index}>
                        <div onClick={() => setOpen(false)} className={`flex-1 flex rounded-md gap-5 justify-center md:justify-start p-4 hover:bg-active hover:transition-all hover:text-primary-100 transition dura`}>
                            <div className={`${open ? "p-0" : "p-3"}p-3 md:p-0 align-middle items-center justify-center`}>{item.icon}</div>
                            <div className={`${open ? "inline-block" : "hidden"} md:inline-block`}>{item.name}</div>
                        </div>
                    </NavLink>
                    ))
                    }  
                </div>
                <div>
                <p className="text-center font-bold hidden md:block">Powered by</p>
                <Link to="/"><img className="hidden md:block w-4/5" alt="logo" src={logo}/></Link>
                </div>
            </div>
        </div>             
    );

}

export default Sidebar;