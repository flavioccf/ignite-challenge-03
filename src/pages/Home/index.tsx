import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, updateProductAmount, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    if(!sumAmount[product.id]) {
      sumAmount[product.id] = product.amount
    }
    return sumAmount
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      const {data} = await api.get('/products')
      setProducts(data)
    }
    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id)
  }

  return (
    <ProductList>
      {products.map(prod => {
        return (
          <li key={prod.id.toString()}>
          <img src={prod.image} alt={prod.title} />
          <strong>{ prod.title }</strong>
          <span>{formatPrice(prod.price)}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(prod.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[prod.id] || 0}
            </div>
  
            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
        )
      })}

    </ProductList>
  );
};

export default Home;
