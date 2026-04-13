import { useState, useEffect } from 'react';
import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'pdv_papelaria_patriano_products_v2';
const OLD_STORAGE_KEY = 'pdv_papelaria_patriano_products';

const DEFAULT_PRODUCTS: Product[] = [
  { id: uuidv4(), name: 'Convite', price: 0, characteristics: '' },
  { id: uuidv4(), name: 'Lembrancinha', price: 0, characteristics: '' },
  { id: uuidv4(), name: 'Topo de Bolo', price: 0, characteristics: '' },
  { id: uuidv4(), name: 'Adesivos', price: 0, characteristics: '' },
  { id: uuidv4(), name: 'Caixa Personalizada', price: 0, characteristics: '' },
  { id: uuidv4(), name: 'Kit Festa', price: 0, characteristics: '' },
  { id: uuidv4(), name: 'Outro', price: 0, characteristics: '' }
];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch (e) {
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      // Try to migrate from old storage
      const oldStored = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldStored) {
        try {
          const oldProducts: string[] = JSON.parse(oldStored);
          const migrated = oldProducts.map(name => ({
            id: uuidv4(),
            name,
            price: 0,
            characteristics: ''
          }));
          setProducts(migrated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        } catch (e) {
          setProducts(DEFAULT_PRODUCTS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
        }
      } else {
        setProducts(DEFAULT_PRODUCTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      }
    }
  }, []);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProducts = [...products, { ...product, id: uuidv4() }];
    setProducts(newProducts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
  };

  const removeProduct = (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    setProducts(newProducts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
  };

  return { products, addProduct, removeProduct };
}
