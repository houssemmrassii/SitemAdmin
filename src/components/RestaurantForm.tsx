import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, FormControlLabel, Switch } from '@mui/material';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate, useParams } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DeliveryManForm.scss';

const RestaurantForm: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the id from the URL
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [available, setAvailable] = useState(false);
  const [closingTime, setClosingTime] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [openTime, setOpenTime] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pricePerKm, setPricePerKm] = useState<number>(0);
  const [serviceAvailability, setServiceAvailability] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      // If there's an ID, we're in edit mode, so fetch the existing restaurant data
      const fetchRestaurant = async () => {
        const docRef = doc(db, 'shopData', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name);
          setDescription(data.description);
          setTag(data.tag);
          setAddress(data.address);
          setAvailable(data.available);
          setClosingTime(data.closingTime);
          setLogoUrl(data.logoPath);
          setOpenTime(data.openTime);
          setPhoneNumber(data.phoneNumber);
          setPricePerKm(data.pricePerKm);
          setServiceAvailability(data.serviceAvailability);
          setIsEditing(true);
        } else {
          toast.error('Restaurant non trouvé');
          navigate('/restaurants');
        }
      };

      fetchRestaurant();
    }
  }, [id, navigate]);

  const handleImageUpload = async () => {
    if (logoFile) {
      const logoRef = ref(storage, `logos/${logoFile.name}`);
      await uploadBytes(logoRef, logoFile);
      return await getDownloadURL(logoRef);
    }
    return logoUrl; // If no new image is uploaded, use the existing URL
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name) newErrors.name = 'Le nom du restaurant est requis';
    if (!description) newErrors.description = 'La description est requise';
    if (!tag) newErrors.tag = 'Le tag est requis';
    if (!address) newErrors.address = 'L\'adresse est requise';
    if (!closingTime) newErrors.closingTime = 'L\'heure de fermeture est requise';
    if (!openTime) newErrors.openTime = 'L\'heure d\'ouverture est requise';
    if (new Date(openTime) >= new Date(closingTime)) newErrors.openTime = 'L\'heure d\'ouverture doit être avant l\'heure de fermeture';
    if (!phoneNumber || !/^\d+$/.test(phoneNumber)) newErrors.phoneNumber = 'Le numéro de téléphone doit contenir uniquement des chiffres';
    if (pricePerKm <= 0) newErrors.pricePerKm = 'Le prix par km doit être supérieur à 0';
    if (!logoFile && !logoUrl) newErrors.logoPath = 'Le logo est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const logoUrl = await handleImageUpload();
      const restaurantData = {
        name,
        description,
        tag,
        address,
        available,
        closingTime,
        logoPath: logoUrl,
        openTime,
        phoneNumber,
        pricePerKm,
        serviceAvailability,
      };

      if (isEditing && id) {
        // Update existing restaurant
        const docRef = doc(db, 'shopData', id);
        await updateDoc(docRef, restaurantData);
        toast.success('Restaurant mis à jour avec succès !');
      } else {
        // Add new restaurant
        await addDoc(collection(db, 'shopData'), restaurantData);
        toast.success('Restaurant ajouté avec succès !');
      }

      // Reset form
      setName('');
      setDescription('');
      setTag('');
      setAddress('');
      setAvailable(false);
      setClosingTime('');
      setLogoFile(null);
      setOpenTime('');
      setPhoneNumber('');
      setPricePerKm(0);
      setServiceAvailability(false);
      setLogoUrl('');
      
      navigate('/restaurants'); 
    } catch (error) {
      toast.error('Erreur lors de l\'ajout/mise à jour du restaurant');
    }
  };

  return (
    <Container>
      <Typography variant="h4" marginBottom={5} gutterBottom>
        {isEditing ? 'Modifier le Restaurant' : 'Ajouter un Restaurant'}
      </Typography>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">Nom</label>
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            error={!!errors.name}
            helperText={errors.name}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description </label>
          <TextField
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            required
            error={!!errors.description}
            helperText={errors.description}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tag</label>
          <TextField
            fullWidth
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            margin="normal"
            required
            error={!!errors.tag}
            helperText={errors.tag}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Adresse</label>
          <TextField
            fullWidth
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            margin="normal"
            required
            error={!!errors.address}
            helperText={errors.address}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Disponible (le client saura si le restaurant est ouvert)</label>
          <FormControlLabel
            control={<Switch checked={available} onChange={(e) => setAvailable(e.target.checked)} />}
            label=""
          />
        </div>
        <div className="form-group">
          <label className="form-label">Heure d'ouverture</label>
          <TextField
            type="time"
            fullWidth
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
            error={!!errors.openTime}
            helperText={errors.openTime}
            InputProps={{
              classes: {
                root: 'time-picker-input',
                input: 'time-picker-input-field',
              },
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Heure de fermeture</label>
          <TextField
            type="time"
            fullWidth
            value={closingTime}
            onChange={(e) => setClosingTime(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
            error={!!errors.closingTime}
            helperText={errors.closingTime}
            InputProps={{
              classes: {
                root: 'time-picker-input',
                input: 'time-picker-input-field',
              },
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Numéro de téléphone</label>
          <TextField
            fullWidth
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            margin="normal"
            required
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Prix par km</label>
          <TextField
            type="number"
            fullWidth
            value={pricePerKm}
            onChange={(e) => setPricePerKm(Number(e.target.value))}
            margin="normal"
            InputProps={{ inputProps: { min: 0 } }}
            required
            error={!!errors.pricePerKm}
            helperText={errors.pricePerKm}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Disponibilité du service (indique si le service de livraison est disponible)</label>
          <FormControlLabel
            control={<Switch checked={serviceAvailability} onChange={(e) => setServiceAvailability(e.target.checked)} />}
            label=""
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Logo du Restaurant</label>
          <Dropzone onDrop={(acceptedFiles) => setLogoFile(acceptedFiles[0])}>
            {({ getRootProps, getInputProps }) => (
              <section className="dropzone">
                <div {...getRootProps()} className="dropzone-area">
                  <input {...getInputProps()} />
                  <Typography>Déposez vos images ici ou sélectionnez <span style={{ color: '#FF9A40' }}>cliquez pour parcourir</span></Typography>
                </div>
              </section>
            )}
          </Dropzone>
          {errors.logoPath && <Typography color="error">{errors.logoPath}</Typography>}
        </div>
        
        <Button id='exporter' type="submit" variant="contained" className="submit-button">
          {isEditing ? 'Mettre à jour ' : 'Ajouter '}
        </Button>
      </form>
      <ToastContainer />
    </Container>
  );
};

export default RestaurantForm;
