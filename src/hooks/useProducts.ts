import { useState, useEffect } from 'react';

const STORAGE_KEY = 'pdv_papelaria_patriano_products';
const DEFAULT_PRODUCTS = [
  'Convite',
  'Lembrancinha',
  'Topo de Bolo',
  'Adesivos',
  'Caixa Personalizada',
  'Kit Festa',
  'Outro'
];

export function useProducts() {
  const [products, setProducts] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch (e) {
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    }
  }, []);

  const addProduct = (product: string) => {
    const trimmed = product.trim();
    if (trimmed && !products.includes(trimmed)) {
      const newProducts = [...products, trimmed];
      setProducts(newProducts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
    }
  };

  const removeProduct = (product: string) => {
    const newProducts = products.filter(p => p !== product);
    setProducts(newProducts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
  };

  return { products, addProduct, removeProduct };
}
