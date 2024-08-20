import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ProductList.scss';

interface Product {
  id: string;
  productName: string;
  productCategory: string;
  productSpecCategory: string;
  productImage: string;
  added_at: number;
}

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch categories and subcategories
        const categorySnapshot = await getDocs(collection(db, 'category'));
        const subCategorySnapshot = await getDocs(collection(db, 'subcategory'));

        const categoryList: Category[] = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));

        const subCategoryList: SubCategory[] = subCategorySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          categoryId: doc.data().categoryId,
        }));

        setCategories(categoryList);
        setSubCategories(subCategoryList);

        // Fetch products
        const productSnapshot = await getDocs(collection(db, 'product'));
        const productList: Product[] = productSnapshot.docs.map(doc => {
          const data = doc.data();
          let addedAt = data.added_at;

          // Convert string-based timestamp to a Unix timestamp (if needed)
          if (typeof addedAt === 'string') {
            addedAt = new Date(addedAt).getTime();
          }

          return {
            id: doc.id,
            productName: data.productName,
            productCategory: data.productCategory,
            productSpecCategory: data.productSpecCategory,
            productImage: data.productImage,
            added_at: addedAt,
          };
        });

        // Sort products by added_at in descending order (newest first)
        productList.sort((a, b) => b.added_at - a.added_at);

        setProducts(productList);
        setFilteredProducts(productList); // Initialize filtered products
      } catch (error) {
        console.error("Error fetching products:", error);
        setError('Échec de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter(product =>
        searchTerm === '' || product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  const handleDelete = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'product', productId));
      setProducts(products.filter(product => product.id !== productId));
      setFilteredProducts(filteredProducts.filter(product => product.id !== productId));
    } catch (error) {
      setError('Échec de la suppression du produit');
    }
  };

  const handleUpdate = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Inconnu';
  };

  const getSubCategoryName = (subCategoryId: string) => {
    const subCategory = subCategories.find(sub => sub.id === subCategoryId);
    return subCategory ? subCategory.name : 'Inconnu';
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container className="product-list-container">
      <Typography variant="h4" gutterBottom>
        Liste des Produits
      </Typography>
      <div className="search-export-container">
        <form className="form-search" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="name">
            <input
              type="text"
              placeholder="Rechercher ici..."
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
            onClick={() => navigate('/categories')}
          >
            Liste Catégories
          </Button>
          <Button
            id='exporter'
            variant="contained"
            className="add-button"
            onClick={() => navigate('/products/new')}
          >
            + Produit
          </Button>
        </div>
      </div>
      <div className="table-container">
        <table id='ho' className="product-table">
          <thead>
            <tr className="table-title">
              <th>Image du Produit</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Sous-Catégorie</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr key={product.id} className={`product-item ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
                <td>
                  <img src={product.productImage} alt={product.productName} className="product-image" />
                </td>
                <td>{product.productName}</td>
                <td>{getCategoryName(product.productCategory)}</td>
                <td>{getSubCategoryName(product.productSpecCategory)}</td>
                <td>
                  <IconButton className="action-button" onClick={() => handleUpdate(product.id)}>
                    <Edit />
                  </IconButton>
                  <IconButton className="action-button delete-button" onClick={() => handleDelete(product.id)}>
                    <Delete />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export default ProductList;
