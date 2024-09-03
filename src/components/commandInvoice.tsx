import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define interfaces for the command and items
interface Item {
  productName: string;
  productCategory: string;
  quantity: number;
  productPrice: number;
}

interface Command {
  date: string;
  id: string;
  paymentMethod: string;
  status: string;
  deliveryAddress: string;
  deliveryManName: string;
  deliveryCost: number;
  items: Item[];
  finalTotal: number;
  discount: number;
}

// Define styles using @react-pdf/renderer's StyleSheet.create
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, textAlign: 'center' },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  section: { marginBottom: 10 },
  label: { fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  text: { fontSize: 10, marginBottom: 5 },
  table: { marginTop: 20, marginBottom: 20 },
  tableRow: { flexDirection: 'row' },
  tableColHeader: { flex: 1, backgroundColor: '#f3f3f3', padding: 5, fontWeight: 'bold', border: '1px solid #ccc' },
  tableCol: { flex: 1, padding: 5, border: '1px solid #ccc' },
  tableCell: { fontSize: 10 },
  total: { fontSize: 12, fontWeight: 'bold', textAlign: 'right', marginTop: 10 },
  message: { marginTop: 20, fontSize: 12, textAlign: 'center', fontStyle: 'italic' }
});

// CommandInvoice component that takes a command object as a prop
const CommandInvoice: React.FC<{ command: Command }> = ({ command }) => (
  <Document>
    <Page style={styles.page}>
      
      {/* Header with the title "Facture" */}
      <View style={styles.header}>
        <Text style={styles.title}>Facture</Text>
      </View>

      {/* Section with command details */}
      <View style={styles.section}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.text}>{new Date(command.date).toLocaleDateString()}</Text>
        <Text style={styles.label}>ID Commande:</Text>
        <Text style={styles.text}>{command.id}</Text>
        <Text style={styles.label}>Méthode de paiement:</Text>
        <Text style={styles.text}>{command.paymentMethod}</Text>
        <Text style={styles.label}>Statut:</Text>
        <Text style={styles.text}>{command.status}</Text>
      </View>

      {/* Section with delivery details */}
      <View style={styles.section}>
        <Text style={styles.label}>Adresse de livraison:</Text>
        <Text style={styles.text}>{command.deliveryAddress}</Text>
        <Text style={styles.label}>Nom du livreur:</Text>
        <Text style={styles.text}>{command.deliveryManName}</Text>
        <Text style={styles.label}>Coût de livraison:</Text>
        <Text style={styles.text}>{command.deliveryCost} €</Text>
      </View>

      {/* Table with items details */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Nom du produit</Text>
          <Text style={styles.tableColHeader}>Catégorie</Text>
          <Text style={styles.tableColHeader}>Quantité</Text>
          <Text style={styles.tableColHeader}>Prix Unitaire</Text>
          <Text style={styles.tableColHeader}>Total</Text>
        </View>
        {command.items.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCol}>{item.productName}</Text>
            <Text style={styles.tableCol}>{item.productCategory}</Text>
            <Text style={styles.tableCol}>{item.quantity}</Text>
            <Text style={styles.tableCol}>{item.productPrice} €</Text>
            <Text style={styles.tableCol}>{(item.productPrice * item.quantity).toFixed(2)} €</Text>
          </View>
        ))}
      </View>

      {/* Summary section with totals */}
      <Text style={styles.total}>Total: {command.finalTotal.toFixed(2)} €</Text>
      <Text style={styles.total}>Remise: {command.discount.toFixed(2)} €</Text>
      <Text style={styles.total}>Montant à payer: {(command.finalTotal - command.discount).toFixed(2)} €</Text>

      {/* Thank you message */}
      <Text style={styles.message}>Merci pour votre confiance en Delivio. Nous sommes heureux de vous servir!</Text>
    </Page>
  </Document>
);

export default CommandInvoice;
