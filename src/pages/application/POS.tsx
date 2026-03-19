import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Paper,
  Divider,
  IconButton,
  Chip,
  Badge,
  InputAdornment,
  alpha,
  useTheme,
  useMediaQuery,
  Stack,
  Avatar,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Fade,
  Zoom,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Collapse,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Search,
  Receipt,
  Clear,
  CheckCircle,
  Close,
  LocalCafe,
  Restaurant,
  Fastfood,
  Icecream,
  AttachMoney,
  CreditCard,
  AccountBalanceWallet,
  Print,
  Person,
  Phone,
  Email,
  Notes,
  GridView,
  ViewList,
  FilterList,
  TrendingUp,
  Inventory,
  LocalOffer,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { useUserData } from '../../contexts/application/UserData';
import { catalogService } from '../../features/catalog/services';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
  image?: string;
}

// Dummy data for testing
const DUMMY_CATEGORIES = [
  { id: 'cat-1', name: 'Coffee', icon: LocalCafe, color: '#6B4423' },
  { id: 'cat-2', name: 'Food', icon: Restaurant, color: '#D84315' },
  { id: 'cat-3', name: 'Snacks', icon: Fastfood, color: '#F57C00' },
  { id: 'cat-4', name: 'Desserts', icon: Icecream, color: '#C2185B' },
];

const DUMMY_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Espresso',
    description: 'Rich and bold espresso shot',
    price: 3.50,
    categoryId: 'cat-1',
    categoryName: 'Coffee',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
  },
  {
    id: 'item-2',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and foam',
    price: 4.50,
    categoryId: 'cat-1',
    categoryName: 'Coffee',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
  },
  {
    id: 'item-3',
    name: 'Latte',
    description: 'Smooth espresso with steamed milk',
    price: 4.75,
    categoryId: 'cat-1',
    categoryName: 'Coffee',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400',
  },
  {
    id: 'item-4',
    name: 'Club Sandwich',
    description: 'Triple-decker with turkey, bacon, and veggies',
    price: 12.99,
    categoryId: 'cat-2',
    categoryName: 'Food',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
  },
  {
    id: 'item-5',
    name: 'Caesar Salad',
    description: 'Fresh romaine with parmesan and croutons',
    price: 9.99,
    categoryId: 'cat-2',
    categoryName: 'Food',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
  },
  {
    id: 'item-6',
    name: 'Margherita Pizza',
    description: 'Classic tomato, mozzarella, and basil',
    price: 14.99,
    categoryId: 'cat-2',
    categoryName: 'Food',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
  },
  {
    id: 'item-7',
    name: 'Croissant',
    description: 'Buttery, flaky French pastry',
    price: 3.99,
    categoryId: 'cat-3',
    categoryName: 'Snacks',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
  },
  {
    id: 'item-8',
    name: 'Muffin',
    description: 'Blueberry or chocolate chip',
    price: 3.50,
    categoryId: 'cat-3',
    categoryName: 'Snacks',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400',
  },
  {
    id: 'item-9',
    name: 'Chocolate Cake',
    description: 'Rich chocolate layer cake',
    price: 6.99,
    categoryId: 'cat-4',
    categoryName: 'Desserts',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
  },
  {
    id: 'item-10',
    name: 'Tiramisu',
    description: 'Classic Italian coffee-flavored dessert',
    price: 7.50,
    categoryId: 'cat-4',
    categoryName: 'Desserts',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
  },
  {
    id: 'item-11',
    name: 'Ice Cream Sundae',
    description: 'Vanilla ice cream with toppings',
    price: 5.99,
    categoryId: 'cat-4',
    categoryName: 'Desserts',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
  },
  {
    id: 'item-12',
    name: 'Americano',
    description: 'Espresso with hot water',
    price: 3.75,
    categoryId: 'cat-1',
    categoryName: 'Coffee',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
  },
];

const POS: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userData } = useUserData();
  const currentVenue = userData?.venue;

  // State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DUMMY_MENU_ITEMS);
  const [categories, setCategories] = useState<any[]>(DUMMY_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [cartExpanded, setCartExpanded] = useState(true);
  const [orderConfirmationOpen, setOrderConfirmationOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  useEffect(() => {
    if (currentVenue?.id) {
      loadMenuData();
    }
  }, [currentVenue?.id]);

  const loadMenuData = async () => {
    if (!currentVenue?.id) return;

    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        catalogService.getCatalogItems(currentVenue.id),
        catalogService.getCategories(currentVenue.id),
      ]);

      if (itemsData && itemsData.length > 0) {
        // Transform CatalogItem to MenuItem
        const menuItems: MenuItem[] = itemsData.map(item => {
          const category = categoriesData?.find(cat => cat.id === item.categoryId);
          return {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.basePrice,
            categoryId: item.categoryId,
            categoryName: category?.name || 'Uncategorized',
            isAvailable: item.isAvailable,
            image: item.imageUrls?.[0],
          };
        });
        setMenuItems(menuItems);
      }
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        category: item.categoryName,
      }];
    });
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filtered items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch && item.isAvailable;
    });
  }, [menuItems, selectedCategory, searchTerm]);

  // Payment handlers
  const handlePlaceOrder = async () => {
    setProcessingOrder(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const orderData = {
      orderNumber: `ORD-${Date.now()}`,
      items: cart,
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
      paymentMethod,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      timestamp: new Date().toISOString(),
    };
    
    console.log('Order placed:', orderData);
    
    setProcessingOrder(false);
    setPaymentDialogOpen(false);
    setCompletedOrder(orderData);
    setOrderConfirmationOpen(true);
    
    clearCart();
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
  };

  const handlePrintReceipt = () => {
    if (!completedOrder) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Receipt - ${completedOrder.orderNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              margin: 0;
              size: 80mm auto;
            }
            
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 8mm 4mm;
              max-width: 80mm;
              margin: 0 auto;
              background: #ffffff;
              color: #000;
              font-size: 11px;
              line-height: 1.3;
            }
            
            .receipt {
              background: white;
            }
            
            /* Header Section */
            .header {
              text-align: center;
              margin-bottom: 10px;
              padding-bottom: 8px;
              border-bottom: 2px dashed #000;
            }
            
            .logo-box {
              background: #000;
              color: #fff;
              padding: 5px 0;
              margin-bottom: 6px;
            }
            
            .logo {
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 3px;
            }
            
            .tagline {
              font-size: 8px;
              letter-spacing: 1px;
              margin-top: 1px;
            }
            
            .venue-name {
              font-size: 13px;
              font-weight: bold;
              margin: 6px 0 4px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .venue-info {
              font-size: 9px;
              line-height: 1.4;
              color: #333;
            }
            
            /* Receipt Type Badge */
            .receipt-type {
              text-align: center;
              margin-bottom: 8px;
            }
            
            .receipt-badge {
              display: inline-block;
              background: #000;
              color: #fff;
              padding: 3px 12px;
              font-size: 9px;
              font-weight: bold;
              letter-spacing: 1.5px;
            }
            
            /* Order Info Section */
            .order-info {
              margin-bottom: 8px;
              padding-bottom: 6px;
              border-bottom: 1px solid #000;
            }
            
            .order-info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
              font-size: 9px;
            }
            
            .order-info-label {
              font-weight: bold;
              text-transform: uppercase;
              font-size: 8px;
            }
            
            .order-number {
              font-size: 11px;
              font-weight: bold;
              text-align: center;
              padding: 5px 0;
              background: #f5f5f5;
              margin-bottom: 6px;
              border: 1px dashed #000;
            }
            
            /* Customer Section */
            .customer-info {
              margin-bottom: 8px;
              padding: 6px;
              background: #f9f9f9;
              border: 1px solid #ddd;
            }
            
            .customer-title {
              font-weight: bold;
              font-size: 9px;
              margin-bottom: 4px;
              text-transform: uppercase;
              border-bottom: 1px solid #ccc;
              padding-bottom: 2px;
            }
            
            .customer-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
              font-size: 9px;
            }
            
            /* Items Section */
            .items-section {
              margin-bottom: 8px;
            }
            
            .items-header {
              font-weight: bold;
              font-size: 9px;
              margin-bottom: 6px;
              padding: 4px 0;
              text-align: center;
              background: #000;
              color: #fff;
              letter-spacing: 1.5px;
            }
            
            .items-table-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              font-size: 9px;
              padding-bottom: 4px;
              border-bottom: 1px solid #000;
              margin-bottom: 5px;
            }
            
            .item {
              margin-bottom: 5px;
              padding-bottom: 4px;
              border-bottom: 1px dotted #ccc;
            }
            
            .item:last-child {
              border-bottom: none;
            }
            
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            
            .item-name {
              font-weight: bold;
              font-size: 10px;
              flex: 1;
            }
            
            .item-total {
              font-weight: bold;
              font-size: 10px;
              min-width: 55px;
              text-align: right;
            }
            
            .item-details {
              display: flex;
              justify-content: space-between;
              color: #666;
              font-size: 8px;
              padding-left: 6px;
            }
            
            .item-qty {
              font-style: italic;
            }
            
            /* Totals Section */
            .totals {
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              padding: 6px 0;
              margin-bottom: 8px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-size: 10px;
            }
            
            .total-row.subtotal {
              color: #666;
            }
            
            .total-row.tax {
              color: #666;
            }
            
            .total-row.grand-total {
              font-size: 13px;
              font-weight: bold;
              margin-top: 5px;
              padding-top: 5px;
              border-top: 2px dashed #000;
            }
            
            .total-label {
              text-transform: uppercase;
            }
            
            .total-amount {
              font-weight: bold;
            }
            
            /* Payment Section */
            .payment-info {
              margin-bottom: 8px;
              padding: 6px;
              background: #f0f0f0;
              border: 1px solid #ccc;
            }
            
            .payment-title {
              font-weight: bold;
              font-size: 9px;
              margin-bottom: 4px;
              text-transform: uppercase;
            }
            
            .payment-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
              font-size: 9px;
            }
            
            .payment-method {
              font-weight: bold;
              text-transform: uppercase;
            }
            
            .payment-status {
              background: #000;
              color: #fff;
              padding: 1px 6px;
              font-weight: bold;
              font-size: 8px;
            }
            
            /* Footer Section */
            .footer {
              text-align: center;
              border-top: 2px dashed #000;
              padding-top: 8px;
              margin-top: 8px;
            }
            
            .thank-you-box {
              background: #000;
              color: #fff;
              padding: 6px;
              margin-bottom: 6px;
            }
            
            .thank-you {
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 2px;
            }
            
            .thank-you-sub {
              font-size: 7px;
              margin-top: 2px;
              letter-spacing: 0.5px;
            }
            
            .footer-note {
              font-size: 8px;
              line-height: 1.4;
              color: #555;
              margin-bottom: 6px;
            }
            
            .barcode-placeholder {
              margin: 6px 0;
              padding: 8px;
              border: 1px dashed #ccc;
              text-align: center;
              font-size: 8px;
              color: #999;
            }
            
            .powered-by {
              font-size: 7px;
              color: #999;
              margin-top: 6px;
              padding-top: 6px;
              border-top: 1px solid #ddd;
            }
            
            /* Print Specific */
            @media print {
              body {
                padding: 5mm;
              }
              
              .receipt {
                max-width: 100%;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <!-- Header -->
            <div class="header">
              <div class="logo-box">
                <div class="logo">DINO</div>
                <div class="tagline">POINT OF SALE</div>
              </div>
              <div class="venue-name">${currentVenue?.name || 'Test Venue'}</div>
              <div class="venue-info">
                ${currentVenue?.location?.address || 'Address not available'}<br>
                Tel: ${currentVenue?.phone || 'N/A'} | Email: ${currentVenue?.email || 'N/A'}
              </div>
            </div>
            
            <!-- Receipt Type -->
            <div class="receipt-type">
              <div class="receipt-badge">SALES RECEIPT</div>
            </div>
            
            <!-- Order Number -->
            <div class="order-number">
              ORDER #${completedOrder.orderNumber}
            </div>
            
            <!-- Order Information -->
            <div class="order-info">
              <div class="order-info-row">
                <span class="order-info-label">Date:</span>
                <span>${new Date(completedOrder.timestamp).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="order-info-row">
                <span class="order-info-label">Time:</span>
                <span>${new Date(completedOrder.timestamp).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}</span>
              </div>
              <div class="order-info-row">
                <span class="order-info-label">Cashier:</span>
                <span>${userData?.user?.firstName || 'Staff'}</span>
              </div>
            </div>
            
            <!-- Customer Information -->
            <div class="customer-info">
              <div class="customer-title">Customer Details</div>
              <div class="customer-row">
                <span>Name:</span>
                <span>${completedOrder.customer.name}</span>
              </div>
              ${completedOrder.customer.phone ? `
                <div class="customer-row">
                  <span>Phone:</span>
                  <span>${completedOrder.customer.phone}</span>
                </div>
              ` : ''}
            </div>
            
            <!-- Items -->
            <div class="items-section">
              <div class="items-header">ORDER ITEMS</div>
              <div class="items-table-header">
                <span>Item</span>
                <span>Amount</span>
              </div>
              ${completedOrder.items.map((item: CartItem, index: number) => `
                <div class="item">
                  <div class="item-row">
                    <span class="item-name">${index + 1}. ${item.name}</span>
                    <span class="item-total">$${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div class="item-details">
                    <span class="item-qty">${item.quantity} x $${item.price.toFixed(2)}</span>
                    ${item.category ? `<span>${item.category}</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
            
            <!-- Totals -->
            <div class="totals">
              <div class="total-row subtotal">
                <span class="total-label">Subtotal:</span>
                <span class="total-amount">$${completedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row tax">
                <span class="total-label">Tax (10%):</span>
                <span class="total-amount">$${completedOrder.tax.toFixed(2)}</span>
              </div>
              <div class="total-row grand-total">
                <span class="total-label">TOTAL:</span>
                <span class="total-amount">$${completedOrder.total.toFixed(2)}</span>
              </div>
            </div>
            
            <!-- Payment Information -->
            <div class="payment-info">
              <div class="payment-title">Payment Information</div>
              <div class="payment-row">
                <span>Method:</span>
                <span class="payment-method">${completedOrder.paymentMethod}</span>
              </div>
              <div class="payment-row">
                <span>Amount Paid:</span>
                <span style="font-weight: bold;">$${completedOrder.total.toFixed(2)}</span>
              </div>
              <div class="payment-row">
                <span>Status:</span>
                <span class="payment-status">PAID</span>
              </div>
            </div>
            
            <!-- Barcode Placeholder -->
            <div class="barcode-placeholder">
              * ${completedOrder.orderNumber} *
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="thank-you-box">
                <div class="thank-you">THANK YOU!</div>
                <div class="thank-you-sub">PLEASE COME AGAIN</div>
              </div>
              
              <div class="footer-note">
                We appreciate your business!<br>
                Contact: ${currentVenue?.phone || 'N/A'}
              </div>
              
              <div class="powered-by">
                Powered by Dino POS | www.dinopos.com
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
            
            window.onafterprint = function() {
              setTimeout(function() {
                window.close();
              }, 100);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Receipt sx={{ color: '#ffffff', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#1a1a1a', mb: 0.5 }}>
                  Point of Sale
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  {currentVenue?.name || 'Test Venue'} • Create manual orders
                </Typography>
              </Box>
            </Box>

            {/* Quick Stats */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e5e7eb',
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Inventory sx={{ color: '#6b7280', fontSize: 20 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#1a1a1a' }}>
                    {filteredItems.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Items
                  </Typography>
                </Box>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e5e7eb',
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <TrendingUp sx={{ color: '#10b981', fontSize: 20 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#1a1a1a' }}>
                    ₹{calculateTotal().toFixed(2)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Total
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Search and Filters */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#6b7280', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#ffffff',
                  borderRadius: 1.5,
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
              }}
            />
            <ButtonGroup variant="outlined" size="small">
              <Button
                onClick={() => setViewMode('grid')}
                sx={{
                  backgroundColor: viewMode === 'grid' ? '#1a1a1a' : '#ffffff',
                  color: viewMode === 'grid' ? '#ffffff' : '#6b7280',
                  borderColor: '#e5e7eb',
                  '&:hover': {
                    backgroundColor: viewMode === 'grid' ? '#374151' : '#f8f9fa',
                    borderColor: '#e5e7eb',
                  },
                }}
              >
                <GridView fontSize="small" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                sx={{
                  backgroundColor: viewMode === 'list' ? '#1a1a1a' : '#ffffff',
                  color: viewMode === 'list' ? '#ffffff' : '#6b7280',
                  borderColor: '#e5e7eb',
                  '&:hover': {
                    backgroundColor: viewMode === 'list' ? '#374151' : '#f8f9fa',
                    borderColor: '#e5e7eb',
                  },
                }}
              >
                <ViewList fontSize="small" />
              </Button>
            </ButtonGroup>
          </Box>
        </Paper>

        {/* Categories */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5 }}>
            <Chip
              label="All Items"
              icon={<Restaurant />}
              onClick={() => setSelectedCategory('all')}
              sx={{
                height: 36,
                fontWeight: 600,
                fontSize: '0.875rem',
                backgroundColor: selectedCategory === 'all' ? '#1a1a1a' : '#ffffff',
                color: selectedCategory === 'all' ? '#ffffff' : '#374151',
                border: '1px solid',
                borderColor: selectedCategory === 'all' ? '#1a1a1a' : '#e5e7eb',
                '&:hover': {
                  backgroundColor: selectedCategory === 'all' ? '#374151' : '#f8f9fa',
                },
                '& .MuiChip-icon': {
                  color: selectedCategory === 'all' ? '#ffffff' : '#6b7280',
                },
              }}
            />
            {categories.map(category => {
              const IconComponent = category.icon;
              return (
                <Chip
                  key={category.id}
                  label={category.name}
                  icon={<IconComponent />}
                  onClick={() => setSelectedCategory(category.id)}
                  sx={{
                    height: 36,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    backgroundColor: selectedCategory === category.id ? '#1a1a1a' : '#ffffff',
                    color: selectedCategory === category.id ? '#ffffff' : '#374151',
                    border: '1px solid',
                    borderColor: selectedCategory === category.id ? '#1a1a1a' : '#e5e7eb',
                    '&:hover': {
                      backgroundColor: selectedCategory === category.id ? '#374151' : '#f8f9fa',
                    },
                    '& .MuiChip-icon': {
                      color: selectedCategory === category.id ? '#ffffff' : '#6b7280',
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Menu Items */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2.5,
            backgroundColor: '#f8f9fa',
          }}
        >
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Typography variant="h6" sx={{ color: '#6b7280' }}>
                Loading menu items...
              </Typography>
            </Box>
          ) : filteredItems.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                textAlign: 'center',
                py: 12,
                backgroundColor: '#ffffff',
                borderRadius: 2,
                border: '1px solid #e5e7eb',
              }}
            >
              <Search sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#374151', fontWeight: 600, mb: 1 }}>
                No items found
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Try adjusting your search or category filter
              </Typography>
            </Paper>
          ) : viewMode === 'grid' ? (
            <Grid container spacing={2.5}>
              {filteredItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease-in-out',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                        borderColor: '#9ca3af',
                      },
                    }}
                  >
                    {/* Image Container */}
                    <Box
                      onClick={() => addToCart(item)}
                      sx={{
                        position: 'relative',
                        height: 180,
                        backgroundColor: '#f8f9fa',
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                    >
                      {item.image ? (
                        <CardMedia
                          component="img"
                          height="180"
                          image={item.image}
                          alt={item.name}
                          sx={{ 
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e5e7eb 100%)',
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              backgroundColor: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid #e5e7eb',
                            }}
                          >
                            <Restaurant sx={{ fontSize: 40, color: '#9ca3af' }} />
                          </Box>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#9ca3af',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                            }}
                          >
                            No Image
                          </Typography>
                        </Box>
                      )}

                      {/* Category Badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                        }}
                      >
                        <Chip
                          label={item.categoryName}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            border: '1px solid #e5e7eb',
                            '& .MuiChip-label': {
                              px: 1.5,
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Content */}
                    <CardContent 
                      sx={{ 
                        p: 2.5,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Product Name */}
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={700} 
                        sx={{ 
                          mb: 1,
                          color: '#1a1a1a',
                          fontSize: '0.9375rem',
                          lineHeight: 1.4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#6b7280',
                          fontSize: '0.8125rem',
                          lineHeight: 1.5,
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: 40,
                        }}
                        title={item.description}
                      >
                        {item.description || 'No description available'}
                      </Typography>

                      {/* Spacer */}
                      <Box sx={{ flex: 1 }} />

                      {/* Price and Add Button */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          pt: 2,
                          borderTop: '1px solid #f3f4f6',
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          fontWeight={800} 
                          sx={{ 
                            color: '#1a1a1a',
                            fontSize: '1.375rem',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          ₹{item.price.toFixed(2)}
                        </Typography>
                        
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => addToCart(item)}
                          startIcon={<Add />}
                          sx={{
                            backgroundColor: '#1a1a1a',
                            color: '#ffffff',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.75,
                            boxShadow: 'none',
                            '&:hover': {
                              backgroundColor: '#374151',
                              boxShadow: 'none',
                            },
                          }}
                        >
                          Add
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack spacing={1.5}>
              {filteredItems.map((item) => (
                <Fade in key={item.id} timeout={300}>
                  <Paper
                    onClick={() => addToCart(item)}
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#1a1a1a',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {item.image && (
                        <Avatar
                          src={item.image}
                          variant="rounded"
                          sx={{ width: 80, height: 80, border: '1px solid #e5e7eb' }}
                        />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1a1a1a', mb: 0.5 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                          {item.description}
                        </Typography>
                        <Chip
                          label={item.categoryName}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#f8f9fa',
                            color: '#374151',
                            border: '1px solid #e5e7eb',
                          }}
                        />
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#1a1a1a', mb: 1 }}>
                          ₹{item.price.toFixed(2)}
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Add />}
                          sx={{
                            backgroundColor: '#1a1a1a',
                            color: '#ffffff',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: '#374151',
                            },
                          }}
                        >
                          Add
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      {/* Cart Sidebar */}
      <Paper
        elevation={0}
        sx={{
          width: 420,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Cart Header */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f8f9fa',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingCart sx={{ color: '#ffffff', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1a1a1a' }}>
                  Current Order
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {cart.length} items • {totalItems} qty
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setCartExpanded(!cartExpanded)}
              sx={{ color: '#6b7280' }}
            >
              {cartExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Box>
          {cart.length > 0 && (
            <Button
              fullWidth
              size="small"
              variant="outlined"
              onClick={handlePrintReceipt}
              startIcon={<Print />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1,
                borderColor: '#e5e7eb',
                color: '#374151',
                '&:hover': {
                  borderColor: '#1a1a1a',
                  backgroundColor: '#f8f9fa',
                },
              }}
            >
              Print Receipt
            </Button>
          )}
        </Box>

        {/* Cart Items */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            minHeight: 0,
          }}
        >
            {cart.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ShoppingCart sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#374151', mb: 0.5 }}>
                  Cart is Empty
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Add items from the menu
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {cart.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      backgroundColor: '#f8f9fa',
                      borderRadius: 1.5,
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <ListItemAvatar>
                      {item.image ? (
                        <Avatar src={item.image} variant="rounded" sx={{ width: 56, height: 56 }} />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 56, height: 56, backgroundColor: '#e5e7eb' }}>
                          <Restaurant sx={{ color: '#6b7280' }} />
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1a1a1a', mb: 0.5 }}>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            ${item.price.toFixed(2)} each
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                            <ButtonGroup size="small" variant="outlined">
                              <Button
                                onClick={() => updateQuantity(item.id, -1)}
                                sx={{
                                  minWidth: 32,
                                  borderColor: '#e5e7eb',
                                  color: '#374151',
                                  '&:hover': {
                                    borderColor: '#1a1a1a',
                                    backgroundColor: '#f8f9fa',
                                  },
                                }}
                              >
                                <Remove fontSize="small" />
                              </Button>
                              <Button
                                disabled
                                sx={{
                                  minWidth: 40,
                                  fontWeight: 700,
                                  color: '#1a1a1a !important',
                                  borderColor: '#e5e7eb',
                                }}
                              >
                                {item.quantity}
                              </Button>
                              <Button
                                onClick={() => updateQuantity(item.id, 1)}
                                sx={{
                                  minWidth: 32,
                                  borderColor: '#e5e7eb',
                                  color: '#374151',
                                  '&:hover': {
                                    borderColor: '#1a1a1a',
                                    backgroundColor: '#f8f9fa',
                                  },
                                }}
                              >
                                <Add fontSize="small" />
                              </Button>
                            </ButtonGroup>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1a1a1a' }}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ ml: 2 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                      sx={{
                        color: '#ef4444',
                        '&:hover': {
                          backgroundColor: alpha('#ef4444', 0.1),
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

        {/* Cart Footer */}
        <Box
          sx={{
            p: 2.5,
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            flexShrink: 0,
          }}
        >
          {/* Summary */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#f8f9fa',
              borderRadius: 1.5,
              border: '1px solid #e5e7eb',
              mb: 2,
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Subtotal
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                  ${calculateSubtotal().toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Tax (10%)
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                  ${calculateTax().toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1a1a1a' }}>
                  Total
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#1a1a1a' }}>
                  ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Actions */}
          <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={cart.length === 0}
              onClick={() => setPaymentDialogOpen(true)}
              startIcon={<CheckCircle />}
              sx={{
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 700,
                py: 1.5,
                borderRadius: 1.5,
                '&:hover': {
                  backgroundColor: '#374151',
                },
                '&:disabled': {
                  backgroundColor: '#e5e7eb',
                  color: '#9ca3af',
                },
              }}
            >
              Complete Order
            </Button>
            {cart.length > 0 && (
              <Button
                fullWidth
                variant="outlined"
                size="medium"
                color="error"
                onClick={clearCart}
                startIcon={<Delete />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 1.5,
                }}
              >
                Clear All
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                backgroundColor: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle sx={{ color: '#ffffff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1a1a1a' }}>
                Complete Order
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                Enter customer details and payment method
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Order Summary */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                backgroundColor: '#f8f9fa',
                borderRadius: 1.5,
                border: '1px solid #e5e7eb',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#1a1a1a' }}>
                Order Summary
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Items ({totalItems})
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                    ${calculateSubtotal().toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Tax (10%)
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                    ${calculateTax().toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1a1a1a' }}>
                    Total Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#1a1a1a' }}>
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Payment Method */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#1a1a1a' }}>
                Payment Method
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  fullWidth
                  variant={paymentMethod === 'cash' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentMethod('cash')}
                  startIcon={<AttachMoney />}
                  sx={{
                    py: 1.5,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: paymentMethod === 'cash' ? '#1a1a1a' : '#ffffff',
                    color: paymentMethod === 'cash' ? '#ffffff' : '#374151',
                    borderColor: '#e5e7eb',
                    '&:hover': {
                      backgroundColor: paymentMethod === 'cash' ? '#374151' : '#f8f9fa',
                      borderColor: '#e5e7eb',
                    },
                  }}
                >
                  Cash
                </Button>
                <Button
                  fullWidth
                  variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentMethod('card')}
                  startIcon={<CreditCard />}
                  sx={{
                    py: 1.5,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: paymentMethod === 'card' ? '#1a1a1a' : '#ffffff',
                    color: paymentMethod === 'card' ? '#ffffff' : '#374151',
                    borderColor: '#e5e7eb',
                    '&:hover': {
                      backgroundColor: paymentMethod === 'card' ? '#374151' : '#f8f9fa',
                      borderColor: '#e5e7eb',
                    },
                  }}
                >
                  Card
                </Button>
                <Button
                  fullWidth
                  variant={paymentMethod === 'wallet' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentMethod('wallet')}
                  startIcon={<AccountBalanceWallet />}
                  sx={{
                    py: 1.5,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: paymentMethod === 'wallet' ? '#1a1a1a' : '#ffffff',
                    color: paymentMethod === 'wallet' ? '#ffffff' : '#374151',
                    borderColor: '#e5e7eb',
                    '&:hover': {
                      backgroundColor: paymentMethod === 'wallet' ? '#374151' : '#f8f9fa',
                      borderColor: '#e5e7eb',
                    },
                  }}
                >
                  Wallet
                </Button>
              </Box>
            </Box>

            {/* Customer Details */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#1a1a1a' }}>
                Customer Details
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#6b7280', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      '& fieldset': {
                        borderColor: '#e5e7eb',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1a1a1a',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: '#6b7280', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      '& fieldset': {
                        borderColor: '#e5e7eb',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1a1a1a',
                      },
                    },
                  }}
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setPaymentDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderColor: '#e5e7eb',
              color: '#374151',
              '&:hover': {
                borderColor: '#1a1a1a',
                backgroundColor: '#f8f9fa',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePlaceOrder}
            variant="contained"
            disabled={!customerName || processingOrder}
            startIcon={processingOrder ? null : <CheckCircle />}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#374151',
              },
              '&:disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
              },
            }}
          >
            {processingOrder ? 'Processing...' : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Confirmation Dialog */}
      <Dialog
        open={orderConfirmationOpen}
        onClose={() => setOrderConfirmationOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle sx={{ color: '#ffffff', fontSize: 36 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#1a1a1a', mb: 0.5 }}>
                Order Placed Successfully!
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Order #{completedOrder?.orderNumber}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {/* Order Summary */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                backgroundColor: '#f8f9fa',
                borderRadius: 1.5,
                border: '1px solid #e5e7eb',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#1a1a1a' }}>
                Order Details
              </Typography>
              
              {/* Items */}
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {completedOrder?.items.map((item: CartItem) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={item.quantity}
                        size="small"
                        sx={{
                          height: 20,
                          minWidth: 28,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        {item.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Totals */}
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Subtotal
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                    ${completedOrder?.subtotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Tax (10%)
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                    ${completedOrder?.tax.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#1a1a1a' }}>
                    Total
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#10b981' }}>
                    ${completedOrder?.total.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Customer Info */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                backgroundColor: '#f8f9fa',
                borderRadius: 1.5,
                border: '1px solid #e5e7eb',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#1a1a1a' }}>
                Customer Information
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Person sx={{ color: '#6b7280', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    {completedOrder?.customer.name}
                  </Typography>
                </Box>
                {completedOrder?.customer.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Phone sx={{ color: '#6b7280', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#374151' }}>
                      {completedOrder?.customer.phone}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CreditCard sx={{ color: '#6b7280', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#374151', textTransform: 'capitalize' }}>
                    {completedOrder?.paymentMethod}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 1.5 }}>
          <Button
            onClick={() => setOrderConfirmationOpen(false)}
            variant="outlined"
            sx={{
              flex: 1,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              py: 1.25,
              borderColor: '#e5e7eb',
              color: '#374151',
              '&:hover': {
                borderColor: '#1a1a1a',
                backgroundColor: '#f8f9fa',
              },
            }}
          >
            Close
          </Button>
          <Button
            onClick={handlePrintReceipt}
            variant="contained"
            startIcon={<Print />}
            sx={{
              flex: 1,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              py: 1.25,
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#374151',
              },
            }}
          >
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POS;