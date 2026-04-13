import React, { useState } from 'react';
import { X, Plus, Trash2, Settings } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

export function ProductManager() {
  const [isOpen, setIsOpen] = useState(false);
  const { products, addProduct, removeProduct } = useProducts();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [characteristics, setCharacteristics] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addProduct({
        name: name.trim(),
        price: parseFloat(price) || 0,
        characteristics: characteristics.trim()
      });
      setName('');
      setPrice('');
      setCharacteristics('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all font-medium shadow-sm"
        title="Gerenciar Produtos"
      >
        <Settings size={18} className="text-pink-600" />
        <span className="hidden sm:inline">Produtos</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
                <Settings size={20} className="text-pink-500" />
                Gerenciar Produtos
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6 shrink-0">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Adicionar Novo Produto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Topo de Bolo"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Valor Padrão (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Características / Descrição</label>
                  <input
                    type="text"
                    value={characteristics}
                    onChange={(e) => setCharacteristics(e.target.value)}
                    placeholder="Ex: Papel fotográfico 230g, corte eletrônico..."
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus size={16} />
                  Adicionar Produto
                </button>
              </div>
            </form>

            <div className="overflow-y-auto border border-stone-100 rounded-lg divide-y divide-stone-100 flex-1">
              {products.map((product) => (
                <div key={product.id} className="flex justify-between items-start p-4 hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-800">{product.name}</span>
                      {product.price > 0 && (
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                        </span>
                      )}
                    </div>
                    {product.characteristics && (
                      <p className="text-sm text-stone-500 mt-1">{product.characteristics}</p>
                    )}
                  </div>
                  {product.name !== 'Outro' && (
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="text-stone-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Remover produto"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              {products.length === 0 && (
                <div className="p-8 text-center text-stone-500 text-sm">
                  Nenhum produto cadastrado.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
