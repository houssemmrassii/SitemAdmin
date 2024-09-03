import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Tooltip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ProductList.scss';
import { FaEye } from 'react-icons/fa';

interface Product {
  id: string;
  productName: string;
  productCategory: string;
  productSpecCategory: string;
  productImage: string;
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
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

        const productSnapshot = await getDocs(collection(db, 'product'));
        const productList: Product[] = productSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            productName: data.productName,
            productCategory: data.productCategory,
            productSpecCategory: data.productSpecCategory,
            productImage: data.productImage,
          };
        });

        setProducts(productList);
        setFilteredProducts(productList);
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
    setCurrentPage(1); 
  }, [searchTerm, products]);

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDelete = async (productId: string) => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?");
    if (confirmation) {
      try {
        await deleteDoc(doc(db, 'product', productId));
        setProducts(products.filter(product => product.id !== productId));
        setFilteredProducts(filteredProducts.filter(product => product.id !== productId));
      } catch (error) {
        setError('Échec de la suppression du produit');
      }
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

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginationItems = [];
    if (totalPages <= 1) return null;
    paginationItems.push(
      <IconButton
        key={1}
        className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
        onClick={() => paginate(1)}
      >
        1
      </IconButton>
    );

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
    if (totalPages > 1) {
      paginationItems.push(
        <IconButton
          key={totalPages}
          className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
          onClick={() => paginate(totalPages)}
        >
          {totalPages}
        </IconButton>
      );
    }
    return paginationItems;
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const handleViewDetails = (productId: string) => {
    navigate(`/ReviewsList/${productId}`);
  };
  
  return (
    <Container className="product-list-container">
      <Typography variant="h4" gutterBottom>
        Liste des produits
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
        <Tooltip className='custom-tooltip' title="Voir la liste des catégories" arrow>
        <Button
          id="exporter"
          variant="contained"
          className="add-button"
          onClick={() => navigate('/categories')}
        > Liste Catégories </Button>
      </Tooltip>
      <Tooltip className='custom-tooltip' title="Ajouter un nouveau produit" arrow>
        <Button
          id="exporter"
          variant="contained"
          className="add-button"
          onClick={() => navigate('/products/new')}
        > + Produit </Button>
      </Tooltip>
        </div>
      </div>
      <TableContainer component={Paper} className="table-container">
      <Table className="custom-table">
        <TableHead className="custom-table-head">
          <TableRow>
            <TableCell className="custom-table-cell-list" sx={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }} >Image</TableCell>
            <TableCell className="custom-table-cell-list" sx={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>Nom</TableCell>
            <TableCell className="custom-table-cell-list" sx={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>Catégorie</TableCell>
            <TableCell className="custom-table-cell-list" sx={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>Sous-Catégorie</TableCell>
            <TableCell className="custom-table-cell-list" sx={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts.map((product, index) => (
            <TableRow key={product.id} className={`custom-table-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
              <TableCell sx={{ textAlign: 'center' }}>
                <img src={product.productImage} alt={product.productName} className="product-image" />
              </TableCell>
              <TableCell className="custom-table-cell-cellule" sx={{
                fontSize: {
                  sm:'16px',
                  md: '16px', 
                },
                textAlign: 'center',
              }}>{product.productName}</TableCell>
              <TableCell className="custom-table-cell-cellule" sx={{
                fontSize: { 
                  sm:'16px',
                  md: '16px', 
                },
                textAlign: 'center',
              }}>{getCategoryName(product.productCategory)}</TableCell>
              <TableCell className="custom-table-cell-cellule" sx={{
                fontSize: {
                  sm:'16px',
                  md: '16px', 
                },
                textAlign: 'center',
              }}>{getSubCategoryName(product.productSpecCategory)}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <IconButton className="action-button" onClick={() => handleUpdate(product.id)}>
                  <Edit />
                </IconButton>
                <IconButton className="action-button delete-button" onClick={() => handleDelete(product.id)}>
                  <Delete />
                </IconButton>
                <div 
                  className="view-details-icon" 
                  onClick={() => handleViewDetails(product.id)} 
                  style={{ color:'#8c8f8f', textAlign: 'center' , cursor:'pointer' , display:'inline-block'}} >
                    <FaEye />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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
          disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
        >
          &gt;
        </IconButton>
      </div>
    </Container>
  );
};

export default ProductList;
