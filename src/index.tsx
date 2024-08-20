import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from './dropzone';
import { Box, Typography } from '@mui/material';

const App: React.FC = () => {
  return (
    <Box
      sx={{ textAlign: 'center', padding: '40px', backgroundColor: '#f5f5f5' }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Glimpse App
      </Typography>
      <Dropzone />
    </Box>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
