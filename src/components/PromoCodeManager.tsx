import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './PromoCodeManager.css';
import { useNavigate } from 'react-router-dom';
import { Edit, Delete } from '@mui/icons-material';
import { Container, Typography, Button, IconButton, Tooltip} from '@mui/material';

type PromoCode = {
    appellation: string;
    code: string;
    createdAt: Date;
    discount: number;
    finishedAt: string;
    id: string;
    nbruser: number;
    tag: string;
    users: string[];
};
 
const PromoCodeManager: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
 
  useEffect(() => {
    fetchPromoCodes();
  }, []);
 
  const fetchPromoCodes = async () => {
    const promoCodeCollection = collection(db, 'promoCode');
    const promoCodeSnapshot = await getDocs(promoCodeCollection);
    const promoCodeList = promoCodeSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: new Date(doc.data().createdAt) // Convert to Date object
    })) as PromoCode[];
 
    // Sort promo codes by creation date (most recent first)
    setPromoCodes(promoCodeList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };
 
  const handleDelete = async (id: string) => {
    const promoDocRef = doc(db, 'promoCode', id);
    await deleteDoc(promoDocRef);
    alert('Code promo supprimé avec succès');
    setPromoCodes(promoCodes.filter(promo => promo.id !== id));
  };
 
  const handleEdit = (promo: PromoCode) => {
    navigate('/AjoutPromoCode', { state: { promo } });
  };
 
  // Pagination Logic
  const indexOfLastPromo = currentPage * itemsPerPage;
  const indexOfFirstPromo = indexOfLastPromo - itemsPerPage;
  const currentPromos = promoCodes.slice(indexOfFirstPromo, indexOfLastPromo);
 
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
 
  return (
    <div className="promo-code-manager">
        <h3>Liste des codes promo</h3>
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
        <div className="add-buttons">
        <Tooltip className='custom-tooltip' title="Ajouter un nouveau code promo" arrow>
        <Button
          id="exporter"
          variant="contained"
          className="add-button"
          onClick={() => navigate('/AjoutPromoCode')}
        > Ajouter </Button>
        </Tooltip>
        </div>
      </div>
      <div className="table-container">
        <table className="promo-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Date de création</th>
              <th>Remise</th>
              <th>Date d'expiration</th>
              <th>Utilisateurs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPromos.map(promo => (
              <tr key={promo.id}>
                <td>{promo.code}</td>
                <td>{promo.createdAt.toLocaleString('fr-FR')}</td>
                <td>{promo.discount} %</td>
                <td>{promo.finishedAt}</td>
                <td>{promo.nbruser}</td>
                <td>
                  <IconButton onClick={() => handleEdit(promo)} className="promo-edit">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(promo.id)} className="promo-delete">
                    <Delete />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-container">
        {[...Array(Math.ceil(promoCodes.length / itemsPerPage)).keys()].map(number => (
          <IconButton
            key={number + 1}
            className={`pagination-button ${currentPage === number + 1 ? 'active' : ''}`}
            onClick={() => paginate(number + 1)}
          >
            {number + 1}
          </IconButton>
        ))}
      </div>
    </div>
  );
};
 
export default PromoCodeManager;