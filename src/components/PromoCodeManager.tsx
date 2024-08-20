import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './PromoCodeManager.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Container, Typography, Button, IconButton } from '@mui/material';


type PromoCode = {
    appellation: string;
    code: string;
    createdAt: string;
    discount: number;
    finishedAt: string;
    id: string;
    nbruser: number;
    tag: string;
    users: string[];
};

const PromoCodeManager: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentPromoId, setCurrentPromoId] = useState<string | null>(null);
  const [promoData, setPromoData] = useState<Partial<PromoCode>>({
    appellation: '',
    code: '',
    createdAt: '',
    discount: 0,
    finishedAt: '',
    nbruser: 0,
    tag: '',
    users: []
  });

  useEffect(() => {
    const fetchPromoCodes = async () => {
      const promoCodeCollection = collection(db, 'promoCode');
      const promoCodeSnapshot = await getDocs(promoCodeCollection);
      const promoCodeList = promoCodeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PromoCode[];
      setPromoCodes(promoCodeList);
    };

    fetchPromoCodes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPromoData({ ...promoData, [name]: value });
  };

  const validateDate = (date: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { createdAt, finishedAt } = promoData;

    if (!validateDate(createdAt as string) || !validateDate(finishedAt as string)) {
      alert('Veuillez entrer une date valide au format JJ/MM/AAAA.');
      return;
    }

    if (isEditing && currentPromoId) {
      const promoDocRef = doc(db, 'promoCode', currentPromoId);
      await updateDoc(promoDocRef, promoData as PromoCode);
      alert('Code promo mis à jour avec succès');
    } else {
      await addDoc(collection(db, 'promoCode'), promoData);
      alert('Code promo ajouté avec succès');
    }

    setPromoData({
      appellation: '',
      code: '',
      createdAt: '',
      discount: 0,
      finishedAt: '',
      nbruser: 0,
      tag: '',
      users: []
    });
    setIsEditing(false);
    setCurrentPromoId(null);
    const fetchPromoCodes = async () => {
      const promoCodeCollection = collection(db, 'promoCode');
      const promoCodeSnapshot = await getDocs(promoCodeCollection);
      const promoCodeList = promoCodeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PromoCode[];
      setPromoCodes(promoCodeList);
    };
    fetchPromoCodes();
  };
  const navigate = useNavigate();
  const handleEdit = (promo: PromoCode) => {
    setIsEditing(true);
    setCurrentPromoId(promo.id);
    setPromoData(promo);
    navigate('/AjoutPromoCode', { state: { promo } });
};

  const handleDelete = async (id: string) => {
    const promoDocRef = doc(db, 'promoCode', id);
    await deleteDoc(promoDocRef);
    alert('Code promo supprimé avec succès');
    setPromoCodes(promoCodes.filter(promo => promo.id !== id));
  };

  return (
    <div className="promo-code-manager">
        <div>
        <h3>Codes promo</h3>
        <Link to="/AjoutPromoCode"><a className='Ajouter'><button className='ajouter'> + &nbsp;  Ajouter CodePromo </button> </a></Link>
        </div>
        <div className='table-container'>
      <table className="promo-table">
        <thead>
          <tr>
            <th>Appellation</th>
            <th>Code</th>
            <th>Date de création</th>
            <th>Remise</th>
            <th>Date d'expiration</th>
            <th>Utilisateurs</th>
            <th>Tag</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {promoCodes.map(promo => (
            <tr key={promo.id}>
              <td>{promo.appellation}</td>
              <td>{promo.code}</td>
              <td>{promo.createdAt}</td>
              <td>{promo.discount} %</td>
              <td>{promo.finishedAt}</td>
              <td>{promo.nbruser}</td>
              <td>{promo.tag}</td>
              <td>
                <FaEdit onClick={() => handleEdit(promo) } className="promo-edit"  />
                <FaTrash onClick={() => handleDelete(promo.id)} className="promo-delete" />
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
  </div>
  );
};

export default PromoCodeManager;
