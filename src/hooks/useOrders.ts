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

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => {
      const updated = [...prev, newOrder];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const importOrders = (newOrdersData: Omit<Order, 'id'>[]) => {
    const newOrders: Order[] = newOrdersData.map(data => ({
      ...data,
      id: uuidv4(),
    }));
    setOrders(prev => {
      const updated = [...prev, ...newOrders];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateOrder = (id: string, updatedData: Partial<Order>) => {
    setOrders(prev => {
      const updated = prev.map((order) =>
        order.id === id ? { ...order, ...updatedData } : order
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => {
      const updated = prev.filter((order) => order.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteOrders = (ids: string[]) => {
    setOrders(prev => {
      const updated = prev.filter((order) => !ids.includes(order.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAllOrders = () => {
    setOrders([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  };

  return {
    orders,
    addOrder,
    importOrders,
    updateOrder,
    deleteOrder,
    deleteOrders,
    deleteAllOrders,
  };
}
