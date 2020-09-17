import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem('@GoMarketPlaced:products',);

      if (storedProducts) {
        setProducts( [ ... JSON.parse(storedProducts) ] );
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productIndex = products.findIndex( prd => prd.id === product.id );
    if (productIndex < 0) {
      setProducts( [ ...products, { ...product, quantity: 1 } ] );
    }
    else {
      const prd = products[productIndex];
      prd.quantity = prd.quantity + 1;
      products[productIndex] = prd;
    }
    await AsyncStorage.setItem('@GoMarketPlaced:products', JSON.stringify(products));
  }, [products]);

  const increment = useCallback(async id => {
    const prods = products;
    const productIndex = prods.findIndex( prd => prd.id === id );

    const prd = prods[productIndex];
    prd.quantity = prd.quantity + 1;
    prods[productIndex] = prd;
    setProducts( [ ...prods ] );

    await AsyncStorage.setItem('@GoMarketPlaced:products', JSON.stringify(products));
  }, [products]);

  const decrement = useCallback(async id => {
    const prods = products;
    const productIndex = prods.findIndex( prd => prd.id === id );

    const prd = prods[productIndex];
    if (prd.quantity > 1) {
      prd.quantity = prd.quantity - 1;
    }

    prods[productIndex] = prd;
    setProducts( [ ...prods ] );

    await AsyncStorage.setItem('@GoMarketPlaced:products', JSON.stringify(products));
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
