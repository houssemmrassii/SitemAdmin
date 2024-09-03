import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.scss';
import logo from '../assets/images/Deliviofull.png';
import { FaStoreAlt } from 'react-icons/fa';
import { RiHome2Fill } from 'react-icons/ri';
import { BsBasket3Fill } from 'react-icons/bs';
import { RiEBike2Fill } from 'react-icons/ri';
import { TiGroup } from 'react-icons/ti';
import { PiSealPercentFill } from 'react-icons/pi';
import { TbLayoutDashboardFilled } from 'react-icons/tb';

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };
    const [isSmallScreen, setIsSmallScreen] = React.useState(false);

    React.useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth <= 785);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);
    const logoStyle = {
        maxWidth: isSmallScreen ? '100px' : '200px',
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <img 
                src={logo} 
                alt="Logo" 
                className="logo" 
                style={{ 
                    maxWidth: isSmallScreen ? '200px' : '300px', 
                    marginRight: isSmallScreen ? '-190px' : '0' 
                  }}   />
            <div className="sidebar-menu">
                <ul>
                    <li>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <RiHome2Fill className="icon" />
                            <span>Tableau de bord</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/products"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <TbLayoutDashboardFilled className="icon" />
                            <span>Ma Boutique</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/restaurants"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <FaStoreAlt className="icon" />
                            <span>Restaurants</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/orders"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <BsBasket3Fill className="icon" />
                            <span>Commandes</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/delivery-men"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <RiEBike2Fill className="icon" />
                            <span>Livreurs</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/ClientList"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <TiGroup className="icon" />
                            <span>Clients</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/PromoCodeManagement"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <PiSealPercentFill className="icon" />
                            <span>Codes Promo</span>
                        </NavLink>
                    </li>
                
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
