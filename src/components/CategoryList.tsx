import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton, MenuItem, Select, FormControl } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './SStyle.css';
import './CategoryList.scss';

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  categoryImage: string;
  subCategories: SubCategory[];
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndSubCategories = async () => {
      try {
        const categoryCollection = collection(db, 'category');
        const subCategoryCollection = collection(db, 'subcategory');
        
        const categorySnapshot = await getDocs(categoryCollection);
        const subCategorySnapshot = await getDocs(subCategoryCollection);

        const subCategoryList: SubCategory[] = subCategorySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          categoryId: doc.data().categoryId,  // Ensure categoryId is included

        }));

        const categoryList: Category[] = categorySnapshot.docs.map(doc => {
          const data = doc.data();
          const subCategories = subCategoryList.filter(sub => sub.categoryId === doc.id);
          return {
            id: doc.id,
            name: data.name,
            categoryImage: data.categoryImage,
            subCategories: subCategories,
          };
        });

        setCategories(categoryList);
        setFilteredCategories(categoryList); // Initialize filtered categories
      } catch (error) {
        setError('Échec de la récupération des catégories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndSubCategories();
  }, []);

  // Search logic
  useEffect(() => {
    setFilteredCategories(
      categories.filter(category =>
        searchTerm === '' || category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, categories]);

  // Delete category logic
  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, 'category', id);
      await deleteDoc(docRef);
      setCategories(categories.filter(category => category.id !== id));
    } catch (error) {
      setError('Échec de la suppression de la catégorie');
    }
  };

  // Update category logic (navigate to edit page)
  const handleEdit = (id: string) => {
    navigate(`/categories/edit/${id}`);
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Liste des Catégories
      </Typography>
      <div className="search-export-container">
        <form className="form-search" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="name">
            <input
              type="text"
              placeholder="Recherchez ici..."
              className="search-input"
              name="name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </fieldset>
          <div className="button-submit">
            <button type="submit" className="search-button">
              <i className="icon-search"></i>
            </button>
          </div>
        </form>
        <div className="add-buttons">
          <Button
            id='exporter'
            variant="contained"
            className="add-button"
            onClick={() => navigate('/categories/new')}
          >
            + Catégorie
          </Button>
          <Button
            id='exporter'
            variant="contained"
            className="add-button"
            onClick={() => navigate('/subcategories')}
          >
            Sous-Catégorie
          </Button>
          <Button id='exporter' variant="contained" className="export-button">
            <i className="icon-file-text"></i>Exporter catégories
          </Button>
        </div>
      </div>
      <table className="category-table">
        <thead>
          <tr className="table-title">
            <th>Image de la Catégorie</th>
            <th>Nom</th>
            <th>Sous-catégories</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map((category) => (
            <tr key={category.id}>
              <td className="category-image"><img id='imagecateg' src={category.categoryImage} alt={category.name} className="category-image" /></td>
              <td>{category.name}</td>
              <td>
                <FormControl id='liste' fullWidth>
                  <Select
                    value=""
                    displayEmpty
                    style={{fontSize: '12px' }}
                  >
                    <MenuItem value="" disabled style={{fontSize: '12px' }}>Liste sous-catégorie</MenuItem>
                    {category.subCategories.map(sub => (
                      <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
              <td>
                <IconButton className="action-button" onClick={() => handleEdit(category.id)}>
                  <Edit />
                </IconButton>
                <IconButton className="action-button delete-button" onClick={() => handleDelete(category.id)}>
                  <Delete />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-container">
        <IconButton className="pagination-button">&lt;</IconButton>
        <IconButton className="pagination-button active">1</IconButton>
        <IconButton className="pagination-button">2</IconButton>
        <IconButton className="pagination-button">3</IconButton>
        <IconButton className="pagination-button">&gt;</IconButton>
      </div>
    </Container>
  );
};

export default CategoryList;
