import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Check, AlertCircle, X } from 'lucide-react';
import { Order } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, format } from 'date-fns';

interface ImportOrdersProps {
  onImport: (orders: Omit<Order, 'id'>[]) => void;
}

export function ImportOrders({ onImport }: ImportOrdersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [mappedOrders, setMappedOrders] = useState<Omit<Order, 'id'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'Shopee' | 'Elo7'>('Shopee');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        setPreviewData(json);
        mapDataToOrders(json);
      } catch (err) {
        console.error(err);
        setError('Erro ao ler o arquivo. Certifique-se de que é uma planilha válida (.xlsx ou .csv).');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const findColumnValue = (row: any, possibleNames: string[]) => {
    const keys = Object.keys(row);
    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 1. Tenta match exato primeiro (ignorando espaços extras e case)
    for (const name of possibleNames) {
      const match = keys.find(k => k.toLowerCase().trim() === name.toLowerCase().trim());
      if (match && row[match] !== undefined && row[match] !== '') return row[match];
    }
    
    // 2. Tenta match exato normalizado (sem espaços e caracteres especiais)
    for (const name of possibleNames) {
      const normName = normalize(name);
      const match = keys.find(k => normalize(k) === normName);
      if (match && row[match] !== undefined && row[match] !== '') return row[match];
    }

    // 3. Tenta match parcial (se a coluna contiver a palavra chave)
    for (const name of possibleNames) {
      const match = keys.find(k => k.toLowerCase().includes(name.toLowerCase()));
      if (match && row[match] !== undefined && row[match] !== '') return row[match];
    }
    
    // 4. Fallback agressivo: match parcial normalizado
    for (const name of possibleNames) {
      const normName = normalize(name);
      const match = keys.find(k => normalize(k).includes(normName));
      if (match && row[match] !== undefined && row[match] !== '') return row[match];
    }
    
    return null;
  };

  const mapDataToOrders = (data: any[]) => {
    const mapped: Omit<Order, 'id'>[] = [];
    const today = new Date();

    data.forEach(row => {
      // Shopee mappings
      const shopeeContract = findColumnValue(row, ['nº do pedido', 'id do pedido', 'numero do pedido', 'pedido']);
      const shopeeClient = findColumnValue(row, ['nome de usuário (comprador)', 'comprador', 'nome do comprador', 'cliente']);
      const shopeeProduct = findColumnValue(row, ['nome do produto', 'produto', 'nome do item']);
      const shopeeValue = findColumnValue(row, ['valor do pedido', 'valor pedido', 'preço total', 'valor total', 'total pago', 'valor', 'preço', 'total']);
      
      // Elo7 mappings
      const elo7Contract = findColumnValue(row, ['pedido', 'código do pedido', 'numero']);
      const elo7Client = findColumnValue(row, ['comprador', 'nome', 'cliente']);
      const elo7Product = findColumnValue(row, ['produto', 'título do produto', 'titulo', 'nome do produto', 'item']);
      const elo7Value = findColumnValue(row, ['valor pedido', 'valor do pedido', 'valor total', 'preço total', 'valor', 'preço', 'total']);

      const contract = platform === 'Shopee' ? shopeeContract : elo7Contract;
      const clientName = platform === 'Shopee' ? shopeeClient : elo7Client;
      const product = platform === 'Shopee' ? shopeeProduct : elo7Product;
      let rawValue = platform === 'Shopee' ? shopeeValue : elo7Value;
      
      // Tratamento de valor (pode vir como string com R$ ou vírgula)
      let value = 0;
      if (typeof rawValue === 'string') {
        let cleanStr = rawValue.replace(/[R$\s]/gi, '');
        const lastDot = cleanStr.lastIndexOf('.');
        const lastComma = cleanStr.lastIndexOf(',');
        
        if (lastComma > lastDot) {
          cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
        } else if (lastDot > lastComma) {
          cleanStr = cleanStr.replace(/,/g, '');
        } else if (lastComma !== -1) {
          cleanStr = cleanStr.replace(',', '.');
        }
        value = parseFloat(cleanStr) || 0;
      } else if (typeof rawValue === 'number') {
        value = rawValue;
      }

      const quantityRaw = findColumnValue(row, ['Quantidade', 'Qtd', 'Quantity']);
      const quantity = parseInt(String(quantityRaw || '1'), 10) || 1;

      // Busca data de envio na planilha
      const shippingDateRaw = findColumnValue(row, ['Data Limite de Envio', 'Data de Envio', 'Prazo de Envio', 'Tempo de Envio', 'Ship By Date']);
      let parsedShippingDate = addDays(today, 7);
      
      if (shippingDateRaw) {
        if (typeof shippingDateRaw === 'number') {
          // Excel serial date
          parsedShippingDate = new Date(Math.round((shippingDateRaw - 25569) * 86400 * 1000));
        } else if (typeof shippingDateRaw === 'string') {
          const parts = shippingDateRaw.split(/[-/ :]/);
          if (parts.length >= 3) {
            if (parts[0].length === 4) {
              parsedShippingDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
              parsedShippingDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
          }
        }
      }

      const shippingDate = format(parsedShippingDate, 'yyyy-MM-dd');
      const printDeadline = format(addDays(today, 2), 'yyyy-MM-dd');

      if (contract || (clientName && clientName !== 'Cliente Importado')) {
        mapped.push({
          contract: String(contract || `IMP-${Math.floor(Math.random() * 10000)}`),
          clientName: String(clientName || 'Cliente Importado'),
          partyTheme: 'A Definir', // Tema geralmente não vem na planilha principal
          product: String(product || 'Produto Importado'),
          value,
          quantity,
          shippingDate,
          printDeadline,
          createdAt: new Date().toISOString(),
          source: platform,
          status: 'PENDENTE'
        });
      }
    });

    if (mapped.length === 0 && data.length > 0) {
      setError('Não foi possível identificar os pedidos na planilha. Verifique se as colunas estão corretas.');
    }

    setMappedOrders(mapped);
  };

  const handleImport = () => {
    if (mappedOrders.length > 0) {
      onImport(mappedOrders);
      setIsOpen(false);
      setFile(null);
      setPreviewData([]);
      setMappedOrders([]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors font-medium shadow-sm"
      >
        <FileSpreadsheet size={20} className="text-emerald-600" />
        Importar Planilha
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-stone-100 shrink-0">
              <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
                <FileSpreadsheet size={24} className="text-emerald-600" />
                Importar Pedidos (Shopee / Elo7)
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {!file ? (
                <div className="space-y-6">
                  <div className="flex gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <label className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${platform === 'Shopee' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-transparent bg-white hover:bg-stone-100 text-stone-600'}`}>
                      <input type="radio" name="platform" value="Shopee" checked={platform === 'Shopee'} onChange={() => setPlatform('Shopee')} className="hidden" />
                      <span className="font-bold text-lg">Shopee</span>
                    </label>
                    <label className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${platform === 'Elo7' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-transparent bg-white hover:bg-stone-100 text-stone-600'}`}>
                      <input type="radio" name="platform" value="Elo7" checked={platform === 'Elo7'} onChange={() => setPlatform('Elo7')} className="hidden" />
                      <span className="font-bold text-lg">Elo7</span>
                    </label>
                  </div>

                  <div 
                    className="border-2 border-dashed border-stone-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:bg-stone-50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onChange={handleFileChange}
                    />
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <Upload size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-stone-800 mb-2">Clique para selecionar o arquivo</h3>
                    <p className="text-stone-500 max-w-md">
                      Faça o upload da planilha exportada da {platform} (.xlsx ou .csv). O sistema tentará identificar as colunas automaticamente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                        <Check size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-emerald-900">{file.name}</h4>
                        <p className="text-sm text-emerald-700">{mappedOrders.length} pedidos identificados</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-sm text-emerald-700 hover:text-emerald-900 underline font-medium"
                    >
                      Trocar arquivo
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                      <AlertCircle size={20} />
                      <p>{error}</p>
                    </div>
                  )}

                  {mappedOrders.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-stone-800 mb-4">Pré-visualização dos Dados</h3>
                      <div className="overflow-x-auto border border-stone-200 rounded-xl">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-stone-50 text-stone-600 font-medium border-b border-stone-200">
                            <tr>
                              <th className="px-4 py-3">Contrato</th>
                              <th className="px-4 py-3">Cliente</th>
                              <th className="px-4 py-3">Produto</th>
                              <th className="px-4 py-3">Qtd</th>
                              <th className="px-4 py-3">Valor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {mappedOrders.slice(0, 5).map((order, idx) => (
                              <tr key={idx} className="hover:bg-stone-50">
                                <td className="px-4 py-3 font-medium text-stone-800">{order.contract || '-'}</td>
                                <td className="px-4 py-3 text-stone-600">{order.clientName}</td>
                                <td className="px-4 py-3 text-stone-600 truncate max-w-[200px]">{order.product}</td>
                                <td className="px-4 py-3 text-stone-600">{order.quantity}</td>
                                <td className="px-4 py-3 text-stone-600">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {mappedOrders.length > 5 && (
                        <p className="text-center text-sm text-stone-500 mt-3">
                          Mostrando 5 de {mappedOrders.length} pedidos.
                        </p>
                      )}
                      
                      <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-1">Atenção aos Prazos e Temas!</p>
                          <p>Como as planilhas podem não possuir a data exata de envio e impressão, o sistema tenta identificar ou define automaticamente:</p>
                          <ul className="list-disc ml-5 mt-1">
                            <li><strong>Envio:</strong> Data da planilha ou 7 dias a partir de hoje</li>
                            <li><strong>Impressão:</strong> 48h (2 dias) após a importação</li>
                            <li><strong>Tema:</strong> "A Definir"</li>
                          </ul>
                          <p className="mt-2">Você poderá editar esses dados individualmente após a importação.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 font-medium text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={mappedOrders.length === 0}
                className="px-6 py-2 font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                <Check size={18} />
                Confirmar Importação
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
