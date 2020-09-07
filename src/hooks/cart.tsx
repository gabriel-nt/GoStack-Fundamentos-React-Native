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
  trash(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (data) {
        setProducts(JSON.parse(data));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExist = products.find(
        itemCart => itemCart.id === product.id,
      );

      if (productExist) {
        const updateProducts = products.map(item => {
          if (item.id === productExist.id) {
            const quantity = item.quantity + 1;

            return {
              ...item,
              quantity,
            };
          }

          return item;
        });

        setProducts(updateProducts);
      } else {
        const addProduct = {
          ...product,
          quantity: 1,
        };

        setProducts([...products, addProduct]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const findProduct = products.find(itemCart => itemCart.id === id);

      if (!findProduct) {
        throw new Error('This product is not in cart');
      }

      const updateProducts = products.map(product => {
        if (product.id === findProduct.id) {
          const quantity = findProduct.quantity + 1;

          return {
            ...product,
            quantity,
          };
        }

        return product;
      });

      setProducts(updateProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const trash = useCallback(
    async id => {
      const findProduct = products.find(itemCart => itemCart.id === id);

      if (!findProduct) {
        throw new Error('This product is not in cart');
      }

      const updateProducts = products.filter(
        product => product.id !== findProduct.id,
      );

      setProducts(updateProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const findProduct = products.find(itemCart => itemCart.id === id);

      if (!findProduct) {
        throw new Error('This product is not in cart');
      }

      const updateProducts = products.map(product => {
        if (product.id === findProduct.id) {
          const quantity = findProduct.quantity - 1;

          if (quantity > 0) {
            return {
              ...product,
              quantity,
            };
          }

          return product;
        }

        return product;
      });

      setProducts(updateProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, trash, products }),
    [products, addToCart, increment, decrement, trash],
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
