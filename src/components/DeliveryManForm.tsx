import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DeliveryManForm.scss';

const DeliveryManForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoURL(URL.createObjectURL(file));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;  
    return phoneRegex.test(phoneNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !name || !password || !phoneNumber || !photo) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    if (!validateEmail(email)) {
      setError('Adresse email invalide');
      return;
    }

    if (!validatePassword(password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Numéro de téléphone invalide');
      return;
    }

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `photosLivreurs/${photo.name}`);
      await uploadBytes(storageRef, photo);
      const photoURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'deliveryMen'), {
        email,
        name,
        password,
        phoneNumber,
        photo: photoURL,
      });
      await sendEmail(email, name);

      toast.success('Livreur ajouté avec succès!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => navigate('/delivery-men'), 5000);
    } catch (err) {
      console.error('Erreur lors de l\'ajout du document: ', err);
      setError('Échec de l\'ajout du livreur');
    }
  };

  const sendEmail = async (email: string, name: string) => {
  
    console.log(`Envoi d'un email à ${email} pour le livreur ${name}`);
  };

  return (
    <Container className="delivery-man-form">
      <ToastContainer />
      <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Email</label>
        <input
    type="email"
    className={`form-control ${!!error && !validateEmail(email) ? 'error' : ''}`}
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  {!!error && !validateEmail(email) && (
    <div className="error-message">Adresse email invalide</div>
  )}
</div>

<div className="form-group">
  <label>Nom</label>
  <input
    type="text"
    className="form-control"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
</div>

<div className="form-group">
  <label>Mot de passe</label>
  <input
    type="password"
    className={`form-control ${!!error && !validatePassword(password) ? 'error' : ''}`}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  {!!error && !validatePassword(password) && (
    <div className="error-message">Le mot de passe doit contenir au moins 6 caractères</div>
  )}
</div>

<div className="form-group">
  <label>Numéro de téléphone</label>
  <input
    type="tel"
    className={`form-control ${!!error && !validatePhoneNumber(phoneNumber) ? 'error' : ''}`}
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
  />
  {!!error && !validatePhoneNumber(phoneNumber) && (
    <div className="error-message">Numéro de téléphone invalide</div>
  )}
</div>

        <div className="upload-photo">
          <input
            accept="image/*"
            type="file"
            id="photo-upload"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          <label htmlFor="photo-upload">
            <div className="drop-area">
              {photoURL ? (
                <img src={photoURL} alt="Aperçu de la photo" className="photo-preview" />
              ) : (
                <div className="drop-text">
                  <span>Déposez vos images ici ou sélectionnez </span>
                  <span className="click-browse">cliquez pour parcourir</span>
                </div>
              )}
            </div>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <Button type="submit" variant="contained" color="primary">
            Ajouter le Livreur
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate('/delivery-men')}>
            Annuler
          </Button>
        </div>
      </form>
    </Container>
  );
};

export default DeliveryManForm;
