import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import CommandInvoice from './commandInvoice';

// Mock data to simulate a command
const mockCommand = {
  date: "2024-08-19T22:37:24.723Z",
  id: "08u3z1quxJBN0RGxPzhy",
  paymentMethod: "espece",
  status: "en cours",
  deliveryAddress: "W55P+X6V, Cebalat Ben Ammar, Tunisie",
  deliveryManName: "houssem",
  deliveryCost: 0,
  items: [
    {
      productImage: "https://firebasestorage.googleapis.com/v0/b/deliverysitem-4dcc6.appspot.com/o/falafel.avif?alt=media&token=45608244-f18a-4e5f-a250-99a6ad2d2b39",
      productName: "Falafel",
      productCategory: "Entrées",
      quantity: 3,
      productPrice: 1.2,
    },
    {
      productImage: "https://firebasestorage.googleapis.com/v0/b/deliverysitem-4dcc6.appspot.com/o/boga.jfif?alt=media&token=01a5e13e-92cd-4988-a6cd-3d6d92f27d5a",
      productName: "Boga Cidre",
      productCategory: "Boissons",
      quantity: 5,
      productPrice: 1.5,
    },
    {
      productImage: "https://firebasestorage.googleapis.com/v0/b/deliverysitem-4dcc6.appspot.com/o/tacos.jfif?alt=media&token=3dbf1c28-d210-4877-9b67-6daae2566007",
      productName: "Tacos Escalope Panée",
      productCategory: "testcategory",
      quantity: 1,
      productPrice: 20,
    },
    {
      productImage: "https://firebasestorage.googleapis.com/v0/b/deliverysitem-4dcc6.appspot.com/o/bowl4.avif?alt=media&token=b528fd10-af95-4919-80cc-ac8606929a5f",
      productName: "Bowl Poulet Pané",
      productCategory: "Salé",
      quantity: 4,
      productPrice: 18.5,
    },
  ],
  finalTotal: 105.1,
  discount: 0,
};

const TestInvoice: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h1>Test Invoice PDF</h1>
          {/* PDF Viewer to display the PDF inline */}
          <PDFViewer width="80%" height="600px">
            <CommandInvoice command={mockCommand} />
          </PDFViewer>
          {/* Download link to download the PDF */}
          <div style={{ marginTop: '20px', zIndex: 10, position: 'relative' }}>
            <PDFDownloadLink
              document={<CommandInvoice command={mockCommand} />}
              fileName="facture_test.pdf"
              style={{
                textDecoration: 'none',
                padding: '10px 20px',
                color: '#fff',
                backgroundColor: '#FF9A40',
                borderRadius: '5px',
                fontWeight: 'bold',
                display: 'inline-block',
                cursor: 'pointer', // Ensure the cursor is set to pointer
              }}
            >
              {({ loading }) => (loading ? 'Generating PDF...' : 'Download Invoice')}
            </PDFDownloadLink>
          </div>
        </div>
      );
};

export default TestInvoice;
