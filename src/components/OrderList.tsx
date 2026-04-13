import { useState } from 'react';
import { Order } from '../types';
import { differenceInDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  onDeleteAll?: () => void;
  onUpdateStatus?: (id: string, status: any) => void;
}

export function OrderList({ orders, onEdit, onDelete, onDeleteMultiple, onDeleteAll, onUpdateStatus }: OrderListProps) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    action: () => void;
  }>({ isOpen: false, message: '', action: () => {} });

  const requestConfirm = (message: string, action: () => void) => {
    setConfirmDialog({ isOpen: true, message, action });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-stone-100 text-stone-600';
      case 'IMPRIMIR': return 'bg-blue-100 text-blue-700';
      case 'PRODUÇÃO': return 'bg-purple-100 text-purple-700';
      case 'ENVIAR': return 'bg-orange-100 text-orange-700';
      case 'ENVIADO': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-stone-100 text-stone-600';
    }
  };

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

  const handleDeleteAll = () => {
    if (onDeleteAll) {
      requestConfirm('Tem certeza que deseja excluir TODOS os pedidos listados? Esta ação não pode ser desfeita.', () => {
        onDeleteAll();
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedOrders.size > 0) {
      requestConfirm(`Tem certeza que deseja excluir os ${selectedOrders.size} pedidos selecionados?`, () => {
        if (onDeleteMultiple) {
          onDeleteMultiple(Array.from(selectedOrders));
        } else {
          selectedOrders.forEach(id => onDelete(id));
        }
        setSelectedOrders(new Set());
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOrders(newSelected);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
        <div className="text-sm text-stone-600">
          {selectedOrders.size > 0 ? (
            <span className="font-medium text-pink-600">{selectedOrders.size} selecionado(s)</span>
          ) : (
            <span>Nenhum selecionado</span>
          )}
        </div>
        <div className="flex gap-2">
          {selectedOrders.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2 text-sm"
            >
              <Trash2 size={16} />
              Excluir Selecionados
            </button>
          )}
          {onDeleteAll && orders.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-stone-100 text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors font-medium flex items-center gap-2 text-sm"
            >
              <Trash2 size={16} />
              Excluir Todos
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm font-medium uppercase tracking-wider">
              <th className="p-4 pl-6 w-12">
                <input
                  type="checkbox"
                  checked={orders.length > 0 && selectedOrders.size === orders.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-stone-300 text-pink-500 focus:ring-pink-500"
                />
              </th>
              <th className="p-4">Contrato</th>
              <th className="p-4">Cliente / Tema</th>
              <th className="p-4">Produto</th>
              <th className="p-4">Status</th>
              <th className="p-4">Qtd / Valor Total</th>
              <th className="p-4">Prazos</th>
              <th className="p-4 text-right pr-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((order) => {
              const rowClass = getStatusColor(order.printDeadline);
              const isSelected = selectedOrders.has(order.id);
              return (
                <tr key={order.id} className={`transition-colors hover:bg-stone-50/50 ${isSelected ? 'bg-pink-50/30' : rowClass}`}>
                  <td className="p-4 pl-6">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(order.id)}
                      className="w-4 h-4 rounded border-stone-300 text-pink-500 focus:ring-pink-500"
                    />
                  </td>
                  <td className="p-4 font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="text-stone-900">{order.contract}</span>
                      {order.source && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit ${
                          order.source === 'Shopee' ? 'bg-orange-100 text-orange-700' :
                          order.source === 'Elo7' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {order.source}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-stone-900">{order.clientName}</p>
                    <p className="text-sm text-stone-500">{order.partyTheme}</p>
                  </td>
                  <td className="p-4 text-stone-700">{order.product}</td>
                  <td className="p-4">
                    <select
                      value={order.status || 'PENDENTE'}
                      onChange={(e) => onUpdateStatus?.(order.id, e.target.value)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-pink-500 outline-none appearance-none text-center ${getStatusBadgeColor(order.status || 'PENDENTE')}`}
                    >
                      <option value="PENDENTE">Pendente</option>
                      <option value="IMPRIMIR">Imprimir</option>
                      <option value="PRODUÇÃO">Produção</option>
                      <option value="ENVIAR">Enviar</option>
                      <option value="ENVIADO">Enviado</option>
                    </select>
                  </td>
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
                          requestConfirm('Tem certeza que deseja excluir este pedido?', () => {
                            onDelete(order.id);
                          });
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

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertCircle size={24} />
                <h3 className="text-lg font-semibold text-stone-900">Confirmar Exclusão</h3>
              </div>
              <p className="text-stone-600">{confirmDialog.message}</p>
            </div>
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="px-4 py-2 text-stone-600 font-medium hover:bg-stone-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmDialog.action();
                  setConfirmDialog({ ...confirmDialog, isOpen: false });
                }}
                className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
