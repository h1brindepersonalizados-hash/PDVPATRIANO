export type OrderSource = 'Shopee' | 'Elo7' | 'Manual' | 'Outro';
export type OrderStatus = 'PENDENTE' | 'IMPRIMIR' | 'PRODUÇÃO' | 'ENVIAR' | 'ENVIADO';

export interface Product {
  id: string;
  name: string;
  price: number;
  characteristics: string;
}

export interface Order {
  id: string;
  contract: string;
  clientName: string;
  partyTheme: string;
  product: string;
  value: number;
  quantity: number;
  shippingDate: string; // YYYY-MM-DD
  printDeadline: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  source?: OrderSource;
  status?: OrderStatus;
}
