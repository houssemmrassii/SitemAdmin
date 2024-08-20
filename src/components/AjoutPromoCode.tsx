import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './PromoCodeManager.css';
import { useLocation, useNavigate } from 'react-router-dom';

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

const AjoutPromoCode: React.FC = () => {
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

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.promo) {
      const promo = location.state.promo as PromoCode;
      setIsEditing(true);
      setCurrentPromoId(promo.id);
      setPromoData(promo);
    }
  }, [location.state]);

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

    // Définir la date actuelle dans le champ createdAt au format désiré
    const currentDate = formatDateAndTime(new Date());
    setPromoData(prevData => ({ ...prevData, createdAt: currentDate }));
  }, []);

  const formatDateAndTime = (date: Date) => {
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
  };

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

    if (!validateDate(finishedAt as string)) {
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
    navigate('/PromoCodeManagement');
  };

  const handleDelete = async (id: string) => {
    const promoDocRef = doc(db, 'promoCode', id);
    await deleteDoc(promoDocRef);
    alert('Code promo supprimé avec succès');
    setPromoCodes(promoCodes.filter(promo => promo.id !== id));
  };

  return (
    <div className="promo-code-manager">
      <h2 id='section-2'>Gestion Code Promo</h2>
      <form onSubmit={handleSubmit} className="promo-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="appellation">Appellation</label>
            <input
              id="appellation"
              name="appellation"
              placeholder="Appellation du code promo"
              value={promoData.appellation || ''}
              onChange={handleChange}
              className="promo-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="code">Code</label>
            <input
              id="code"
              name="code"
              placeholder="Code unique"
              value={promoData.code || ''}
              onChange={handleChange}
              className="promo-input"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="createdAt">Date de création</label>
            <input
              id="createdAt"
              name="createdAt"
              placeholder="Date de création (JJ/MM/AAAA, HH:MM:SS)"
              value={promoData.createdAt || ''}
              onChange={handleChange}
              className="promo-input"
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="discount">Remise (%)</label>
            <input
              id="discount"
              name="discount"
              placeholder="Remise en pourcentage"
              type="number"
              value={promoData.discount || ''}
              onChange={handleChange}
              className="promo-input"
              min="0"
              max="100"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="finishedAt">Date d'expiration</label>
            <input
              id="finishedAt"
              name="finishedAt"
              placeholder="Date d'expiration (JJ/MM/AAAA)"
              value={promoData.finishedAt || ''}
              onChange={handleChange}
              className="promo-input"
              pattern="\d{2}/\d{2}/\d{4}"
              title="Format attendu : JJ/MM/AAAA"
              inputMode="numeric"
            />
          </div>
          <div className="form-group">
            <label htmlFor="nbruser">Nombre d'utilisateurs</label>
            <input
              id="nbruser"
              name="nbruser"
              placeholder="Nombre d'utilisateurs"
              type="number"
              value={promoData.nbruser || ''}
              onChange={handleChange}
              className="promo-input"
              min="0"
              step="1"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tag">Tag</label>
            <input 
              id="tag"
              name="tag"
              placeholder="Tag associé"
              value={promoData.tag || ''}
              onChange={handleChange}
              className="promo-input"
            />
          </div>
          <button id='promo-submit' type="submit" className="promo-submit">
            {isEditing ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AjoutPromoCode;
