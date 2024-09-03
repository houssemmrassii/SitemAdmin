import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Card, List, ListItem, ListItemText, Avatar, Divider } from '@mui/material';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './DeliveryManCommands.css';
 
interface OrderItem {
  productCategory: string;
  productDescription: string;
  productId: string;
  productImage: string;
  productName: string;
  productPrice: number;
  productSpecCategory: string;
  quantity: number;
}
interface Command {
  id: string;
  date: string;
  deliveryAddress: string;
  deliveryCost: number;
  discount: number;
  finalTotal: number;
  items: Array<{ productName: string; quantity: number; productImage: string; price?: number }>;
  paymentMethod: string;
  status: string;
}
 
interface DeliveryMan {
  id: string;
  name: string;
}
 
const DeliveryManCommands: React.FC = () => {
  const { deliveryManId } = useParams<{ deliveryManId: string }>();
  const [deliveryManName, setDeliveryManName] = useState<string>('');
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
 
  useEffect(() => {
    const fetchDeliveryManName = async () => {
      try {
        const deliveryManDoc = await getDoc(doc(db, 'deliveryMen', deliveryManId as string));
        if (deliveryManDoc.exists()) {
          const data = deliveryManDoc.data() as DeliveryMan;
          setDeliveryManName(data.name);
        } else {
          setError('Livreur non trouvé');
        }
      } catch (error) {
        setError('Échec de la récupération du nom du livreur');
      }
    };
 
    const fetchCommands = async () => {
      try {
        const commandsCollection = collection(db, 'command');
        const commandsQuery = query(commandsCollection, where('deliveryManId', '==', deliveryManId));
        const commandSnapshot = await getDocs(commandsQuery);
 
        const commandList: Command[] = commandSnapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })) as Command[];
 
        setCommands(commandList);
      } catch (error) {
        setError('Échec de la récupération des commandes');
      } finally {
        setLoading(false);
      }
    };
 
    fetchDeliveryManName();
    fetchCommands();
  }, [deliveryManId]);
 
  if (loading) {
    return <Typography>Chargement...</Typography>;
  }
 
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
 
  if (commands.length === 0) {
    return <Typography>Aucune commande trouvée pour ce livreur</Typography>;
  }
 
  return (
    <Container className="commands-container">
      <Typography variant="h4" gutterBottom className="page-title">
        Liste des commandes du {deliveryManName}
      </Typography>
      {commands.map((command) => (
        <Card key={command.id} className="command-card">
          <Typography variant="h6" className="command-title">Commande ID: {command.id}</Typography>
          <Typography variant="subtitle1" className="command-detail">
            <strong>Adresse de Livraison:</strong> {command.deliveryAddress}
          </Typography>
          <Typography variant="subtitle1" className="command-detail">
            <strong>Méthode de Paiement:</strong> {command.paymentMethod}
          </Typography>
          <Typography variant="subtitle1" className="command-detail">
            <strong>Coût de Livraison:</strong> {command.deliveryCost.toFixed(2)} €
          </Typography>
          <Typography variant="subtitle1" className="command-detail">
            <strong>Prix:</strong> {command.finalTotal.toFixed(2)} €
          </Typography>
          <Divider className="divider" />
          <List>
            {command.items.map((item, index) => (
              <ListItem key={index} className="command-item">
                <Avatar src={item.productImage} alt={item.productName} className="product-image" />
                <div className="product-details">
                  <ListItemText
                    primary={item.productName}
                    primaryTypographyProps={{ className: 'product-name' }}
                  />
                  <ListItemText
                    primary={`Quantité: ${item.quantity}`}
                    primaryTypographyProps={{ className: 'product-quantity' }}
                  />
                </div>
              </ListItem>
            ))}
          </List>
        </Card>
      ))}
    </Container>
  );
};
 
export default DeliveryManCommands;