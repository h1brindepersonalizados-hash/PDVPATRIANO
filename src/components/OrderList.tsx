import { Order } from '../types';
import { differenceInDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}

export function OrderList({ orders, onEdit, onDelete }: OrderListProps) {
  const getStatusColor = (deadline: string) => {
    const today = new Date();
    const targetDate = parseISO(deadline);
    const diff = differenceInDays(targetDate, today);

    if (diff < 0) return 'bg-stone-100 text-stone-500 border-stone-200'; // Atrasado
    if (diff <= 3) return 'bg-red-50 text-red-700 border-red-200 shadow-[inset_4px_0_0_0_#ef4444]'; // Urgente
    if (diff > 10) return 'bg-emerald-50 text-emerald-700 border-emerald-200'; // Tranquilo
    return 'bg-white text-stone-700 border-stone-200'; // Normal
  };

  const getStatusIcon = (deadline: string) => {
    const today = new Date();
    const targetDate = parseISO(deadline);
    const diff = differenceInDays(targetDate, today);

    if (diff <= 3 && diff >= 0) return <AlertCircle size={16} className="text-red-500" />;
    if (diff > 10) return <CheckCircle2 size={16} className="text-emerald-500" />;
    return null;
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-medium text-stone-900 mb-1">Nenhum pedido encontrado</h3>
        <p className="text-stone-500">Comece cadastrando um novo pedido no botão acima.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm font-medium uppercase tracking-wider">
              <th className="p-4 pl-6">Contrato</th>
              <th className="p-4">Cliente / Tema</th>
              <th className="p-4">Produto</th>
              <th className="p-4">Qtd / Valor</th>
              <th className="p-4">Prazos</th>
              <th className="p-4 text-right pr-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((order) => {
              const rowClass = getStatusColor(order.printDeadline);
              return (
                <tr key={order.id} className={`transition-colors hover:bg-stone-50/50 ${rowClass}`}>
                  <td className="p-4 pl-6 font-medium">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.printDeadline)}
                      {order.contract}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-stone-900">{order.clientName}</p>
                    <p className="text-sm text-stone-500">{order.partyTheme}</p>
                  </td>
                  <td className="p-4 text-stone-700">{order.product}</td>
                  <td className="p-4">
                    <p className="text-stone-900">{order.quantity} un</p>
                    <p className="text-sm font-medium text-stone-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(order.value)}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="flex justify-between gap-4">
                        <span className="text-stone-500">Impressão:</span>
                        <span className="font-medium">
                          {format(parseISO(order.printDeadline), 'dd/MM/yyyy')}
                        </span>
                      </p>
                      <p className="flex justify-between gap-4 mt-1">
                        <span className="text-stone-500">Envio:</span>
                        <span className="font-medium">
                          {format(parseISO(order.shippingDate), 'dd/MM/yyyy')}
                        </span>
                      </p>
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(order)}
                        className="p-2 text-stone-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
                            onDelete(order.id);
                          }
                        }}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
