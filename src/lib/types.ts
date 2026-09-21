export type ServicePackage = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  includes: string[];
  time: string | null;
  note?: string;
  featured: boolean;
  duration: string;
};

export type AddOn = {
  id: string;
  name: string;
  price: number | null;
  priceLabel?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  notes: string;
  createdAt: string;
};

export type InvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  /** Pre-promo rate shown struck through when higher than unitPrice. */
  originalUnitPrice?: number;
};

export type InvoiceStatus = "draft" | "sent" | "paid";

export type Invoice = {
  id: string;
  number: string;
  poNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  lines: InvoiceLine[];
  notes: string;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
};

export type AppData = {
  packages: ServicePackage[];
  addOns: AddOn[];
  customers: Customer[];
  invoices: Invoice[];
};
