import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { X } from 'lucide-react';

interface OrderFormProps {
  onSubmit: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  initialData?: Order | null;
  products: string[];
}

export function OrderForm({ onSubmit, onClose, initialData, products }: OrderFormProps) {
  const [formData, setFormData] = useState({
    contract: '',
    clientName: '',
    partyTheme: '',
    product: products[0] || 'Outro',
    customProduct: '',
    value: '',
    quantity: '1',
    shippingDate: '',
    printDeadline: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        contract: initialData.contract,
        clientName: initialData.clientName,
        partyTheme: initialData.partyTheme,
        product: products.includes(initialData.product)
          ? initialData.product
          : 'Outro',
        customProduct: products.includes(initialData.product)
          ? ''
          : initialData.product,
        value: initialData.value.toString(),
        quantity: initialData.quantity.toString(),
        shippingDate: initialData.shippingDate,
        printDeadline: initialData.printDeadline,
      });
    }
  }, [initialData, products]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProduct =
      formData.product === 'Outro' ? formData.customProduct : formData.product;

    onSubmit({
      contract: formData.contract,
      clientName: formData.clientName,
      partyTheme: formData.partyTheme,
      product: finalProduct || 'Produto não especificado',
      value: parseFloat(formData.value) || 0,
      quantity: parseInt(formData.quantity, 10) || 1,
      shippingDate: formData.shippingDate,
      printDeadline: formData.printDeadline,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <h2 className="text-xl font-semibold text-stone-800">
            {initialData ? 'Editar Pedido' : 'Novo Pedido'}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Contrato / Pedido
              </label>
              <input
                type="text"
                name="contract"
                required
                value={formData.contract}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                placeholder="Ex: ELO-12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Nome do Cliente
              </label>
              <input
                type="text"
                name="clientName"
                required
                value={formData.clientName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Tema da Festa
              </label>
              <input
                type="text"
                name="partyTheme"
                required
                value={formData.partyTheme}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                placeholder="Ex: Safari, Princesas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Produto
              </label>
              <select
                name="product"
                value={formData.product}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all bg-white"
              >
                {products.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {formData.product === 'Outro' && (
                <input
                  type="text"
                  name="customProduct"
                  required
                  value={formData.customProduct}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all mt-2"
                  placeholder="Digite o produto"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Valor Total (R$)
              </label>
              <input
                type="number"
                name="value"
                required
                min="0"
                step="0.01"
                value={formData.value}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                name="quantity"
                required
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Data Limite para Impressão
              </label>
              <input
                type="date"
                name="printDeadline"
                required
                value={formData.printDeadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Data do Envio
              </label>
              <input
                type="date"
                name="shippingDate"
                required
                value={formData.shippingDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-medium text-white bg-pink-500 hover:bg-pink-600 transition-colors shadow-sm"
            >
              Salvar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
