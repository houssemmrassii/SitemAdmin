import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './AddSubCategory.scss';

const EditSubCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>();  // Get the subcategory ID from the URL
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [subCategoryName, setSubCategoryName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all categories
    const fetchCategories = async () => {
      const categorySnapshot = await getDocs(collection(db, 'category'));
      const categoryList = categorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoryList);
    };

    // Fetch subcategory details by ID
    const fetchSubCategory = async () => {
      if (id) {
        const subCategoryRef = doc(db, 'subcategory', id);
        const subCategoryDoc = await getDoc(subCategoryRef);
        if (subCategoryDoc.exists()) {
          const subCategoryData = subCategoryDoc.data();
          setSelectedCategory(subCategoryData.categoryId);
          setSubCategoryName(subCategoryData.name);
        } else {
          setError('Sous-catégorie non trouvée');
        }
      }
    };

    fetchCategories();
    fetchSubCategory();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (selectedCategory && subCategoryName && id) {
        const subCategoryRef = doc(db, 'subcategory', id);
        await updateDoc(subCategoryRef, {
          name: subCategoryName,
          categoryId: selectedCategory
        });
        setError(null);
        alert('Sous-catégorie mise à jour avec succès!');
        navigate('/subcategories');
      } else {
        setError('Veuillez sélectionner une catégorie et entrer un nom de sous-catégorie');
      }
    } catch (error) {
      setError('Échec de la mise à jour de la sous-catégorie');
    }
  };

  return (
    <Container className="add-subcategory-form">
      <Typography variant="h4" gutterBottom>
        Modifier une Sous-Catégorie
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal" sx={{ paddingBottom: '10px' }}>
          <InputLabel shrink>Choisir une Catégorie</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as string)}
            required
            sx={{
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FF9A40',
              },
              '& .MuiInputLabel-root': {
                paddingBottom: '5px',
                backgroundColor: 'white',
              },
            }}
          >
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" sx={{ paddingBottom: '10px' }}>
          <InputLabel shrink>Nom de la Sous-Catégorie</InputLabel>
          <TextField
            variant="outlined"
            value={subCategoryName}
            onChange={(e) => setSubCategoryName(e.target.value)}
            required
            fullWidth
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#FF9A40',
                },
              },
              '& .MuiInputLabel-root': {
                paddingBottom: '5px',
                backgroundColor: 'white',
              },
            }}
          />
        </FormControl>
        <div className="form-actions">
          <Button type="submit" variant="contained" color="primary">
            Mettre à jour la Sous-Catégorie
          </Button>
        </div>
        {error && <Typography color="error" className="error">{error}</Typography>}
      </form>
    </Container>
  );
};

export default EditSubCategory;
