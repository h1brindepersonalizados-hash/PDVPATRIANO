import { Order } from '../types';
import { differenceInDays, parseISO } from 'date-fns';
import { ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  orders: Order[];
}

export function Dashboard({ orders }: DashboardProps) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.value, 0);

  const today = new Date();
  const urgentOrders = orders.filter((order) => {
    const deadline = parseISO(order.printDeadline);
    const diff = differenceInDays(deadline, today);
    return diff <= 3 && diff >= 0;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
          <ShoppingBag size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-stone-500">Total de Pedidos</p>
          <p className="text-2xl font-bold text-stone-900">{totalOrders}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <DollarSign size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-stone-500">Total Faturado</p>
          <p className="text-2xl font-bold text-stone-900">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalRevenue)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-stone-500">Prazos Urgentes</p>
          <p className="text-2xl font-bold text-stone-900">{urgentOrders}</p>
        </div>
      </div>
    </div>
  );
}
