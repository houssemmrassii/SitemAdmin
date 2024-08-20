import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './DeliveryMenList.css';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface DeliveryMan {
  id: string;
  email: string;
  name: string;
  password: string;
  phoneNumber: number;
  photo: string;
}

const DeliveryMenList: React.FC = () => {
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [filteredDeliveryMen, setFilteredDeliveryMen] = useState<DeliveryMan[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeliveryMen = async () => {
      try {
        const deliveryMenCollection = collection(db, 'deliveryMen');
        const deliveryMenSnapshot = await getDocs(deliveryMenCollection);
        const deliveryMenList: DeliveryMan[] = deliveryMenSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DeliveryMan[];
        setDeliveryMen(deliveryMenList);
        setFilteredDeliveryMen(deliveryMenList); // Initially, all delivery men are displayed
      } catch (error) {
        setError('Échec de la récupération des livreurs');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryMen();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'deliveryMen', id));
      setDeliveryMen(deliveryMen.filter(man => man.id !== id));
      setFilteredDeliveryMen(filteredDeliveryMen.filter(man => man.id !== id)); // Update filtered list as well
    } catch (error) {
      console.error('Erreur lors de la suppression du livreur:', error);
      alert('Échec de la suppression du livreur');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);

    if (event.target.value === '') {
      setFilteredDeliveryMen(deliveryMen);
    } else {
      const filtered = deliveryMen.filter(man =>
        man.name.toLowerCase().includes(event.target.value.toLowerCase())
      );
      setFilteredDeliveryMen(filtered);
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
      <div className="search-export-container">
        <form className="form-search" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="name">
            <input
              type="text"
              placeholder="Rechercher ici..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch} // Handle search input change
              name="name"
            />
          </fieldset>
          <div className="button-submit">
            <button type="submit" className="search-button">
              <i className="icon-search"></i>
            </button>
          </div>
        </form>
        <div className="add-buttons">
          <Button
            id='exporter'
            variant="contained"
            className="add-buttons"
            onClick={() => navigate('/delivery-men/new')}
          >
            + Livreur
          </Button>
          <Button
            id='exporter'
            variant="contained"
            className="export-button"
            onClick={() => navigate('/')}
            startIcon={<PictureAsPdfIcon />}
          />
        </div>
      </div>
      <div className="table-container">
        <table className="delivery-men-table">
          <thead>
            <tr className="table-title">
              <th>Photo</th>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Numéro de Téléphone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveryMen.map((deliveryMan, index) => (
              <tr key={deliveryMan.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>
                  <img src={deliveryMan.photo} alt={deliveryMan.name} className="delivery-man-photo" />
                </td>
                <td>{deliveryMan.id}</td>
                <td>{deliveryMan.name}</td>
                <td>{deliveryMan.email}</td>
                <td>{deliveryMan.phoneNumber}</td>
                <td>
                  <IconButton className="action-button" onClick={() => navigate(`/delivery-men/${deliveryMan.id}`)}>
                   
                  </IconButton>
                  <IconButton className="action-button" onClick={() => navigate(`/delivery-men/edit/${deliveryMan.id}`)}>
                    <Edit />
                  </IconButton>
                  <IconButton className="action-button delete-button" onClick={() => handleDelete(deliveryMan.id)}>
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

export default DeliveryMenList;
