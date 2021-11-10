import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    const hasItemInCart = cart.find(prod => prod.id === productId)
    if(!hasItemInCart) {
      try {
        const product = await api.get(`/products/${productId}`)
        const newProduct = {
          ...product.data,
          amount: 1
        }
        const newCart = [...cart, newProduct]
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      } catch (error: any) {
        if(error.response && error.response.status === 404) {
          toast.error('Erro na adição do produto')
        } else {
          toast.error(error.message)
        }
      }
    } else {
      await updateProductAmount({productId, amount: hasItemInCart.amount+1})
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const removeFromCart = cart.filter(prod => prod.id !== productId)
      if(cart.length === removeFromCart.length) throw Error('Erro na remoção do produto')
      setCart(removeFromCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(removeFromCart))
    } catch(error: any) {
      toast.error(error.message)
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const {data} = await api.get(`/stock/${productId}`)
      if(data.amount < amount || amount < 1) throw Error('Quantidade solicitada fora de estoque')
      const updatedCart = cart.map(product => {
        if(product.id === productId) {
          product.amount = amount
        }
        return product
      })
      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch(error: any) {
      if(error.response && error.response.status === 404) {
        toast.error('Erro na alteração de quantidade do produto')
      } else {
        toast.error(error.message)
      }
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
