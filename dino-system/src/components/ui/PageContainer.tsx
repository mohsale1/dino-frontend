import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export interface PageContainerProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
  maxWidth = 'lg',
}) => {
  return (
    <Container maxWidth={maxWidth} sx={{ py: 4 }}>
      {breadcrumbs && <Box mb={2}>{breadcrumbs}</Box>}
      
      {(title || actions) && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            {title && (
              <Typography variant="h4" gutterBottom>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Box>{actions}</Box>}
        </Box>
      )}
      
      {children}
    </Container>
  );
};

export default PageContainer;