import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import MainLayout from './components/MainLa';
import Dashboard from './components/dashboard';
import OrdersList from './components/OrdersList';
import OrderDetails from './components/OrderDetails';
import DeliveryManForm from './components/DeliveryManForm'; 
import DeliveryMenList from './components/DeliveryMenList'; 
import UpdateDeliveryManForm from './components/UpdateDeliveryManForm';
import CategoryList from './components/CategoryList';
import AddCategory from './components/AddCategory';
import AddSubCategory from './components/AddSubCategory';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import SubCategoryList from './components/SubCategoryList';
import ProductForm from './components/ProductForm';
import PromoCodeManagement from './components/PromoCodeManager';
import AjoutPromoCode from './components/AjoutPromoCode';
import ClientList from './components/clients';
import EditProduct from './components/EditProduct';
import EditSubCategory from './components/EditSubCategory';
import NotificationList from './components/NotificationList';
import RestaurantList from './components/RestaurantList';
import RestaurantForm from './components/RestaurantForm';
import TestInvoice from './components/TestInvoice';
import ReviewsList from './components/ReviewsList';
import DeliveryManCommands from './components/DeliveryManCommands';

const App: React.FC = () => {
  useEffect(() => {
    const loadScripts = async () => {
      const loadScript = (src: string) => {
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = (error) => reject(error);
          document.body.appendChild(script);
        });
      };

      try {
        await loadScript(process.env.REACT_APP_JQUERY_SRC!);
        await loadScript(process.env.REACT_APP_BOOTSTRAP_SRC!);
        await loadScript(process.env.REACT_APP_BOOTSTRAP_SELECT_SRC!);
        await loadScript(process.env.REACT_APP_ZOOM_SRC!);
        await loadScript(process.env.REACT_APP_THEME_SETTINGS_SRC!);
        await loadScript(process.env.REACT_APP_MAIN_JS!);
      } catch (error) {
        console.error('Error loading scripts:', error);
      }
    };

    loadScripts();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<OrdersList />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
        <Route path="delivery-men" element={<DeliveryMenList />} />
        <Route path="delivery-men/new" element={<DeliveryManForm />} />
        <Route path="delivery-men/edit/:deliveryManId" element={<UpdateDeliveryManForm />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/new" element={<AddCategory />} />
        <Route path="products" element={<ProductList />} />
        <Route path="/products/:productId" element={<EditProduct />} />
        <Route path="products/new" element={<ProductForm />} />
          <Route path="/subcategories" element={<SubCategoryList />} />
          <Route path="subcategories/new" element={<AddSubCategory />} />
          <Route path="subcategories/edit/:id" element={<EditSubCategory />} />

          <Route path="/PromoCodeManagement" element={<PromoCodeManagement />} />
          <Route path="/AjoutPromoCode" element={<AjoutPromoCode />} />
          <Route path="/ClientList" element={<ClientList />} />
          <Route path="/Notification" element={<NotificationList />} />

          <Route path="/restaurants/edit/:id" element={<RestaurantForm />} /> 
          <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/restaurants/new" element={<RestaurantForm />} />
        <Route path="/test" element={<TestInvoice />} />
        <Route path="/ReviewsList/:productId" element={<ReviewsList  />} />
        <Route path="/delivery-men/:deliveryManId" element={<DeliveryManCommands />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
