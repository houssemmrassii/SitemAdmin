import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, TextField, Button, FormControl, InputLabel } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddCategory.scss';

const AddCategory: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        try {
          const docRef = doc(db, 'category', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name);
            setPhotoURL(data.categoryImage);
          } else {
            setError('La catégorie n\'existe pas');
          }
        } catch (error) {
          setError('Échec de la récupération de la catégorie');
        }
      };

      fetchCategory();
    }
  }, [id]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCategoryImage(file);
      setPhotoURL(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name || (!photoURL && !categoryImage)) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    try {
      const storage = getStorage();
      let imageUrl = photoURL;

      if (categoryImage) {
        const storageRef = ref(storage, `category_images/${categoryImage.name}`);
        await uploadBytes(storageRef, categoryImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (id) {
        await updateDoc(doc(db, 'category', id), {
          name,
          categoryImage: imageUrl,
        });
        toast.success('Catégorie mise à jour avec succès!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        await addDoc(collection(db, 'category'), {
          name,
          categoryImage: imageUrl,
          subCategories: [],
          tags: []
        });
        toast.success('Catégorie ajoutée avec succès!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }

      setTimeout(() => navigate('/categories'), 5000);
    } catch (err) {
      console.error('Error adding/updating category: ', err);
      setError('Échec de l\'ajout/mise à jour de la catégorie');
    }
  };

  return (
    <Container className="category-form">
      <ToastContainer />
      <Typography variant="h4" gutterBottom>
        {id ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel shrink>Nom</InputLabel>
          <TextField
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!error && !name.trim()}
            helperText={!!error && !name.trim() && 'Le nom de la catégorie est obligatoire.'}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#FF9A40',
                },
              },
             
              '& .MuiInputLabel-root': {
                paddingBottom: '5px',
              },
            }}
          />
        </FormControl>
        <div className="upload-photo">
          <input
            accept="image/*"
            type="file"
            id="photo-upload"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <label htmlFor="photo-upload">
            <div className="drop-area">
              {photoURL ? (
                <img src={photoURL} alt="Aperçu de l'image" className="photo-preview" />
              ) : (
                <div className="drop-text">
                  <span>Déposez votre image ici ou sélectionnez </span>
                  <span className="click-browse">cliquer pour parcourir</span>
                </div>
              )}
            </div>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <Button type="submit" variant="contained" color="primary" className="submit-button">
            {id ? 'Mettre à jour' : 'Ajouter '}
          </Button>
        </div>
      </form>
    </Container>
  );
};

export default AddCategory;
