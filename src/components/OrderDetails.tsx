import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, getDocs, updateDoc, collection , addDoc} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Box, Typography, CircularProgress, Button, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import './OrderDetails.css'; // Import the CSS file
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Color Palette
const primaryColor = '#FF9A40';
const darkShade = '#CC7A33';
const lightShade = '#FFB673';
const complementaryColor = '#4077FF';
const neutralBackground = '#F5F5F5';
const textColor = '#333333';

// Styled components
const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(4),
  backgroundColor: neutralBackground,
  fontSize: '18px', // Increased font size
}));

const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  backgroundColor: '#fff',
  borderRadius: '8px',
}));

const ItemBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  borderBottom: '1px solid #e0e0e0',
}));

const SummaryBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const TrackOrderButton = styled(Button)(({ theme }) => ({
  backgroundColor: lightShade,
  color: primaryColor,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: primaryColor,
    color: '#fff',
  },
  fontSize: '16px', // Increased font size for better readability
}));

interface OrderItem {
  productName: string;
  quantity: number;
  productPrice: string;
  productImage: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: string;
  status: string;
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
  deliveryManId?: string;
}

interface DeliveryMan {
  id: string;
  nom: string;
}
/*interface TokenPhone {
  phone : string;
  token : string 
}*/
const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [selectedDeliveryMan, setSelectedDeliveryMan] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const shippingCost = 10.0;
  const taxAmount = 5.0;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('L\'ID de commande est manquant');
        setLoading(false);
        return;
      }

      try {
        const orderDoc = doc(db, 'command', orderId);
        const orderSnapshot = await getDoc(orderDoc);
        if (orderSnapshot.exists()) {
          const data = orderSnapshot.data() as Order;
          setOrder({
            id: orderId,
            items: data.items,
            totalPrice: data.totalPrice,
            status: data.status || 'En attente',
            createdAt: data.createdAt,
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod,
            deliveryManId: data.deliveryManId,
          });
          setSelectedDeliveryMan(data.deliveryManId || '');
        } else {
          setError('Commande introuvable');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des détails de la commande:', err);
        setError('Échec de la récupération des détails de la commande.');
      } finally {
        setLoading(false);
      }
    };

    const fetchDeliveryMen = async () => {
      try {
        const deliveryMenCollection = collection(db, 'deliveryMen');
        const deliveryMenSnapshot = await getDocs(deliveryMenCollection);
        const deliveryMenList: DeliveryMan[] = deliveryMenSnapshot.docs.map(doc => ({
          id: doc.id,
          nom: doc.data().nom,
        }));
        setDeliveryMen(deliveryMenList);
      } catch (error) {
        console.error('Erreur lors de la récupération des livreurs:', error);
      }
    };

    fetchOrderDetails();
    fetchDeliveryMen();
  }, [orderId]);

  const calculateTotalPrice = () => {
    if (!order) return 0;

    const itemTotal = order.items.reduce((total, item) => {
      const itemPrice = parseFloat(item.productPrice) * item.quantity;
      return total + itemPrice;
    }, 0);

    const total = itemTotal + shippingCost + taxAmount;
    return total.toFixed(2); // Ensure the total is a string with two decimal places
  };

  const handleAssignDeliveryMan = async () => {
    if (order && selectedDeliveryMan) {
      try {
        await updateDoc(doc(db, 'command', order.id), {
          deliveryManId: selectedDeliveryMan,
          status: 'en cours',
        });
        const requestBody = {
          title: 'Livraison de la commande',
          body: `Commande ID: ${order.id}`, 
          token: 'SLOzQIqRVerHLzSdONwOQ:APA91bHqJTUhc5KTvHtviasNup7aIbyeqgFkgUQpDOoVZiCDvv-xfuOA-Dc6mKik8FQIyc4MhBz8XdobUgc0hxehYo6o7j9s3AhxwxDVDm1BTZ7Du96V7a6HsdOG-NWf4hh6-bsa4-Cr'
        };
        const response = await fetch('http://localhost:3008/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
            const message = await response.text();
            toast.success(message, {
              position: "top-right",
              autoClose: 3000,
            });
            setOrder({ ...order, deliveryManId: selectedDeliveryMan, status: 'en cours' });
            setOpenDialog(true);
          
      } catch (error) {
        console.error('Erreur lors de l\'assignation du livreur:', error);
        toast.error('Échec de l\'assignation du livreur.', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };
  const handleDialogClose = () => {
    setOpenDialog(false);
    navigate('/orders'); // Redirect to the order list after assigning the delivery man
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!order) {
    return <Typography color="error">Aucun détail de commande trouvé</Typography>;
  }

  return (
    <Container>
      <Box sx={{ width: '65%' }}>
        <Section>
          <Typography variant="h5">Tous les articles</Typography>
          {order.items.map((item, index) => (
            <ItemBox key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    style={{ width: 60, height: 60, borderRadius: '8px' }}
                  />
                )}
                <Box>
                  <Typography variant="body1">Nom du produit</Typography>
                  <Typography variant="h6">{item.productName}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body1">Quantité</Typography>
                <Typography variant="h6">{item.quantity}</Typography>
              </Box>
              <Box>
                <Typography variant="body1">Prix (€)</Typography>
                <Typography variant="h6">{item.productPrice}€</Typography>
              </Box>
            </ItemBox>
          ))}
        </Section>
        <Section>
          <Typography variant="h5">Total du Panier</Typography>
          <SummaryBox>
            <Typography>Sous-total:</Typography>
            <Typography>{order.items.reduce((total, item) => total + parseFloat(item.productPrice) * item.quantity, 0).toFixed(2)}€</Typography>
          </SummaryBox>
          <SummaryBox>
            <Typography>Expédition:</Typography>
            <Typography>{shippingCost.toFixed(2)}€</Typography>
          </SummaryBox>
          <SummaryBox>
            <Typography>Taxes (TVA):</Typography>
            <Typography>{taxAmount.toFixed(2)}€</Typography>
          </SummaryBox>
          <SummaryBox>
            <Typography>Prix total:</Typography>
            <Typography sx={{ color: 'red' }}>{calculateTotalPrice()}€</Typography>
          </SummaryBox>
        </Section>
      </Box>
      <Box sx={{ width: '30%' }}>
        <Section>
          <Typography variant="h5">Résumé</Typography>
          <SummaryBox>
            <Typography>ID de commande:</Typography>
            <Typography>{order.id}</Typography>
          </SummaryBox>
          <SummaryBox>
            <Typography>Date:</Typography>
            <Typography>{order.createdAt}</Typography>
          </SummaryBox>
          <SummaryBox>
            <Typography>Total:</Typography>
            <Typography sx={{ color: 'red' }}>{calculateTotalPrice()}€</Typography>
          </SummaryBox>
        </Section>
        <Section>
          <Typography variant="h5">Adresse de livraison</Typography>
          <Typography>{order.shippingAddress}</Typography>
        </Section>
        <Section>
          <Typography variant="h5">Méthode de paiement</Typography>
          <Typography>{order.paymentMethod}</Typography>
        </Section>
        <Section>
          <Typography variant="h5">Date prévue de livraison</Typography>
          <Typography sx={{ color: 'green' }}>{order.createdAt}</Typography>
          <TrackOrderButton variant="contained">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>Suivre la commande</Typography>
            </Box>
          </TrackOrderButton>
        </Section>
        <Section>
          <Typography variant="h5">Assigner un livreur</Typography>
          <FormControl fullWidth>
            <InputLabel sx={{ color: textColor }}>Livreur</InputLabel>
            <Select
              value={selectedDeliveryMan}
              onChange={(e) => setSelectedDeliveryMan(e.target.value as string)}
              required
              sx={{
                color: textColor,
                backgroundColor: '#fff', // Ensure the background is white
                '.MuiSelect-select': {
                  backgroundColor: '#fff', // Ensure the dropdown is white
                },
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: primaryColor, // Ensure the border color matches your theme
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkShade, // Change the border color on hover
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#fff', // Background color for dropdown list
                    '& .MuiMenuItem-root': {
                      color: textColor, // Text color for each menu item
                    },
                    '& .Mui-selected': {
                      backgroundColor: lightShade, // Background color for selected item
                      color: textColor,
                    },
                  },
                },
              }}
            >
              {deliveryMen.map((man) => (
                <MenuItem key={man.id} value={man.id} sx={{ color: textColor, backgroundColor: '#fff' }}>
                  {man.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleAssignDeliveryMan}
            sx={{ marginTop: 2, backgroundColor: primaryColor, '&:hover': { backgroundColor: darkShade } }}
          >
            Assigner
          </Button>
          <ToastContainer />
        </Section>
      </Box>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Livreur assigné</DialogTitle>
        <DialogContent>
          <Typography>La commande sera livrée par le livreur assigné.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetails;
