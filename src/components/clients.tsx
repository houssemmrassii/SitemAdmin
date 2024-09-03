import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Container, Typography, Button, IconButton, Dialog,Tooltip, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemAvatar, ListItemText, Avatar } from '@mui/material';
import { Visibility, Lock, LockOpen } from '@mui/icons-material'; 
import { getAuth, deleteUser } from 'firebase/auth';
import { db } from '../firebaseConfig';
import './DeliveryMenList.css';
import './clients.css';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
 
interface OrderItem {
  productCategory: string;
  productDescription: string;
  productId: string;
  productImage: string;
  productName: string;
  productPrice: number;
  productSpecCategory: string;
  quantity: number;
}
 
interface Order {
  deliveryAddress: string;
  deliveryCost: number;
  discount: number;
  finalTotal: number;
  id: string;
  items: OrderItem[];
  paymentMethod: string;
  timestamp: string;
  tip: number;
  total: number;
  date: string;
}
 
interface Client {
  id: string;
  email: string;
  name: string;
  password: string;
  phoneNumber: number;
  uid: string;
  blocked: boolean;
  historiqueCommandes: Order[];
}
 
const OrderHistory: React.FC<{ historiqueCommandes: Order[] }> = ({ historiqueCommandes }) => (
  <div className="order-history">
    {historiqueCommandes.length === 0 ? (
      <Typography>Aucune commande trouvée.</Typography>
    ) : (
      historiqueCommandes.map(order => (
        <div key={order.id} className="order-item" style={{ marginBottom: '20px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" style={{ marginBottom: '10px' }}>ID de Commande: {order.id}</Typography>
          <Typography>Date: {new Date(order.date).toLocaleDateString('fr-FR')} {new Date(order.date).toLocaleTimeString('fr-FR')}</Typography>
          <Typography>Total: {order.total.toFixed(2)} €</Typography>
          <Typography style={{ marginTop: '10px' }}>Articles:</Typography>
          <List>
            {order.items.map(item => (
              <ListItem key={item.productId} style={{ padding: '8px 0' }}>
                <ListItemAvatar>
                  <Avatar variant="square" src={item.productImage} alt={item.productName} style={{ width: '60px', height: '60px', marginRight: '10px' }} />
                </ListItemAvatar>
                <ListItemText
                  primary={item.productName}
                  secondary={`${item.productPrice.toFixed(2)} € x ${item.quantity}`}
                />
              </ListItem>
            ))}
          </List>
        </div>
      ))
    )}
  </div>
);
 
const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientOrders, setSelectedClientOrders] = useState<Order[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1); // For pagination
  const itemsPerPage = 10; // Number of clients to show per page
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientCollection = collection(db, 'clients');
        const clientSnapshot = await getDocs(clientCollection);
        const clientList: Client[] = clientSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Client, 'id'>),
          historiqueCommandes: (doc.data() as Client).historiqueCommandes || [] // Ensure orderHistory is included
        }));
        setClients(clientList);
      } catch (error) {
        setError('Échec du chargement des clients.');
      } finally {
        setLoading(false);
      }
    };
 
    fetchClients();
  }, []);
 
  const handleBlock = async (id: string, blocked: boolean) => {
    try {
      const clientRef = doc(db, 'clients', id);
      await updateDoc(clientRef, { blocked: !blocked });
 
      // Update the client state locally
      setClients(clients.map(client =>
        client.id === id ? { ...client, blocked: !blocked } : client
      ));
    } catch (error) {
      console.error('Erreur lors du blocage/déblocage du client:', error);
      alert('Échec de la mise à jour du statut du client.');
    }
  };
 
  const handleDelete = async (id: string, uid: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
 
      // Delete the client document from Firestore
      await deleteDoc(doc(db, 'clients', id));
 
      // If current user is being deleted, sign out
      if (user && user.uid === uid) {
        await deleteUser(user);
        await auth.signOut();
      }
 
      // Remove the client from the local state
      setClients(clients.filter(client => client.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du client et de l\'utilisateur Firebase Auth:', error);
      let errorMessage = 'Échec de la suppression du client et de l\'utilisateur associé.';
      if (error instanceof Error) {
        errorMessage += ` Détails de l'erreur: ${error.message}`;
      } else {
        errorMessage += ' Une erreur inconnue est survenue.';
      }
      alert(errorMessage);
    }
  };
 
  const handleShowHistory = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClientOrders(client.historiqueCommandes);
      setSelectedClientId(clientId);
      setShowHistory(true);
    }
  };

  const indexOfLastClient = currentPage * itemsPerPage;
  const indexOfFirstClient = indexOfLastClient - itemsPerPage;
  const currentClients = clients.slice(indexOfFirstClient, indexOfLastClient);
 
  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
 
  if (loading) {
    return <Typography>Chargement...</Typography>;
  }
 
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
 
  const sortedClients = [...clients].sort((a, b) => (a.blocked === b.blocked ? 0 : a.blocked ? 1 : -1));
 
  return (
    <div className='client-list'>
    <Container>
    <h3>Liste des clients</h3>
      <div className="search-export-container">
        <form className="form-search" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="name">
            <input
              type="text"
              placeholder="Rechercher ici..."
              className="search-input"
              name="name"
            />
          </fieldset>
          <div className="button-submit">
            <button type="submit" className="search-button">
              <i className="icon-search"></i>
            </button>
          </div> 
        </form>
        <Tooltip className='custom-tooltip' title="Exporter la liste des clients en pdf" arrow>
          <Button
          id='exporter'
          variant="contained"
          className="export-button"
          onClick={() => navigate('/')} >
          PDF
        </Button>
       </Tooltip> 
      </div>
      <div className="table-container">
        <table id='tab' className='delivery-men-table'>
          <thead>
            <tr className="table-title">
              <th>Nom</th>
              <th>Mail</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Historique</th> 
            </tr>
          </thead>
          <tbody>
            {currentClients.map((client, index) => (
              <tr key={client.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>{client.phoneNumber}</td>
                <td>
                <IconButton
                  onClick={() => handleBlock(client.id, client.blocked)}
                  style={{ color: client.blocked ? 'red' : '#FF965A', fontSize: '20px' }} 
                >
                  {client.blocked ? <Lock style={{ fontSize: '20px' }} /> : <LockOpen style={{ fontSize: '20px' }} />}
                </IconButton>
                </td>
                <td>
                  <IconButton className="action-button" onClick={() => handleShowHistory(client.id)}>
                    <Visibility />
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
        {[...Array(totalPages)].map((_, index) => (
          <IconButton
            key={index + 1}
            className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </IconButton>
        ))}
        <IconButton
          className="pagination-button"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </IconButton>
      </div>
 
      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        PaperProps={{
          style: {
            width: '50vw',
            maxWidth: 'none',
            padding: '20px',
            borderRadius: '10px', 
          },
        }}
      >
        <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>Historique des Commandes</DialogTitle>
        <DialogContent>
          <OrderHistory historiqueCommandes={selectedClientOrders} />
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <Button onClick={() => setShowHistory(false)} variant="contained" style={{ backgroundColor: '#FF965A', color: 'white' }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </div>
  );
};
 
export default ClientList;