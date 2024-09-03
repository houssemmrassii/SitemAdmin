import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton } from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import MyModalconf from './MyModalconf';
import './SStyle.css';
 
interface OrderItem {
  productName: string;
  quantity: number | null;
  productPrice: string;
  productImage: string;
}
 
interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: string;
  status?: string;
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
}
 
const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const [showModalconf, setShowModalconf] = useState<boolean>(false);
  const [orderIdToDelete, setOrderIdToDelete] = useState<string | null>(null); // State to track the order ID for deletion
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollection = collection(db, 'command');
        const ordersQuery = query(ordersCollection, orderBy('date', 'desc'));
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersList: Order[] = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            items: data.items,
            totalPrice: data.finalTotal,
            status: data.status || 'En attente',
            createdAt: data.date,
            shippingAddress: data.deliveryAddress.address,
            paymentMethod: data.paymentMethod,
          };
        });
        setOrders(ordersList);
        setFilteredOrders(ordersList);
      } catch (error) {
        setError('Échec du chargement des commandes');
      } finally {
        setLoading(false);
      }
    };
 
    fetchOrders();
  }, []);
 
  useEffect(() => {
    setFilteredOrders(
      orders.filter(order =>
        searchStatus === '' || (order.status && order.status.toLowerCase().includes(searchStatus.toLowerCase()))
      )
    );
  }, [searchStatus, orders]);
 
  const getStatusColor = (status?: string) => {
    if (!status) return 'black';
    switch (status.toLowerCase()) {
      case 'en cours':
        return 'green';
      case 'en attente':
        return 'gray';
      case 'annulé':
        return 'red';
      default:
        return 'black';
    }
  };
 
  const handleDeleteClick = (orderId: string) => {
    setOrderIdToDelete(orderId); // Set the order ID for deletion
    setShowModalconf(true); // Show the confirmation modal
  };
 
  const handleConfirmDelete = async () => {
    if (orderIdToDelete) {
      try {
        await deleteDoc(doc(db, 'command', orderIdToDelete));
        setOrders(orders.filter(order => order.id !== orderIdToDelete));
        setFilteredOrders(filteredOrders.filter(order => order.id !== orderIdToDelete));
        setOrderIdToDelete(null); // Reset the order ID after deletion
      } catch (error) {
        setError('Échec de la suppression de la commande');
      } finally {
        setShowModalconf(false); // Hide the confirmation modal
      }
    }
  };
 
  const handleCancelDelete = () => {
    setOrderIdToDelete(null); // Reset the order ID
    setShowModalconf(false); // Hide the confirmation modal
  };
 
  if (loading) {
    return <Typography>Chargement...</Typography>;
  }
 
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
 
  return (
    <div className='order-list'>
    <Container>
      <Typography variant="h4" gutterBottom>
        Liste des Commandes
      </Typography>
      <div className="search-export-container">
        <form className="form-search" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="name">
            <input
              type="text"
              placeholder="Rechercher ici..."
              className="search-input"
              name="name"
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
            />
          </fieldset>
          <div className="button-submit">
            <button type="submit" className="search-button">
              <i className="icon-search"></i>
            </button>
          </div>
        </form>
        <Button id='exporter' variant="contained" className="export-button">
          <i className="icon-file-text"></i>Exporter commandes
        </Button>
      </div>
      <div className="table-container">
        <table className='order-table'>
          <thead>
            <tr>
              <th>ID Commande</th>
              <th>Prix</th>
              <th>Quantité</th>
              <th>Paiement</th>
              <th>Statut</th>
              <th>Suivi</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={order.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>{order.id}</td>
                <td>{order.totalPrice} €</td>
                <td>{order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)}</td>
                <td>{order.paymentMethod}</td>
                <td style={{ color: getStatusColor(order.status) }}>{order.status || 'En attente'}</td>
                <td>
                  <Button id='exporter' variant="outlined" className="tracking-button">Suivi</Button>
                </td>
                <td>
                  <IconButton className="action-buttonS" onClick={() => navigate(`/orders/${order.id}`)}>
                    <Visibility />
                  </IconButton>
                  <IconButton
                    className="action-buttonS delete-button"
                    onClick={() => handleDeleteClick(order.id)}
                  >
                    <Delete />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-container">
        <IconButton className="pagination-button">&lt;</IconButton>
        <IconButton className="pagination-button active">1</IconButton>
        <IconButton className="pagination-button">2</IconButton>
        <IconButton className="pagination-button">3</IconButton>
        <IconButton className="pagination-button">&gt;</IconButton>
      </div>
     
      {/* Confirmation Modal */}
      <MyModalconf
        showconf={showModalconf}
        handleCloseconf={handleCancelDelete}
        handleConfirmconf={handleConfirmDelete}
      />
    </Container>
    </div>
  );
};
 
export default OrdersList;