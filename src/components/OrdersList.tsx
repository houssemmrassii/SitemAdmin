import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton,Tooltip } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
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
        ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    setCurrentPage(1); // Reset to the first page on search
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
 
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
 
  // Pagination Logic
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
 
  const renderPagination = () => {
    const paginationItems = [];
 
    if (totalPages <= 1) return null;
 
    // First page
    paginationItems.push(
      <IconButton
        key={1}
        className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
        onClick={() => paginate(1)}
      >
        1
      </IconButton>
    );
 
    if (currentPage > 3) {
      paginationItems.push(<span key="start-ellipsis">...</span>);
    }
 
    // Pages around the current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      paginationItems.push(
        <IconButton
          key={i}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => paginate(i)}
        >
          {i}
        </IconButton>
      );
    }
 
    if (currentPage < totalPages - 2) {
      paginationItems.push(<span key="end-ellipsis">...</span>);
    }
 
    // Last page
    if (totalPages > 1) {
      paginationItems.push(
        <IconButton
          key={totalPages}
          className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
          onClick={() => paginate(totalPages)}
        >
          {totalPages}
        </IconButton>
      );
    }
 
    return paginationItems;
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
      <Typography variant="h4" gutterBottom style={{ marginTop: '20px' }}>
        Liste des commandes
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
        <Tooltip className='custom-tooltip' title="Exporter la liste des commandes en pdf" arrow>
        <Button id='exporter' variant="contained" className="export-button"> PDF </Button>
        </Tooltip>
      </div>
      <div className="table-container">
        <table className='order-table'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Prix</th>
              <th>Quantité</th>
              <th>Paiement</th>
              <th>Statut</th>
              <th>Suivi</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order, index) => (
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
        <IconButton
          className="pagination-button"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </IconButton>
        {renderPagination()}
        <IconButton
          className="pagination-button"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </IconButton>
      </div>
    </Container>
    </div>
  );
};
 
export default OrdersList;