import React from 'react';
import { Receipt } from '@mui/icons-material';
import FloatingSlider from '../common/FloatingSlider';

interface FloatingOrderConfirmationProps {
  totalAmount: number;
  loading: boolean;
  disabled: boolean;
  onConfirm: () => void;
}

const FloatingOrderConfirmation: React.FC<FloatingOrderConfirmationProps> = ({
  totalAmount,
  loading,
  disabled,
  onConfirm,
}) => {
  return (
    <FloatingSlider
      icon={<Receipt sx={{ fontSize: 24 }} />}
      primaryText=""
      secondaryText="Total Amount"
      actionText={loading ? 'Placing...' : 'Place Order'}
      totalAmount={totalAmount}
      loading={loading}
      disabled={disabled}
      backgroundColor="#28A745"
      borderColor="#28A745"
      bottomPosition={0}
      onConfirm={onConfirm}
      show={true}
    />
  );
};

export default FloatingOrderConfirmation;