import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Avatar,
  Typography,
} from '@mui/material';
import { Restaurant } from '@mui/icons-material';
import { nextDay } from 'date-fns';

interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  image_url?: string;
}

interface OrderItemsListProps {
  items: OrderItem[];
  formatPrice: (price: number) => string;
  maxDisplay?: number;
}

const OrderItemsList: React.FC<OrderItemsListProps> = ({ items, formatPrice, maxDisplay = 3 }) => {
  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - maxDisplay;

  return (
    <List sx={{ p: 0 }}>
      {displayItems.map((item, index) => (
        <ListItem 
          key={index} 
          sx={{ 
            px: 0, 
            py: 0.75,
            gap: 1.5,
          }}
        >
          <Avatar
            src={item.image_url}
            alt={item.name}
            sx={{ 
              width: 36, 
              height: 36,
              backgroundColor: '#F0F4F8',
            }}
          >
            <Restaurant sx={{ fontSize: 20, color: '#6C757D' }} />
          </Avatar>
          <ListItemText
            primary={
              <Typography 
                variant="body2" 
                fontWeight="500"
                sx={{ fontSize: '0.85rem', color: '#2C3E50' }}
              >
                {item.name}
              </Typography>
            }
            secondary={
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.7rem' }}
              >
                Qty: {item.quantity} × {formatPrice(item.unit_price)}
              </Typography>
            }
          />
          <Typography 
            variant="body2" 
            fontWeight="700" 
            sx={{ 
              fontSize: '0.85rem',
              color: '#1E3A5F',
              minWidth: 'fit-content',
            }}
          >
            {formatPrice(item.unit_price * item.quantity)}
          </Typography>
        </ListItem>
      ))}
      {remainingCount > 0 && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            pl: 6,
            fontSize: '0.7rem',
          }}
        >
          +{remainingCount} more {remainingCount === 1 ? 'item' : 'items'}
        </Typography>
      )}
    </List>
  );
};

export default OrderItemsList;