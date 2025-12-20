import React from 'react';
import { ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FloatingSlider from '../common/FloatingSlider';

interface FloatingCartCardProps {
  totalItems: number;
  totalAmount: number;
  venueId?: string;
  tableId?: string;
  show: boolean;
}

const FloatingCartCard: React.FC<FloatingCartCardProps> = ({
  totalItems,
  totalAmount,
  venueId,
  tableId,
  show,
}) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (venueId && tableId) {
      navigate(`/checkout/${venueId}/${tableId}`);
    }
  };

  return (
    <FloatingSlider
      icon={<ShoppingCart sx={{ fontSize: 24 }} />}
      primaryText=""
      secondaryText={`${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
      actionText="Checkout"
      totalAmount={totalAmount}
      backgroundColor="#1E3A5F"
      borderColor="#1E3A5F"
      bottomPosition={{ xs: 56, sm: 60 }}
      onConfirm={handleCheckout}
      show={show}
    />
  );
};

export default FloatingCartCard;