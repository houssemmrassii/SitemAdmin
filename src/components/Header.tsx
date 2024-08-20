import React, { useState, useEffect } from 'react';
import { FaSearch, FaBell, FaEnvelope, FaUserCircle, FaCog, FaSignOutAlt, FaExpand } from 'react-icons/fa';
import './Header.scss';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Header: React.FC = () => {
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [unviewedCount, setUnviewedCount] = useState<number>(0);

    const toggleAdminMenu = () => {
        setIsAdminMenuOpen(!isAdminMenuOpen);
    };

    interface Notification {
        id: string;
        clientName: string;
        productName: string;
        isViewed: boolean;
        timestamp: string;
        type: string;
    }

    useEffect(() => {
        const countUnviewedNotifications = async () => {
            try {
                // Create a query to get notifications where isViewed is false
                const q = query(collection(db, 'notif'), where('isViewed', '==', false));
        
                // Execute the query
                const querySnapshot = await getDocs(q);
                
                // Count the number of documents returned by the query
                const count = querySnapshot.size;
        
                setUnviewedCount(count);
            } catch (error) {
                console.error('Error counting unviewed notifications:', error);
            }
        };

        countUnviewedNotifications();
    }, []);

    const handleNotificationClick = async () => {
        navigate('/Notification');
    
        try {
            const notificationsRef = collection(db, 'notif');
            const q = query(notificationsRef, where('isViewed', '==', false));
            const querySnapshot = await getDocs(q);
    
            for (const documentSnapshot of querySnapshot.docs) {
                const docRef = doc(db, 'notif', documentSnapshot.id);
                await updateDoc(docRef, { isViewed: true });
            }
    
            setUnviewedCount(0); 
        } catch (error) {
            console.error('Error updating notifications:', error);
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="search-bar">
                    <input type="text" placeholder="Recherchez ici..." />
                    <FaSearch className="search-icon" />
                </div>
            </div>
            <div className="header-right">
                <FaBell
                    className="header-icon notification"
                    onClick={handleNotificationClick}
                />
                <div className='header-icon notif-test'>{unviewedCount}</div>
                <FaEnvelope className="header-icon notification" />
                <FaExpand className="header-icon" />
                <div className="admin" onClick={toggleAdminMenu}>
                    <FaUserCircle className="header-icon admin-icon" />
                    <span className="admin-name">Admin</span>
                    <span className="admin-role"></span>
                </div>
                {isAdminMenuOpen && (
                    <div className="admin-menu">
                        <ul>
                            <li><FaUserCircle /> Compte</li>
                            <li><FaEnvelope /> Boîte de Réception <span className="badge">27</span></li>
                            <li><FaCog /> Paramètres</li>
                            <li><FaSignOutAlt /> Déconnexion</li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
