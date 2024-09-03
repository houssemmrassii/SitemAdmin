import React, { useEffect, useState } from 'react';
import { Container, Typography, IconButton } from '@mui/material';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import './SStyle.css'; // Import the CSS file

interface Notification {
  id: string;
  clientName: string;
  productName: string;
  isViewed: boolean;
  timestamp: string;
  type: string;
}

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;
  const [unreadCount, setUnreadCount] = useState<number>(0); // State for unread count

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:3008/api/notifications');
        setNotifications(response.data);

      } catch (error) {
        console.error('Erreur lors de la récupération des notifications :', error);
      }
    };

    const setupSocket = () => {
      const socket: Socket = io('http://localhost:3008');

      socket.on('reviewNotification', (data: Notification) => {
        console.log('Nouvelle notification reçue:', data);
        setNotifications(prevNotifications => {
          const updatedNotifications = [...prevNotifications, data];
          updateUnreadCount(updatedNotifications); // Update unread count on new notification
          console.log(unreadCount)
          return updatedNotifications;
        });
      });

      return () => {
        socket.off('reviewNotification');
        socket.disconnect();
      };
    };

    fetchNotifications(); 
    const cleanupSocket = setupSocket();

    return cleanupSocket;
  }, []);

  // Function to update unread notification count
  const updateUnreadCount = (notifications: Notification[]) => {
    const unreadNotifications = notifications.filter(notification => !notification.isViewed);
    setUnreadCount(unreadNotifications.length);
  };

  const indexOfLastNotification = currentPage * itemsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - itemsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className='notif'>
    <Container>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <div className="table-container">
        <table className='order-table'>
          <tbody>
            {currentNotifications.map((notification, index) => {
              if (notification.type === 'review') {
                return (
                  <tr key={index} className={index % 2 === 0 ? 'odd-row' : 'even-row'}>
                    <td>
                      <strong>{notification.clientName}</strong> a laissé un avis pour le produit <strong>{notification.productName}</strong>
                    </td>
                  </tr>
                );
              } else if (notification.type === 'commande') {
                return (
                  <tr key={index} className={index % 2 === 0 ? 'odd-row' : 'even-row'}>
                    <td>
                      <strong>{notification.clientName}</strong> a passé une commande
                    </td>
                  </tr>
                );
              }
              return null;
            })}
          </tbody>
        </table>
      </div> 
      <div className="pagination-container">
        <IconButton
          className="pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </IconButton>
        {[1, 2, 3].map(page => (
          <IconButton
            key={page}
            className={`pagination-button ${page === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </IconButton>
        ))}
        <IconButton
          className="pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={indexOfLastNotification >= notifications.length}
        >
          &gt;
        </IconButton>
      </div>
    </Container>
    </div>
  );
};

export default NotificationList;
