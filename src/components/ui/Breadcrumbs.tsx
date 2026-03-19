import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const navigate = useNavigate();

  return (
    <MuiBreadcrumbs separator={<NavigateNext fontSize="small" />}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        if (isLast || !item.path) {
          return (
            <Typography key={index} color="text.primary">
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            key={index}
            component="button"
            variant="body2"
            onClick={() => item.path && navigate(item.path)}
            sx={{ cursor: 'pointer' }}
          >
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;