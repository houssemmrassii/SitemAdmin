import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.scss';
import logo from '../assets/images/Deliviofull.png';
import { FaTachometerAlt, FaShoppingCart, FaUserFriends, FaCogs, FaUtensils,FaTag ,FaUser} from 'react-icons/fa';
import { BsBasket3Fill } from "react-icons/bs";
import { RiEBike2Fill } from "react-icons/ri";
import { TiGroup } from "react-icons/ti";
import { PiSealPercentFill } from "react-icons/pi";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { RiHome2Fill } from "react-icons/ri";

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const toggleMenu = (menu: string) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <img src={logo} alt="Logo" className="logo" />
                <button className="collapse-button" onClick={toggleSidebar}>
                    {isCollapsed ? '>' : '<'}
                </button>
            </div>
            <div className="sidebar-menu">
                <ul>
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <RiHome2Fill className="icon" />
                            <span>Tableau de bord</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <TbLayoutDashboardFilled className="icon" />
                        <span> Ma Boutique</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <BsBasket3Fill className="icon" />
                        <span>Commandes</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/delivery-men" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <RiEBike2Fill className="icon" />
                        <span>Livreurs</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/ClientList" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <TiGroup className="icon" />
                            <span>Clients</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/PromoCodeManagement" className={({ isActive }) => (isActive ? 'active' : '')}>
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
