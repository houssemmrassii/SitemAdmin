// src/components/HomePage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Box>
<Typography variant="h4" component="h1" gutterBottom style={{ fontSize: '35px' , textAlign:'center'}}>
Bienvenue chez Delivio
      </Typography>
      <Typography variant="body1" style={{ fontSize: '16px' , textAlign:'center'}}>
      Bienvenue sur la page d'accueil ! Explorez toutes les fonctionnalités grâce à la barre latérale.
            </Typography>
    </Box>
  );
};

export default HomePage;
