import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import './DeliveryManForm.scss';

const UpdateDeliveryManForm: React.FC = () => {
  const { deliveryManId } = useParams<{ deliveryManId: string }>();
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');
  const [phonenumber, setPhonenumber] = useState<number | string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeliveryMan = async () => {
      if (!deliveryManId) return;
      const docRef = doc(db, 'deliveryMen', deliveryManId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEmail(data.email);
        setNom(data.nom);
        setPassword(data.password);
        setPhonenumber(data.phonenumber);
        setPhotoURL(data.photo);
      }
    };
    fetchDeliveryMan();
  }, [deliveryManId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedPhotoURL = photoURL;

    if (photo) {
      const photoRef = ref(storage, `deliveryMenPhotos/${photo.name}`);
      await uploadBytes(photoRef, photo);
      updatedPhotoURL = await getDownloadURL(photoRef);
    }

    try {
      const docRef = doc(db, 'deliveryMen', deliveryManId!);
      await updateDoc(docRef, {
        email,
        nom,
        password,
        phonenumber: Number(phonenumber),
        photo: updatedPhotoURL,
      });
      alert('Delivery man updated successfully');
      navigate('/delivery-men');
    } catch (error) {
      console.error('Error updating delivery man:', error);
      alert('Failed to update delivery man');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  return (
    <div className="container">
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Numéro de Téléphone</label>
          <input
            type="tel"
            value={phonenumber}
            onChange={(e) => setPhonenumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Photo</label>
          <input type="file" onChange={handlePhotoChange} />
          {photoURL && (
            <div className="photo-preview">
              <img src={photoURL} alt="Delivery Man" />
            </div>
          )}
        </div>
        <button id='exporter' type="submit" className="btn btn-primary">Mettre à jour</button>
      </form>
    </div>
  );
};

export default UpdateDeliveryManForm;
