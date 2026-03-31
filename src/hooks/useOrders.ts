import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../types';

const STORAGE_KEY = 'pdv_papelaria_patriano_orders';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedOrders = localStorage.getItem(STORAGE_KEY);
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch (e) {
        console.error('Failed to parse stored orders', e);
      }
    }
  }, []);

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders));
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    saveOrders([...orders, newOrder]);
  };

  const updateOrder = (id: string, updatedData: Partial<Order>) => {
    const newOrders = orders.map((order) =>
      order.id === id ? { ...order, ...updatedData } : order
    );
    saveOrders(newOrders);
  };

  const deleteOrder = (id: string) => {
    const newOrders = orders.filter((order) => order.id !== id);
    saveOrders(newOrders);
  };

  return {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
  };
}
