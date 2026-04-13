/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { OrderForm } from './components/OrderForm';
import { ReportGenerator } from './components/ReportGenerator';
import { QuoteGenerator } from './components/QuoteGenerator';
import { ProductManager } from './components/ProductManager';
import { OrderCalendar } from './components/OrderCalendar';
import { ImportOrders } from './components/ImportOrders';
import { useOrders } from './hooks/useOrders';
import { useProducts } from './hooks/useProducts';
import { Order } from './types';
import { Plus, AlertTriangle, List, Calendar as CalendarIcon, Search } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function App() {
  const { orders, addOrder, updateOrder, deleteOrder, deleteOrders, importOrders, deleteAllOrders } = useOrders();
  const { products } = useProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date();
  const urgentOrders = orders.filter((order) => {
    const deadline = parseISO(order.printDeadline);
    const diff = differenceInDays(deadline, today);
    return diff <= 3;
  });

  const displayedOrders = (showUrgentOnly ? urgentOrders : orders).filter(order => 
    order.contract.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setEditingOrder(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    if (editingOrder) {
      updateOrder(editingOrder.id, orderData);
    } else {
      addOrder(orderData);
    }
    setIsFormOpen(false);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Visão Geral</h2>
          <p className="text-stone-500">Acompanhe seus pedidos e prazos de produção.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
          <ImportOrders onImport={importOrders} />
          <ProductManager />
          <QuoteGenerator products={products} />
          <ReportGenerator orders={orders} />
          <button
            onClick={handleAddClick}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            Novo Pedido
          </button>
        </div>
      </div>

      <Dashboard orders={orders} />

      {urgentOrders.length > 0 && !showUrgentOnly && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle size={24} className="shrink-0" />
            <p className="font-medium">
              ⚠️ Você tem {urgentOrders.length} pedido{urgentOrders.length > 1 ? 's' : ''} próximo{urgentOrders.length > 1 ? 's' : ''} do prazo
            </p>
          </div>
          <button
            onClick={() => setShowUrgentOnly(true)}
            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            Visualizar pedidos
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-stone-800">
              {showUrgentOnly ? 'Pedidos Próximos do Prazo' : 'Meus Pedidos'}
            </h3>
            {showUrgentOnly && (
              <button
                onClick={() => setShowUrgentOnly(false)}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium underline"
              >
                Mostrar todos
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por contrato, cliente ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none w-full sm:w-80 text-sm"
            />
          </div>
        </div>
        
        <div className="flex bg-stone-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'list' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <List size={16} />
            Lista
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'calendar' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <CalendarIcon size={16} />
            Calendário
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <OrderList
          orders={displayedOrders}
          onEdit={handleEditClick}
          onDelete={deleteOrder}
          onDeleteMultiple={deleteOrders}
          onDeleteAll={deleteAllOrders}
          onUpdateStatus={(id, status) => updateOrder(id, { status })}
        />
      ) : (
        <OrderCalendar orders={displayedOrders} />
      )}

      {isFormOpen && (
        <OrderForm
          onSubmit={handleFormSubmit}
          onClose={() => setIsFormOpen(false)}
          initialData={editingOrder}
          products={products}
        />
      )}
    </Layout>
  );
}

