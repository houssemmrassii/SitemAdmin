import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './SStyle.css'; // Import the CSS file

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
  status?: string;  // Make status optional
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollection = collection(db, 'command');
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersList: Order[] = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            items: data.items,
            totalPrice: data.finalTotal.toFixed(2),
            status: data.status || 'En attente',
            createdAt: data.createdAt,
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

  const handleDelete = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'command', orderId));
      setOrders(orders.filter(order => order.id !== orderId));
      setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
    } catch (error) {
      setError('Échec de la suppression de la commande');
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
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
            <IconButton className="action-buttonS">
              <Edit />
            </IconButton>
            <IconButton className="action-buttonS delete-button" onClick={() => handleDelete(order.id)}>
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
    </Container>
  );
};

export default OrdersList;
