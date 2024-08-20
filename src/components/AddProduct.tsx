import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, TextField, Button, Select, FormControl, InputLabel, MenuItem, Typography } from '@mui/material';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProductForm.scss';

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

const ProductForm: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productPrice, setProductPrice] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndProduct = async () => {
      const categorySnapshot = await getDocs(collection(db, 'categories'));
      const categoryList: Category[] = categorySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCategories(categoryList);

      const subCategorySnapshot = await getDocs(collection(db, 'subcategories'));
      const subCategoryList: SubCategory[] = subCategorySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        categoryId: doc.data().categoryId,
      }));
      setSubCategories(subCategoryList);

      if (productId) {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProductName(productData.productName);
          setProductDescription(productData.productDescription);
          setProductPrice(productData.productPrice);
          setCategory(productData.productCategory);
          setSubCategory(productData.productSpecCategory);
          setPhotoURL(productData.productImage);
        }
      }
    };

    fetchCategoriesAndProduct();
  }, [productId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoURL(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!productName.trim()) {
      setError('Le nom du produit est obligatoire.');
      return;
    }

    if (!productDescription.trim()) {
      setError('La description du produit est obligatoire.');
      return;
    }

    if (!productPrice || productPrice <= 0) {
      setError('Le prix du produit doit être supérieur à 0.');
      return;
    }

    if (!category) {
      setError('La catégorie est obligatoire.');
      return;
    }

    if (!subCategory) {
      setError('La sous-catégorie est obligatoire.');
      return;
    }

    if (!photo && !photoURL) {
      setError('L\'image du produit est obligatoire.');
      return;
    }

    try {
      let imageUrl = photoURL;

      if (photo) {
        const storageRef = ref(storage, `productImages/${photo.name}`);
        await uploadBytes(storageRef, photo);
        imageUrl = await getDownloadURL(storageRef);
      }

      const productData = {
        productName,
        productDescription,
        productPrice,
        productCategory: category,
        productSpecCategory: subCategory,
        productImage: imageUrl,
      };

      if (productId) {
        await updateDoc(doc(db, 'products', productId), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }

      toast.success('Produit enregistré avec succès!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => navigate('/products'), 5000);
    } catch (err) {
      console.error('Error adding document: ', err);
      setError('Échec de l\'enregistrement du produit');
    }
  };

  return (
    <Container className="product-form-container">
      <ToastContainer />
      <Typography variant="h4" gutterBottom>
        {productId ? 'Modifier le Produit' : 'Ajouter le Produit'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel shrink>Nom du Produit</InputLabel>
          <TextField
            variant="outlined"
            fullWidth
            margin="normal"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            error={!!error && !productName.trim()}
            helperText={!!error && !productName.trim() && 'Le nom du produit est obligatoire.'}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#FF9A40',
                },
              },
              '& .MuiOutlinedInput-input': {
                backgroundColor: 'rgba(255, 154, 64, 0.05)',
              },
              '& .MuiInputLabel-root': {
                paddingBottom: '5px', // Add padding between the label and the text field
              },
            }}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel shrink>Description du Produit</InputLabel>
          <TextField
            variant="outlined"
            fullWidth
            margin="normal"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            error={!!error && !productDescription.trim()}
            helperText={!!error && !productDescription.trim() && 'La description du produit est obligatoire.'}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#FF9A40',
                },
              },
              '& .MuiOutlinedInput-input': {
                backgroundColor: 'rgba(255, 154, 64, 0.05)',
              },
              '& .MuiInputLabel-root': {
                paddingBottom: '5px', // Add padding between the label and the text field
              },
            }}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel shrink>Prix du Produit</InputLabel>
          <TextField
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={productPrice ?? ''}
            onChange={(e) => setProductPrice(parseFloat(e.target.value))}
            error={!!error && (!productPrice || productPrice <= 0)}
            helperText={!!error && (!productPrice || productPrice <= 0) && 'Le prix du produit doit être supérieur à 0.'}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#FF9A40',
                },
              },
             
              '& .MuiInputLabel-root': {
                paddingBottom: '5px', // Add padding between the label and the text field
              },
            }}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel shrink>Catégorie</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as string)}
            sx={{
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FF9A40',
              },
             
              '& .MuiInputLabel-root': {
                paddingBottom: '5px', // Add padding between the label and the text field
              },
            }}
          >
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel shrink>Sous-Catégorie</InputLabel>
          <Select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value as string)}
            sx={{
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FF9A40',
              },
              '& .MuiOutlinedInput-input': {
                backgroundColor: 'rgba(255, 154, 64, 0.05)',
              },
              '& .MuiInputLabel-root': {
                paddingBottom: '5px', // Add padding between the label and the text field
              },
            }}
          >
            {subCategories
              .filter(subCat => subCat.categoryId === category)
              .map(subCat => (
                <MenuItem key={subCat.id} value={subCat.id}>{subCat.name}</MenuItem>
              ))
            }
          </Select>
        </FormControl>
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
                <img src={photoURL} alt="Aperçu de l'image" className="photo-preview" />
              ) : (
                <div className="drop-text">
                  <span>Déposez vos images ici ou sélectionnez </span>
                  <span className="click-browse">cliquez pour parcourir</span>
                </div>
              )}
            </div>
          </label>
          {!!error && !photoURL && !photo && <Typography color="error">L'image du produit est obligatoire.</Typography>}
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <Button type="submit" variant="contained" color="primary">
            {productId ? 'Modifier le Produit' : 'Ajouter le Produit'}
          </Button>
        </div>
      </form>
    </Container>
  );
};

export default ProductForm;
