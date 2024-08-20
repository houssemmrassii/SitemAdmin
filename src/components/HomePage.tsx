// src/components/HomePage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
      Bienvenue chez Delivio
      </Typography>
      <Typography variant="body1">
      Ceci est la page d'accueil. Naviguez à l'aide de la barre latérale.
      </Typography>
    </Box>
  );
};

export default HomePage;
