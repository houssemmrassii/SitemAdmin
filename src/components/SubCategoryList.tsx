import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './SubCategoryList.scss';
import { Button, IconButton, Container, Typography,Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Edit, Delete } from '@mui/icons-material';

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}
 
interface GroupedCategories {
  categoryName: string;
  subCategories: SubCategory[];
}

const SubCategoryList: React.FC = () => {
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategories[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndSubCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, 'category'));
        const subCategoriesSnapshot = await getDocs(collection(db, 'subcategory'));

        const categories: Category[] = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));

        const subCategories: SubCategory[] = subCategoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          categoryId: doc.data().categoryId,
        }));

        const grouped = categories.map(category => ({
          categoryName: category.name,
          subCategories: subCategories.filter(sub => sub.categoryId === category.id),
        }));

        setGroupedCategories(grouped);
      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndSubCategories();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/subcategories/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, 'subcategory', id);
      await deleteDoc(docRef);
      setGroupedCategories(groupedCategories.map(group => ({
        ...group,
        subCategories: group.subCategories.filter(sub => sub.id !== id),
      })));
    } catch (error) {
      setError('Échec de la suppression de la sous-catégorie');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className='subcategory-list'>
    <Container>
    <Typography variant="h4" gutterBottom style={{ marginTop: '20px' }}>
      Liste des Sous-Catégories
      </Typography>
      <div className="sub-category-table-container">
        <div className='sub'>
        <Tooltip className='custom-tooltip' title="Ajouter une nouvelle sous-categories" arrow>
          <Button
            id='exporter'
            variant="contained"
            className="add-button"
            onClick={() => navigate('/subcategories/new')}
          >
            + Sous-Catégorie
          </Button>
          </Tooltip>
        </div>
        <div className="table-container">
        <table className="sub-category-table">
          <thead>
            <tr>
              <th>Catégories</th>
              <th id='titresouscateg'>Sous-Catégories</th>
            </tr>
          </thead>
          <tbody>
            {groupedCategories.map((group, index) => (
              <tr key={index}>
                <td>{group.categoryName}</td>
                <td>
                  <ul>
                    {group.subCategories.map(sub => (
                      <li key={sub.id}>
                        {sub.name} &nbsp;&nbsp;
                        <div className='action'>
                          <IconButton className="action-button" onClick={() => handleEdit(sub.id)}>
                            <Edit />
                          </IconButton>
                          <IconButton className="action-button delete-button" onClick={() => handleDelete(sub.id)}>
                            <Delete />
                          </IconButton>  
                        </div>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </Container>
    </div>
  );
};

export default SubCategoryList;
