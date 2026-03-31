import { useState } from 'react';
import { Order } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { FileText, Filter, X } from 'lucide-react';

interface ReportGeneratorProps {
  orders: Order[];
}

export function ReportGenerator({ orders }: ReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    product: '',
    contract: '',
  });

  const handleGenerate = () => {
    let filteredOrders = [...orders];

    if (filters.startDate && filters.endDate) {
      filteredOrders = filteredOrders.filter((order) => {
        const orderDate = parseISO(order.shippingDate);
        return isWithinInterval(orderDate, {
          start: parseISO(filters.startDate),
          end: parseISO(filters.endDate),
        });
      });
    }

    if (filters.product) {
      filteredOrders = filteredOrders.filter((order) =>
        order.product.toLowerCase().includes(filters.product.toLowerCase())
      );
    }

    if (filters.contract) {
      filteredOrders = filteredOrders.filter((order) =>
        order.contract.toLowerCase().includes(filters.contract.toLowerCase())
      );
    }

    generatePDF(filteredOrders);
    setIsOpen(false);
  };

  const generatePDF = (data: Order[]) => {
    const doc = new jsPDF();
    const totalValue = data.reduce((sum, order) => sum + order.value, 0);

    doc.setFontSize(18);
    doc.text('Relatório de Pedidos - PDV Papelaria Patriano', 14, 22);

    doc.setFontSize(11);
    doc.text(`Data de Geração: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    doc.text(`Total de Pedidos: ${data.length}`, 14, 36);
    doc.text(
      `Valor Total: ${new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(totalValue)}`,
      14,
      42
    );

    const tableData = data.map((order) => [
      order.contract,
      order.clientName,
      order.product,
      order.quantity.toString(),
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value),
      format(parseISO(order.shippingDate), 'dd/MM/yyyy'),
      format(parseISO(order.printDeadline), 'dd/MM/yyyy'),
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Contrato', 'Cliente', 'Produto', 'Qtd', 'Valor', 'Envio', 'Impressão']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [236, 72, 153] }, // pink-500
      styles: { fontSize: 9 },
    });

    doc.save(`relatorio-pedidos-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all font-medium shadow-sm"
      >
        <FileText size={18} />
        Gerar Relatório
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
                <Filter size={20} className="text-pink-500" />
                Filtros do Relatório
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Data Início (Envio)
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Data Fim (Envio)
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Produto</label>
                <input
                  type="text"
                  placeholder="Filtrar por nome do produto"
                  value={filters.product}
                  onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Contrato</label>
                <input
                  type="text"
                  placeholder="Filtrar por número do contrato"
                  value={filters.contract}
                  onChange={(e) => setFilters({ ...filters, contract: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                <FileText size={18} />
                Baixar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
