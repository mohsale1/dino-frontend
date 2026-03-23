// Mock data for testing the public menu UI

export const mockMenuData = {
  organization: {
    id: "org123",
    name: "The Gourmet Kitchen",
    description: "Experience fine dining with our carefully curated menu featuring local and international cuisines."
  },
  table: {
    id: "table456",
    table_number: "T-12",
    area_id: "area1",
    capacity: 4,
    status: "available"
  },
  area: {
    id: "area1",
    name: "Main Dining Hall",
    description: "Our spacious main dining area"
  },
  categories: [
    {
      id: "cat1",
      name: "Appetizers",
      description: "Start your meal right",
      workspace_id: "ws1",
      is_available: true,
      display_order: 1
    },
    {
      id: "cat2",
      name: "Main Course",
      description: "Hearty and delicious",
      workspace_id: "ws1",
      is_available: true,
      display_order: 2
    },
    {
      id: "cat3",
      name: "Desserts",
      description: "Sweet endings",
      workspace_id: "ws1",
      is_available: true,
      display_order: 3
    },
    {
      id: "cat4",
      name: "Beverages",
      description: "Refreshing drinks",
      workspace_id: "ws1",
      is_available: true,
      display_order: 4
    }
  ],
  items: [
    // Appetizers
    {
      id: "item1",
      name: "Bruschetta",
      description: "Grilled bread topped with fresh tomatoes, garlic, and basil",
      category_id: "cat1",
      workspace_id: "ws1",
      price: 250.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 1
    },
    {
      id: "item2",
      name: "Chicken Wings",
      description: "Crispy wings tossed in your choice of sauce",
      category_id: "cat1",
      workspace_id: "ws1",
      price: 350.00,
      is_available: true,
      is_vegetarian: false,
      display_order: 2
    },
    {
      id: "item3",
      name: "Spring Rolls",
      description: "Crispy vegetable spring rolls with sweet chili sauce",
      category_id: "cat1",
      workspace_id: "ws1",
      price: 200.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 3
    },
    {
      id: "item4",
      name: "Garlic Bread",
      description: "Toasted bread with garlic butter and herbs",
      category_id: "cat1",
      workspace_id: "ws1",
      price: 150.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 4
    },
    
    // Main Course
    {
      id: "item5",
      name: "Margherita Pizza",
      description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
      category_id: "cat2",
      workspace_id: "ws1",
      price: 450.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 1
    },
    {
      id: "item6",
      name: "Grilled Chicken Steak",
      description: "Juicy chicken breast with mashed potatoes and vegetables",
      category_id: "cat2",
      workspace_id: "ws1",
      price: 550.00,
      is_available: true,
      is_vegetarian: false,
      display_order: 2
    },
    {
      id: "item7",
      name: "Pasta Alfredo",
      description: "Creamy fettuccine pasta with parmesan cheese",
      category_id: "cat2",
      workspace_id: "ws1",
      price: 400.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 3
    },
    {
      id: "item8",
      name: "Fish and Chips",
      description: "Crispy battered fish with french fries and tartar sauce",
      category_id: "cat2",
      workspace_id: "ws1",
      price: 500.00,
      is_available: true,
      is_vegetarian: false,
      display_order: 4
    },
    {
      id: "item9",
      name: "Vegetable Biryani",
      description: "Aromatic basmati rice with mixed vegetables and spices",
      category_id: "cat2",
      workspace_id: "ws1",
      price: 350.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 5
    },
    {
      id: "item10",
      name: "Butter Chicken",
      description: "Tender chicken in rich tomato and butter gravy",
      category_id: "cat2",
      workspace_id: "ws1",
      price: 450.00,
      is_available: true,
      is_vegetarian: false,
      display_order: 6
    },
    
    // Desserts
    {
      id: "item11",
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with molten center, served with vanilla ice cream",
      category_id: "cat3",
      workspace_id: "ws1",
      price: 250.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 1
    },
    {
      id: "item12",
      name: "Tiramisu",
      description: "Classic Italian dessert with coffee-soaked ladyfingers",
      category_id: "cat3",
      workspace_id: "ws1",
      price: 280.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 2
    },
    {
      id: "item13",
      name: "Ice Cream Sundae",
      description: "Three scoops of ice cream with toppings of your choice",
      category_id: "cat3",
      workspace_id: "ws1",
      price: 200.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 3
    },
    {
      id: "item14",
      name: "Cheesecake",
      description: "Creamy New York style cheesecake with berry compote",
      category_id: "cat3",
      workspace_id: "ws1",
      price: 300.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 4
    },
    
    // Beverages
    {
      id: "item15",
      name: "Fresh Lime Soda",
      description: "Refreshing lime juice with soda water",
      category_id: "cat4",
      workspace_id: "ws1",
      price: 80.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 1
    },
    {
      id: "item16",
      name: "Mango Lassi",
      description: "Sweet yogurt drink with fresh mango",
      category_id: "cat4",
      workspace_id: "ws1",
      price: 100.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 2
    },
    {
      id: "item17",
      name: "Cappuccino",
      description: "Espresso with steamed milk and foam",
      category_id: "cat4",
      workspace_id: "ws1",
      price: 120.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 3
    },
    {
      id: "item18",
      name: "Fresh Orange Juice",
      description: "Freshly squeezed orange juice",
      category_id: "cat4",
      workspace_id: "ws1",
      price: 90.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 4
    },
    {
      id: "item19",
      name: "Iced Tea",
      description: "Chilled tea with lemon and mint",
      category_id: "cat4",
      workspace_id: "ws1",
      price: 70.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 5
    },
    {
      id: "item20",
      name: "Coca Cola",
      description: "Chilled soft drink",
      category_id: "cat4",
      workspace_id: "ws1",
      price: 60.00,
      is_available: true,
      is_vegetarian: true,
      display_order: 6
    }
  ]
};

export const mockOrders = [
  {
    id: "order1",
    order_number: "ORD-20260203001",
    organization_id: "org123",
    table_id: "table456",
    customer_name: "John Doe",
    customer_phone: "9876543210",
    items: [
      {
        item_id: "item5",
        item_name: "Margherita Pizza",
        quantity: 1,
        unit_price: 450.00,
        total_price: 450.00
      },
      {
        item_id: "item15",
        item_name: "Fresh Lime Soda",
        quantity: 2,
        unit_price: 80.00,
        total_price: 160.00
      }
    ],
    subtotal: 610.00,
    tax_amount: 30.50,
    service_charge: 61.00,
    total_amount: 701.50,
    status: "preparing",
    payment_status: "unpaid",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: "order2",
    order_number: "ORD-20260202001",
    organization_id: "org123",
    table_id: "table456",
    customer_name: "John Doe",
    customer_phone: "9876543210",
    items: [
      {
        item_id: "item6",
        item_name: "Grilled Chicken Steak",
        quantity: 1,
        unit_price: 550.00,
        total_price: 550.00
      },
      {
        item_id: "item11",
        item_name: "Chocolate Lava Cake",
        quantity: 1,
        unit_price: 250.00,
        total_price: 250.00
      }
    ],
    subtotal: 800.00,
    tax_amount: 40.00,
    service_charge: 80.00,
    total_amount: 920.00,
    status: "completed",
    payment_status: "paid",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
  }
];