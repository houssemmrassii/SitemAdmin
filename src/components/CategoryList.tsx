import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton, MenuItem, Select, FormControl,Tooltip } from '@mui/material';
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
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
          categoryId: doc.data().categoryId,
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
        setFilteredCategories(categoryList);
      } catch (error) {
        setError('Échec de la récupération des catégories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndSubCategories();
  }, []);

  useEffect(() => {
    setFilteredCategories(
      categories.filter(category =>
        searchTerm === '' || category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setCurrentPage(1);
  }, [searchTerm, categories]);

  const indexOfLastCategory = currentPage * itemsPerPage;
  const indexOfFirstCategory = indexOfLastCategory - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, 'category', id);
      await deleteDoc(docRef);
      setCategories(categories.filter(category => category.id !== id));
      setFilteredCategories(filteredCategories.filter(category => category.id !== id));
    } catch (error) {
      setError('Échec de la suppression de la catégorie');
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/categories/edit/${id}`);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginationItems = [];

    paginationItems.push(
        <IconButton
            key={1}
            className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
            onClick={() => paginate(1)}
        >
            1
        </IconButton>
    );

    if (totalPages <= 1) return paginationItems; 

    if (currentPage > 3) {
        paginationItems.push(<span key="start-ellipsis">...</span>);
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        paginationItems.push(
            <IconButton
                key={i}
                className={`pagination-button ${currentPage === i ? 'active' : ''}`}
                onClick={() => paginate(i)}
            >
                {i}
            </IconButton>
        );
    }

    if (currentPage < totalPages - 2) {
        paginationItems.push(<span key="end-ellipsis">...</span>);
    }

    paginationItems.push(
        <IconButton
            key={totalPages}
            className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
            onClick={() => paginate(totalPages)}
        >
            {totalPages}
        </IconButton>
    );

    return paginationItems;
};
  

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <div className='category-list'>
    <Container>
      <Typography variant="h4" gutterBottom style={{ marginTop: '20px' }}>
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
        <Tooltip className='custom-tooltip' title="Ajouter une nouvelle Catégorie" arrow>
          <Button
            id='exporter'
            variant="contained"
            className="add-button"
            onClick={() => navigate('/categories/new')}
          >
            + Catégorie
          </Button>
          </Tooltip>
          <Tooltip className='custom-tooltip' title="Voir liste des sous-Catégories" arrow>
          <Button
            id='exporter'
            variant="contained"
            className="add-button"
            onClick={() => navigate('/subcategories')}
          >Sous-Catégorie
          </Button> 
          </Tooltip>
        </div>
      </div>
      <div className="table-container">
        <table className="category-table">
          <thead>
            <tr className="table-title">
              <th>Image</th>
              <th>Nom</th>
              <th>Sous-catégories</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {currentCategories.map((category) => (
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
                    <MenuItem value="" disabled style={{fontSize: '13px' }}>Liste sous-catégorie</MenuItem>
                    {category.subCategories.map(sub => (
                      <MenuItem key={sub.id} value={sub.id} style={{fontSize: '13px' }}>{sub.name}</MenuItem>
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
    </div>
      <div className="pagination-container">
        <IconButton
          className="pagination-button"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </IconButton>
        {renderPagination()}
        <IconButton
          className="pagination-button"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredCategories.length / itemsPerPage)}
        >
          &gt;
        </IconButton>
      </div>
    </Container>
    </div>
  );
};

export default CategoryList;
