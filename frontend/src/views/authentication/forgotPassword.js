import React from 'react';
import { Grid, Box, Card,  } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import ResetPassword from './auth/ResetPassword';

const forgotPassword = () => {
    return (

        <PageContainer title="resetpassword" description="this is Register page">
        <Box
          sx={{
            position: 'relative',
            '&:before': {
              content: '""',
              background: 'radial-gradient(#D3D3D8, #EFEFF3, #D3D3D8)',
              backgroundSize: '400% 400%',
              animation: 'gradient 15s ease infinite',
              position: 'absolute',
              height: '100%',
              width: '100%',
              opacity: '0.3',
            },
          }}
        >
          <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
            <Grid
              item
              xs={12}
              sm={12}
              lg={4}
              xl={3}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '500px' }}>
                <Box display="flex"  alignItems="center" justifyContent="center"  >
                  <Logo  />
                </Box>
                <ResetPassword
                 
                  
                />
              </Card>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    )}
    
    export default forgotPassword