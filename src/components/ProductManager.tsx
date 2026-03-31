import React, { useState } from 'react';
import { X, Plus, Trash2, Settings } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

export function ProductManager() {
  const [isOpen, setIsOpen] = useState(false);
  const { products, addProduct, removeProduct } = useProducts();
  const [newProduct, setNewProduct] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.trim()) {
      addProduct(newProduct);
      setNewProduct('');
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
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

            <form onSubmit={handleAdd} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                placeholder="Novo produto..."
                className="flex-1 px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newProduct.trim()}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:hover:bg-pink-500 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Adicionar
              </button>
            </form>

            <div className="max-h-64 overflow-y-auto border border-stone-100 rounded-lg divide-y divide-stone-100">
              {products.map((product) => (
                <div key={product} className="flex justify-between items-center p-3 hover:bg-stone-50 transition-colors">
                  <span className="text-stone-700">{product}</span>
                  {product !== 'Outro' && (
                    <button
                      onClick={() => removeProduct(product)}
                      className="text-stone-400 hover:text-red-500 transition-colors p-1"
                      title="Remover produto"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              {products.length === 0 && (
                <div className="p-4 text-center text-stone-500 text-sm">
                  Nenhum produto cadastrado.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
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
