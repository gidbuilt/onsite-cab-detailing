import type { AddOn, AppData, Invoice, ServicePackage } from "./types";

export type { AppData };

export const STORAGE_KEY = "onsite-cab-admin-data-v1";

export const defaultPackages: ServicePackage[] = [
  {
    id: "refresh",
    name: "Refresh Detail",
    price: 249,
    originalPrice: 299,
    description:
      "Perfect for machines that are regularly maintained and need a professional refresh.",
    includes: [
      "Vacuum and debris removal",
      "Dust removal from dash, controls & vents",
      "Interior wipe down",
      "Windows cleaned",
      "Floor and rubber mats cleaned",
    ],
    time: "1.5–2 hours",
    featured: false,
    duration: "1.5–2 hours",
  },
  {
    id: "full",
    name: "Full Interior Detail",
    price: 349,
    originalPrice: 399,
    description: "Restore your cab to a clean, comfortable workspace.",
    includes: [
      "Everything in the Refresh Detail",
      "Deep cleaning of all interior surfaces",
      "Compressed air blow-out of hard-to-reach areas",
      "Seat cleaning and conditioning (where applicable)",
      "Thorough floor scrub and mat cleaning",
      "Interior glass cleaning",
      "Final quality inspection",
    ],
    time: "3–4.5 hours",
    featured: true,
    duration: "3–4.5 hours",
  },
  {
    id: "restoration",
    name: "Cab Restoration",
    price: 449,
    originalPrice: 499,
    description:
      "For heavily neglected machines with excessive dirt, mud, grease, concrete dust, or years of built-up grime.",
    includes: [
      "Everything in the Full Interior Detail",
      "Extra labour for heavily soiled interiors",
      "Stain treatment where possible",
      "Intensive detailing of difficult areas",
    ],
    time: null,
    note: "Final price confirmed before work begins.",
    featured: false,
    duration: "Custom",
  },
];

export const defaultAddOns: AddOn[] = [
  { id: "shampoo", name: "Seat shampoo & extraction", price: 70 },
  { id: "odour", name: "Odour treatment", price: 80 },
  { id: "protectant", name: "Interior protectant", price: 55 },
  { id: "windows", name: "Window exterior clean", price: 70 },
  {
    id: "surcharge",
    name: "Extra dirty surcharge (if required)",
    price: null,
    priceLabel: "Quoted before work begins",
  },
];

export function emptyData(): AppData {
  return {
    packages: structuredClone(defaultPackages),
    addOns: structuredClone(defaultAddOns),
    customers: [],
    invoices: [],
  };
}

export function loadData(): AppData {
  const base = emptyData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      packages:
        Array.isArray(parsed.packages) && parsed.packages.length > 0
          ? parsed.packages
          : base.packages,
      addOns:
        Array.isArray(parsed.addOns) && parsed.addOns.length > 0
          ? parsed.addOns
          : base.addOns,
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
      invoices: Array.isArray(parsed.invoices)
        ? parsed.invoices.map((invoice) => ({
            ...invoice,
            poNumber: invoice.poNumber ?? "",
          }))
        : [],
    };
  } catch {
    return base;
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("onsite-data-changed"));
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-CA", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function nextInvoiceNumber(invoices: Invoice[]) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const seq = invoices
    .map((inv) => {
      const match = inv.number.match(/INV-\d{4}-(\d+)/);
      return match ? Number(match[1]) : 0;
    })
    .reduce((max, n) => Math.max(max, n), 0);
  return `${prefix}${String(seq + 1).padStart(3, "0")}`;
}

export function invoiceTotal(invoice: Invoice) {
  return invoice.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0,
  );
}
