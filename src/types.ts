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
}
