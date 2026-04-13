import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { FileText, Send, Plus, Trash2, X, Calculator } from 'lucide-react';
import { Product } from '../types';

interface QuoteItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteGeneratorProps {
  products: Product[];
}

export function QuoteGenerator({ products }: QuoteGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('Orçamento válido por 5 dias.\nFrete não incluso.');
  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', product: '', quantity: 1, unitPrice: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), product: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-fill price if product changes
        if (field === 'product') {
          const selectedProduct = products.find(p => p.name === value);
          if (selectedProduct && selectedProduct.price > 0) {
            updatedItem.unitPrice = selectedProduct.price;
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const total = calculateTotal();

    doc.setFontSize(20);
    doc.setTextColor(236, 72, 153); // pink-500
    doc.text('Orçamento', 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text('PDV Papelaria Patriano', 14, 30);
    
    doc.setFontSize(10);
    doc.text(`Data: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 40);
    doc.text(`Cliente: ${clientName || 'Não informado'}`, 14, 46);
    if (deliveryDate) {
      doc.text(`Data de Entrega: ${format(parseISO(deliveryDate), 'dd/MM/yyyy')}`, 14, 52);
    }

    const tableData = items.map(item => [
      item.product || 'Item não especificado',
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.quantity * item.unitPrice)
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Produto/Serviço', 'Qtd', 'Valor Unit.', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [236, 72, 153] }, // pink-500
      foot: [['', '', 'TOTAL:', formatCurrency(total)]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 60;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Observações:', 14, finalY + 15);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    
    const splitNotes = doc.splitTextToSize(notes, 180);
    doc.text(splitNotes, 14, finalY + 22);

    doc.save(`orcamento-${clientName.replace(/\s+/g, '-').toLowerCase() || 'cliente'}.pdf`);
  };

  const sendWhatsApp = () => {
    const total = calculateTotal();
    let message = `Olá ${clientName ? `*${clientName}*` : ''}, segue o seu orçamento da *Papelaria Patriano*:\n\n`;
    
    if (deliveryDate) {
      message += `*Data de Entrega:* ${format(parseISO(deliveryDate), 'dd/MM/yyyy')}\n\n`;
    }

    message += `*Itens:*\n`;
    items.forEach(item => {
      if (item.product) {
        message += `- ${item.quantity}x ${item.product} (${formatCurrency(item.unitPrice)}/un) = *${formatCurrency(item.quantity * item.unitPrice)}*\n`;
      }
    });

    message += `\n*Valor Total:* ${formatCurrency(total)}\n\n`;
    
    if (notes) {
      message += `*Observações:*\n${notes}\n\n`;
    }
    
    message += `Qualquer dúvida, estou à disposição!`;

    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phone.replace(/\D/g, '');
    
    let waUrl = 'https://wa.me/';
    if (cleanPhone) {
      const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
      waUrl += `${finalPhone}?text=${encodedMessage}`;
    } else {
      waUrl += `?text=${encodedMessage}`;
    }

    window.open(waUrl, '_blank');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all font-medium shadow-sm"
      >
        <Calculator size={18} className="text-emerald-600" />
        Novo Orçamento
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
            <div className="flex justify-between items-center p-6 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
                <Calculator size={24} className="text-emerald-600" />
                Gerador de Orçamento
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp (Opcional)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 11999999999"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Data de Entrega</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-stone-700">Itens do Orçamento</label>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-stone-50 p-3 rounded-lg border border-stone-100">
                      <div className="flex-1 w-full relative">
                        <input
                          type="text"
                          placeholder="Produto / Serviço"
                          value={item.product}
                          onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                          list={`products-list-${item.id}`}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        />
                        <datalist id={`products-list-${item.id}`}>
                          {products.map(p => (
                            <option key={p.id} value={p.name} />
                          ))}
                        </datalist>
                      </div>
                      <div className="w-full sm:w-24">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qtd"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        />
                      </div>
                      <div className="w-full sm:w-32">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="R$ Unit."
                          value={item.unitPrice || ''}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        />
                      </div>
                      <div className="w-full sm:w-auto flex justify-between items-center gap-3">
                        <span className="font-medium text-stone-700 min-w-[80px] text-right">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="p-2 text-stone-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addItem}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Plus size={16} />
                  Adicionar Item
                </button>
              </div>

              {/* Total & Notes */}
              <div className="flex flex-col md:flex-row gap-6 pt-4 border-t border-stone-100">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Observações</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
                <div className="md:w-64 bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col justify-center">
                  <span className="text-sm font-medium text-emerald-800 mb-1">Total do Orçamento</span>
                  <span className="text-3xl font-bold text-emerald-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-stone-100 bg-stone-50 rounded-b-2xl flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 font-medium text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={generatePDF}
                className="px-4 py-2 font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <FileText size={18} />
                Baixar PDF
              </button>
              <button
                onClick={sendWhatsApp}
                className="px-4 py-2 font-medium text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
