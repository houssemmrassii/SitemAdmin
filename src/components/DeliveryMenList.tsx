import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton, Tooltip} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
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
        setFilteredDeliveryMen(deliveryMenList);
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
      const updatedList = deliveryMen.filter(man => man.id !== id);
      setDeliveryMen(updatedList);
      setFilteredDeliveryMen(updatedList); 
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
    setCurrentPage(1); 
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const indexOfLastDeliveryMan = currentPage * itemsPerPage;
  const indexOfFirstDeliveryMan = indexOfLastDeliveryMan - itemsPerPage;
  const currentDeliveryMen = filteredDeliveryMen.slice(indexOfFirstDeliveryMan, indexOfLastDeliveryMan);
  const totalPages = Math.ceil(filteredDeliveryMen.length / itemsPerPage);

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <div className='delivery-men'>
    <Container>
    <h3>Liste des livreurs</h3>
      <div className="search-export-container">
        <form className="form-search" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="name">
            <input
              type="text"
              placeholder="Rechercher ici..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
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
        <Tooltip className='custom-tooltip' title="Ajouter un nouveau livreur" arrow>
          <Button
            id='exporter'
            variant="contained"
            className="add-buttons"
            onClick={() => navigate('/delivery-men/new')}
          >
            + Livreur
          </Button>
          </Tooltip>
          <Tooltip className='custom-tooltip' title="Exporter la liste des livreurs en pdf" arrow>
          <Button
            id='exporter'
            variant="contained"
            className="export-button"
            onClick={() => navigate('/')}
          > PDF
          </Button>
          </Tooltip>
        </div>
      </div>
      <div className="table-container">
        <table className="delivery-men-table">
          <thead>
            <tr className="table-title">
              <th>Image</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentDeliveryMen.map((deliveryMan, index) => (
              <tr key={deliveryMan.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>
                  <img src={deliveryMan.photo} alt={deliveryMan.name} className="delivery-man-photo" />
                </td>
                <td>{deliveryMan.name}</td>
                <td>{deliveryMan.email}</td>
                <td>{deliveryMan.phoneNumber}</td>
                <td>
                  <IconButton className="action-button" onClick={() => navigate(`/delivery-men/${deliveryMan.id}`)}>
                    <Visibility />
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

      {/* Pagination */}
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
    </Container>
    </div>
  );
};

export default DeliveryMenList;
