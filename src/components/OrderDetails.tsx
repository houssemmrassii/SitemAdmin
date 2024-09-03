import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, getDocs, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Box, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomButton = styled('button')(({ theme }) => ({
  backgroundColor: 'white',
  color: '#FF9A40',
  textTransform: 'uppercase',
  padding: '10px 20px',
  borderRadius: '8px',
  border: '1px solid #FF9A40',
  fontSize: '14px',
  fontWeight: 'normal',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#FF9A40',
    color: '#fff',
    fontWeight: 'bold',
  },
}));
 
const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(4),
  backgroundColor: '#F5F5F5',
  fontSize: '20px',
}));
 
const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  backgroundColor: '#fff',
  borderRadius: '8px',
}));
 
const SummaryBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
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
  deliveryAddress: string;
  paymentMethod: string;
  deliveryManId?: string;
  deliveryManName?: string;
}
 
interface DeliveryMan {
  id: string;
  nom: string;
}
 
const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [selectedDeliveryMan, setSelectedDeliveryMan] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [assignedDeliveryManName, setAssignedDeliveryManName] = useState<string>('');
 
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
            deliveryAddress: data.deliveryAddress,
            paymentMethod: data.paymentMethod,
            deliveryManId: data.deliveryManId,
            deliveryManName: data.deliveryManName || '',
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
          nom: doc.data().name,
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
    return total.toFixed(2);
  };
  const formattedDate = order?.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : '';
 
  const handleAssignDeliveryMan = async () => {
    if (order && selectedDeliveryMan) {
      try {
        const deliveryMan = deliveryMen.find(man => man.id === selectedDeliveryMan);
        if (deliveryMan) {
          setAssignedDeliveryManName(deliveryMan.nom);
 
          await updateDoc(doc(db, 'command', order.id), {
            deliveryManId: selectedDeliveryMan,
            deliveryManName: deliveryMan.nom,
            status: 'en cours',
          });
 
          const requestBody = {
            title: 'Livraison de la commande',
            body: `Commande ID: ${order.id}`,
            token: 'fhzQ3xxhSs2UWSk615pnsh:APA91bG40PuAHKuS2k-YmJqO_63aX8i9tfINhcH5ZM26grUI5fk3mOBWsuk5B5MQYU6jwbHF9sEjdzeJrCvSe74AnNm8EgGBypo7NBNh4EGka8ZnUVYvUaBk6_jdsZjwzBf116IylQFD'
          };
 
          const response = await fetch('http://localhost:3008/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
 
          const message = await response.text();
          toast.success(message, {
            position: "top-right",
            autoClose: 3000,
          });
 
          setOrder({ ...order, deliveryManId: selectedDeliveryMan, deliveryManName: deliveryMan.nom, status: 'en cours' });
          setOpenDialog(true);
        }
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
    navigate('/orders');
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
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
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
            </Box>
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
          {/*<SummaryBox>
            <Typography>Date:</Typography>
            <Typography>{formattedDate}</Typography> {/* Use formatted date 
          </SummaryBox>*/}
          <SummaryBox>
            <Typography>Total:</Typography>
            <Typography sx={{ color: 'red' }}>{calculateTotalPrice()}€</Typography>
          </SummaryBox>
        </Section>
        <Section>
          <Typography variant="h5">Adresse de livraison</Typography>
          <Typography>{order.deliveryAddress}</Typography>
        </Section>
        <Section>
          <Typography variant="h5">Méthode de paiement</Typography>
          <Typography>{order.paymentMethod}</Typography>
        </Section>
        <Section>
          <Typography variant="h5">Date prévue de livraison</Typography>
          <CustomButton>
            Suivre la commande
          </CustomButton>
        </Section>
        <Section>
          <Typography variant="h5">Assigner un livreur</Typography>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#333333' }}>Livreur</InputLabel>
            <Select
              value={selectedDeliveryMan}
              onChange={(e) => setSelectedDeliveryMan(e.target.value as string)}
              required
              sx={{
                color: '#333333',
                backgroundColor: '#fff',
                '.MuiSelect-select': {
                  backgroundColor: '#fff',
                },
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF9A40',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#CC7A33',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#fff',
                    '& .MuiMenuItem-root': {
                      color: '#333333',
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#FFB673',
                      color: '#333333',
                    },
                  },
                },
              }}
            >
              {deliveryMen.map((man) => (
                <MenuItem key={man.id} value={man.id} sx={{ color: '#333333', backgroundColor: '#fff' }}>
                  {man.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <CustomButton
            onClick={handleAssignDeliveryMan}
            sx={{ marginTop: 2 }}
          >
            Assigner
          </CustomButton>
          <ToastContainer />
        </Section>
      </Box>
 
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Livreur assigné</DialogTitle>
        <DialogContent>
          <Typography variant="h6">
            La commande sera livrée par <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#FF9A40' }}>{assignedDeliveryManName}</span>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={handleDialogClose}>
            OK
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
 
export default OrderDetails;