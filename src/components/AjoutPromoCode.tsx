import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
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
 
  const [errors, setErrors] = useState<Partial<Record<keyof PromoCode, string>>>({});
  const location = useLocation();
  const navigate = useNavigate();
 
  useEffect(() => {
    if (location.state && location.state.promo) {
      const promo = location.state.promo as PromoCode;
      setPromoData(promo);
    }
    const currentDate = new Date().toISOString();
    setPromoData(prevData => ({ ...prevData, createdAt: currentDate }));
  }, [location.state]);
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPromoData({ ...promoData, [name]: value });
  };
 
  const validateFields = (): boolean => {
    let valid = true;
    let errors: Partial<Record<keyof PromoCode, string>> = {};
 
    // Required Fields Validation
    if (!promoData.appellation) {
      errors.appellation = 'Appellation est requise';
      valid = false;
    }
    if (!promoData.code) {
      errors.code = 'Code est requis';
      valid = false;
    }
    if (!promoData.finishedAt) {
      errors.finishedAt = "Date d'expiration est requise";
      valid = false;
    } else if (!validateDate(promoData.finishedAt)) {
      errors.finishedAt = "Format de date invalide (JJ/MM/AAAA)";
      valid = false;
    }
    if (promoData.discount === undefined || promoData.discount < 0 || promoData.discount > 100) {
      errors.discount = 'Remise doit être entre 0% et 100%';
      valid = false;
    }
    if (promoData.nbruser === undefined || promoData.nbruser < 0) {
      errors.nbruser = "Nombre d'utilisateurs doit être un nombre positif";
      valid = false;
    }
 
    setErrors(errors);
    return valid;
  };
 
  const validateDate = (date: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(date);
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if (!validateFields()) {
      return;
    }
 
    if (promoData.id) {
      const promoDocRef = doc(db, 'promoCode', promoData.id);
      await updateDoc(promoDocRef, promoData as PromoCode);
      alert('Code promo mis à jour avec succès');
    } else {
      await addDoc(collection(db, 'promoCode'), promoData);
      alert('Code promo ajouté avec succès');
    }
 
    navigate('/PromoCodeManagement');
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
            {errors.appellation && <span className="error-message">{errors.appellation}</span>}
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
            {errors.code && <span className="error-message">{errors.code}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="createdAt">Date de création</label>
            <input
              id="createdAt"
              name="createdAt"
              value={new Date(promoData.createdAt || '').toLocaleString('fr-FR') || ''}
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
            {errors.discount && <span className="error-message">{errors.discount}</span>}
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
            {errors.finishedAt && <span className="error-message">{errors.finishedAt}</span>}
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
            {errors.nbruser && <span className="error-message">{errors.nbruser}</span>}
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
            {promoData.id ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};
 
export default AjoutPromoCode;