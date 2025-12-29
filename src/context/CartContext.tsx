import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Product type for cart (compatible with both static and database products)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  inStock: boolean;
  status: 'available' | 'soon' | 'out_of_stock';
  rating: number;
  reviews: number;
  sku?: string;
  stock: Record<string, Record<string, number>>;
  sizes: string[];
  colors: string[];
  tags?: string[];
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, size: string, color: string) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bytek-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage');
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number, size: string, color: string) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && 
                item.selectedSize === size && 
                item.selectedColor === color
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { product, quantity, selectedSize: size, selectedColor: color }];
    });
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setItems(prev => prev.filter(
      item => !(item.product.id === productId && 
                item.selectedSize === size && 
                item.selectedColor === color)
    ));
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.product.id === productId && 
          item.selectedSize === size && 
          item.selectedColor === color) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => items.reduce((sum, item) => sum + item.quantity, 0);

  const getSubtotal = () => items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const getTotalPrice = () => getSubtotal();

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
