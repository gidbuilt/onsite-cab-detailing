import { useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { isAdminAuthed, loginAdmin, logoutAdmin } from "../lib/auth";
import {
  formatMoney,
  invoiceTotal,
  nextInvoiceNumber,
  uid,
  type AppData,
} from "../lib/store";
import type {
  AddOn,
  Customer,
  Invoice,
  InvoiceLine,
  ServicePackage,
} from "../lib/types";
import { useAppData } from "../lib/useAppData";

type Tab = "packages" | "addons" | "customers" | "invoices";

const ETRANSFER_EMAIL = "rhiannonb5nz@gmail.com";
const DEFAULT_INVOICE_NOTES = `E-transfers can be sent to ${ETRANSFER_EMAIL}`;

function packageLinePrices(pkg: ServicePackage): Pick<
  InvoiceLine,
  "unitPrice" | "originalUnitPrice"
> {
  const original =
    pkg.originalPrice > pkg.price ? pkg.originalPrice : undefined;
  return {
    unitPrice: pkg.price,
    ...(original != null ? { originalUnitPrice: original } : {}),
  };
}

function lineHasPromo(line: InvoiceLine): boolean {
  return (
    line.originalUnitPrice != null && line.originalUnitPrice > line.unitPrice
  );
}

function renderNotesWithBoldEmail(notes: string): ReactNode {
  const parts = notes.split(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi);
  return parts.map((part, index) =>
    part.includes("@") ? (
      <strong key={index} className="invoice-sheet__email">
        {part}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export function Admin() {
  const [authed, setAuthed] = useState(() => {
    try {
      return isAdminAuthed();
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("packages");
  const [backupMessage, setBackupMessage] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);
  const { data, update } = useAppData();

  function handleLogin(event: FormEvent) {
    event.preventDefault();
    if (!loginAdmin(password)) {
      setLoginError("Wrong password.");
      return;
    }
    setLoginError("");
    setPassword("");
    setAuthed(true);
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `onsite-admin-backup-${stamp}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setBackupMessage("Backup downloaded. AirDrop or email it to your phone, then Import backup there.");
  }

  function importBackup(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<AppData>;
        if (
          !Array.isArray(parsed.packages) ||
          !Array.isArray(parsed.addOns) ||
          !Array.isArray(parsed.customers) ||
          !Array.isArray(parsed.invoices)
        ) {
          throw new Error("Invalid backup file");
        }
        update(() => ({
          packages: parsed.packages!,
          addOns: parsed.addOns!,
          customers: parsed.customers!,
          invoices: parsed.invoices!.map((invoice) => ({
            ...invoice,
            poNumber: invoice.poNumber ?? "",
          })),
        }));
        setBackupMessage(
          `Imported ${parsed.invoices!.length} invoice(s) and other admin data.`,
        );
        setTab("invoices");
      } catch {
        setBackupMessage("Couldn’t import that file. Use a backup exported from Admin.");
      }
    };
    reader.readAsText(file);
  }

  if (!authed) {
    return (
      <div className="admin-login">
        <form className="admin-login__card" onSubmit={handleLogin}>
          <p className="admin-login__eyebrow">Private</p>
          <h1>Admin</h1>
          <p className="admin-login__lede">
            Manage packages, customers, and invoices.
          </p>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {loginError ? <p className="admin-error">{loginError}</p> : null}
          <button className="btn btn--primary" type="submit">
            Sign in
          </button>
          <Link className="admin-login__back" to="/">
            ← Back to site
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin__top">
        <div>
          <p className="admin__eyebrow">OnSite Cab Detailing</p>
          <h1>Admin</h1>
        </div>
        <div className="admin__top-actions">
          <button className="btn btn--outline" type="button" onClick={exportBackup}>
            Export backup
          </button>
          <button
            className="btn btn--outline"
            type="button"
            onClick={() => importInputRef.current?.click()}
          >
            Import backup
          </button>
          <input
            ref={importInputRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              importBackup(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Link className="btn btn--outline" to="/">
            View site
          </Link>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => {
              logoutAdmin();
              setAuthed(false);
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      {backupMessage ? (
        <p className="admin-backup-msg" role="status">
          {backupMessage}
        </p>
      ) : null}

      <nav className="admin__tabs" aria-label="Admin sections">
        {(
          [
            ["packages", "Packages"],
            ["addons", "Add-ons"],
            ["customers", "Customers"],
            ["invoices", "Invoices"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`admin__tab${tab === id ? " is-active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="admin__body">
        {tab === "packages" ? (
          <PackagesPanel
            packages={data.packages}
            onChange={(packages) => update((d) => ({ ...d, packages }))}
          />
        ) : null}
        {tab === "addons" ? (
          <AddOnsPanel
            addOns={data.addOns}
            onChange={(addOns) => update((d) => ({ ...d, addOns }))}
          />
        ) : null}
        {tab === "customers" ? (
          <CustomersPanel
            customers={data.customers}
            onChange={(customers) => update((d) => ({ ...d, customers }))}
          />
        ) : null}
        {tab === "invoices" ? (
          <InvoicesPanel
            customers={data.customers}
            packages={data.packages}
            addOns={data.addOns}
            invoices={data.invoices}
            onChange={(invoices) => update((d) => ({ ...d, invoices }))}
          />
        ) : null}
      </div>
    </div>
  );
}

function PackagesPanel({
  packages,
  onChange,
}: {
  packages: ServicePackage[];
  onChange: (next: ServicePackage[]) => void;
}) {
  const [editing, setEditing] = useState<ServicePackage | null>(null);

  function save(event: FormEvent) {
    event.preventDefault();
    if (!editing?.name.trim()) return;
    const cleaned: ServicePackage = {
      ...editing,
      name: editing.name.trim(),
      description: editing.description.trim(),
      includes: editing.includes.map((line) => line.trim()).filter(Boolean),
      time: editing.time?.trim() || null,
      note: editing.note?.trim() || undefined,
      duration: editing.duration.trim() || editing.time?.trim() || "Custom",
    };
    const exists = packages.some((item) => item.id === cleaned.id);
    onChange(
      exists
        ? packages.map((item) => (item.id === cleaned.id ? cleaned : item))
        : [...packages, cleaned],
    );
    setEditing(null);
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>Service packages</h2>
        <button
          className="btn btn--primary"
          type="button"
          onClick={() =>
            setEditing({
              id: uid("pkg"),
              name: "",
              price: 0,
              originalPrice: 0,
              description: "",
              includes: [""],
              time: "",
              note: "",
              featured: false,
              duration: "",
            })
          }
        >
          Add package
        </button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Sale</th>
            <th>Original</th>
            <th>Featured</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr key={pkg.id}>
              <td>{pkg.name}</td>
              <td>{formatMoney(pkg.price)}</td>
              <td>{formatMoney(pkg.originalPrice)}</td>
              <td>{pkg.featured ? "Yes" : "—"}</td>
              <td className="admin-table__actions">
                <button type="button" onClick={() => setEditing(pkg)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="is-danger"
                  onClick={() =>
                    onChange(packages.filter((item) => item.id !== pkg.id))
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {editing ? (
        <form className="admin-form" onSubmit={save}>
          <h3>
            {packages.some((item) => item.id === editing.id) ? "Edit" : "New"}{" "}
            package
          </h3>
          <div className="admin-form__grid">
            <label>
              Name
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
              />
            </label>
            <label>
              Sale price ($)
              <input
                type="number"
                min={0}
                value={editing.price}
                onChange={(e) =>
                  setEditing({ ...editing, price: Number(e.target.value) || 0 })
                }
                required
              />
            </label>
            <label>
              Original price ($)
              <input
                type="number"
                min={0}
                value={editing.originalPrice}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    originalPrice: Number(e.target.value) || 0,
                  })
                }
                required
              />
            </label>
            <label>
              Duration
              <input
                value={editing.duration}
                onChange={(e) =>
                  setEditing({ ...editing, duration: e.target.value })
                }
              />
            </label>
            <label>
              Time label
              <input
                value={editing.time ?? ""}
                onChange={(e) => setEditing({ ...editing, time: e.target.value })}
              />
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={editing.featured}
                onChange={(e) =>
                  setEditing({ ...editing, featured: e.target.checked })
                }
              />
              Featured
            </label>
            <label className="admin-form__full">
              Description
              <textarea
                rows={3}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </label>
            <label className="admin-form__full">
              Includes (one per line)
              <textarea
                rows={5}
                value={editing.includes.join("\n")}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    includes: e.target.value.split("\n"),
                  })
                }
              />
            </label>
            <label className="admin-form__full">
              Note
              <input
                value={editing.note ?? ""}
                onChange={(e) => setEditing({ ...editing, note: e.target.value })}
              />
            </label>
          </div>
          <FormActions onCancel={() => setEditing(null)} submitLabel="Save package" />
        </form>
      ) : null}
    </section>
  );
}

function AddOnsPanel({
  addOns,
  onChange,
}: {
  addOns: AddOn[];
  onChange: (next: AddOn[]) => void;
}) {
  const [editing, setEditing] = useState<AddOn | null>(null);

  function save(event: FormEvent) {
    event.preventDefault();
    if (!editing?.name.trim()) return;
    const cleaned: AddOn = {
      ...editing,
      name: editing.name.trim(),
      priceLabel:
        editing.price == null
          ? editing.priceLabel?.trim() || "Quoted before work begins"
          : undefined,
    };
    const exists = addOns.some((item) => item.id === cleaned.id);
    onChange(
      exists
        ? addOns.map((item) => (item.id === cleaned.id ? cleaned : item))
        : [...addOns, cleaned],
    );
    setEditing(null);
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>Add-ons</h2>
        <button
          className="btn btn--primary"
          type="button"
          onClick={() =>
            setEditing({
              id: uid("addon"),
              name: "",
              price: 0,
            })
          }
        >
          Add add-on
        </button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {addOns.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                {item.price == null
                  ? item.priceLabel || "Quoted"
                  : formatMoney(item.price)}
              </td>
              <td className="admin-table__actions">
                <button type="button" onClick={() => setEditing(item)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="is-danger"
                  onClick={() =>
                    onChange(addOns.filter((addon) => addon.id !== item.id))
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {editing ? (
        <form className="admin-form" onSubmit={save}>
          <h3>Edit add-on</h3>
          <div className="admin-form__grid">
            <label>
              Name
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
              />
            </label>
            <label>
              Price ($) — blank = quoted
              <input
                type="number"
                min={0}
                value={editing.price ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    price:
                      e.target.value === "" ? null : Number(e.target.value) || 0,
                  })
                }
              />
            </label>
            {editing.price == null ? (
              <label>
                Quote label
                <input
                  value={editing.priceLabel ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, priceLabel: e.target.value })
                  }
                />
              </label>
            ) : null}
          </div>
          <FormActions onCancel={() => setEditing(null)} />
        </form>
      ) : null}
    </section>
  );
}

function CustomersPanel({
  customers,
  onChange,
}: {
  customers: Customer[];
  onChange: (next: Customer[]) => void;
}) {
  const [editing, setEditing] = useState<Customer | null>(null);
  const [isNew, setIsNew] = useState(false);

  function save(event: FormEvent) {
    event.preventDefault();
    if (!editing?.name.trim() || !editing.phone.trim()) return;
    const cleaned: Customer = {
      ...editing,
      name: editing.name.trim(),
      phone: editing.phone.trim(),
      email: editing.email.trim(),
      company: editing.company.trim(),
      address: editing.address.trim(),
      notes: editing.notes.trim(),
    };
    onChange(
      isNew
        ? [cleaned, ...customers]
        : customers.map((item) => (item.id === cleaned.id ? cleaned : item)),
    );
    setEditing(null);
    setIsNew(false);
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>Customers</h2>
        <button
          className="btn btn--primary"
          type="button"
          onClick={() => {
            setIsNew(true);
            setEditing({
              id: uid("cust"),
              name: "",
              phone: "",
              email: "",
              company: "",
              address: "",
              notes: "",
              createdAt: new Date().toISOString(),
            });
          }}
        >
          Add customer
        </button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Email</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={5}>No customers yet.</td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.company || "—"}</td>
                <td>{customer.email || "—"}</td>
                <td className="admin-table__actions">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNew(false);
                      setEditing(customer);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="is-danger"
                    onClick={() =>
                      onChange(customers.filter((item) => item.id !== customer.id))
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      {editing ? (
        <form className="admin-form" onSubmit={save}>
          <h3>{isNew ? "New" : "Edit"} customer</h3>
          <div className="admin-form__grid">
            <label>
              Name
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
              />
            </label>
            <label>
              Phone
              <input
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={editing.email}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              />
            </label>
            <label>
              Company
              <input
                value={editing.company}
                onChange={(e) =>
                  setEditing({ ...editing, company: e.target.value })
                }
              />
            </label>
            <label className="admin-form__full">
              Address
              <input
                value={editing.address}
                onChange={(e) =>
                  setEditing({ ...editing, address: e.target.value })
                }
              />
            </label>
            <label className="admin-form__full">
              Notes
              <textarea
                rows={3}
                value={editing.notes}
                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              />
            </label>
          </div>
          <FormActions
            onCancel={() => {
              setEditing(null);
              setIsNew(false);
            }}
            submitLabel="Save customer"
          />
        </form>
      ) : null}
    </section>
  );
}

function InvoicesPanel({
  customers,
  packages,
  addOns,
  invoices,
  onChange,
}: {
  customers: Customer[];
  packages: ServicePackage[];
  addOns: AddOn[];
  invoices: Invoice[];
  onChange: (next: Invoice[]) => void;
}) {
  const [draft, setDraft] = useState<Invoice | null>(null);
  const [printId, setPrintId] = useState<string | null>(null);
  const printInvoice = useMemo(
    () => invoices.find((item) => item.id === printId) ?? null,
    [invoices, printId],
  );

  function startNew() {
    const customer = customers[0];
    setDraft({
      id: uid("inv"),
      number: nextInvoiceNumber(invoices),
      customerId: customer?.id ?? "",
      customerName: customer?.name ?? "",
      customerPhone: customer?.phone ?? "",
      customerEmail: customer?.email ?? "",
      customerAddress: customer?.address ?? "",
      poNumber: "",
      lines: [
        {
          id: uid("line"),
          description: packages[0]?.name ?? "Service",
          quantity: 1,
          ...(packages[0]
            ? packageLinePrices(packages[0])
            : { unitPrice: 0 }),
        },
      ],
      notes: DEFAULT_INVOICE_NOTES,
      status: "draft",
      createdAt: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
    });
  }

  function applyCustomer(customerId: string) {
    if (!draft) return;
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) {
      setDraft({ ...draft, customerId });
      return;
    }
    setDraft({
      ...draft,
      customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
    });
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft?.customerName.trim() || draft.lines.length === 0) return;
    const cleaned: Invoice = {
      ...draft,
      customerName: draft.customerName.trim(),
      lines: draft.lines.filter((line) => line.description.trim()),
    };
    const exists = invoices.some((item) => item.id === cleaned.id);
    onChange(
      exists
        ? invoices.map((item) => (item.id === cleaned.id ? cleaned : item))
        : [cleaned, ...invoices],
    );
    setDraft(null);
  }

  function updateLine(lineId: string, patch: Partial<InvoiceLine>) {
    if (!draft) return;
    setDraft({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id === lineId ? { ...line, ...patch } : line,
      ),
    });
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>Invoices</h2>
        <button className="btn btn--primary" type="button" onClick={startNew}>
          New invoice
        </button>
      </div>

      {customers.length === 0 ? (
        <p className="admin-hint">Add a customer first, then create an invoice.</p>
      ) : null}

      {invoices.length === 0 ? (
        <p className="admin-hint">
          No invoices on this phone/browser yet. Invoices are saved on the device
          where you create them. On your computer, tap <strong>Export backup</strong>,
          send the file here, then tap <strong>Import backup</strong>.
        </p>
      ) : null}

      <div className="admin-invoice-cards">
        {invoices.map((invoice) => (
          <article className="admin-invoice-card" key={invoice.id}>
            <div className="admin-invoice-card__main">
              <strong>{invoice.number}</strong>
              <span>{invoice.customerName}</span>
              <span>
                {invoice.createdAt} · {formatMoney(invoiceTotal(invoice))}
              </span>
              <span>P.O.: {invoice.poNumber || "—"}</span>
            </div>
            <div className="admin-invoice-card__actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() =>
                  setDraft({
                    ...invoice,
                    poNumber: invoice.poNumber ?? "",
                    notes: invoice.notes || DEFAULT_INVOICE_NOTES,
                  })
                }
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setPrintId(invoice.id)}
              >
                Generate PDF
              </button>
              <button
                type="button"
                className="btn btn--ghost is-danger"
                onClick={() =>
                  onChange(invoices.filter((item) => item.id !== invoice.id))
                }
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <Table>
        <thead>
          <tr>
            <th>Number</th>
            <th>P.O.</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={6}>No invoices yet.</td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.number}</td>
                <td>{invoice.poNumber || "—"}</td>
                <td>{invoice.customerName}</td>
                <td>{invoice.createdAt}</td>
                <td>{formatMoney(invoiceTotal(invoice))}</td>
                <td className="admin-table__actions">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...invoice,
                        poNumber: invoice.poNumber ?? "",
                        notes: invoice.notes || DEFAULT_INVOICE_NOTES,
                      })
                    }
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => setPrintId(invoice.id)}>
                    Generate PDF
                  </button>
                  <button
                    type="button"
                    className="is-danger"
                    onClick={() =>
                      onChange(invoices.filter((item) => item.id !== invoice.id))
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {draft ? (
        <form className="admin-form" onSubmit={save}>
          <h3>
            {invoices.some((item) => item.id === draft.id) ? "Edit" : "New"}{" "}
            invoice {draft.number}
          </h3>
          <div className="admin-form__grid">
            <label>
              Customer
              <select
                value={draft.customerId}
                onChange={(e) => applyCustomer(e.target.value)}
              >
                <option value="">Select…</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Purchase Order (P.O.)
              <input
                value={draft.poNumber ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, poNumber: e.target.value })
                }
                placeholder="Customer P.O. number"
                autoComplete="off"
              />
            </label>
            <label>
              Invoice date
              <input
                type="date"
                value={draft.createdAt}
                onChange={(e) =>
                  setDraft({ ...draft, createdAt: e.target.value })
                }
              />
            </label>
            <label>
              Due date
              <input
                type="date"
                value={draft.dueDate}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
              />
            </label>
          </div>

          <div className="admin-lines">
            <div className="admin-lines__head">
              <h4>Line items</h4>
              <div className="admin-lines__quick">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const pkg = packages.find((item) => item.id === e.target.value);
                    if (!pkg) return;
                    setDraft({
                      ...draft,
                      lines: [
                        ...draft.lines,
                        {
                          id: uid("line"),
                          description: pkg.name,
                          quantity: 1,
                          ...packageLinePrices(pkg),
                        },
                      ],
                    });
                    e.target.value = "";
                  }}
                >
                  <option value="">Add package…</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const addon = addOns.find((item) => item.id === e.target.value);
                    if (!addon || addon.price == null) return;
                    setDraft({
                      ...draft,
                      lines: [
                        ...draft.lines,
                        {
                          id: uid("line"),
                          description: addon.name,
                          quantity: 1,
                          unitPrice: addon.price,
                        },
                      ],
                    });
                    e.target.value = "";
                  }}
                >
                  <option value="">Add add-on…</option>
                  {addOns
                    .filter((item) => item.price != null)
                    .map((addon) => (
                      <option key={addon.id} value={addon.id}>
                        {addon.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      lines: [
                        ...draft.lines,
                        {
                          id: uid("line"),
                          description: "",
                          quantity: 1,
                          unitPrice: 0,
                        },
                      ],
                    })
                  }
                >
                  Custom line
                </button>
              </div>
            </div>

            {draft.lines.map((line) => (
              <div className="admin-line" key={line.id}>
                <input
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) =>
                    updateLine(line.id, { description: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(line.id, {
                      quantity: Math.max(1, Number(e.target.value) || 1),
                    })
                  }
                />
                <input
                  type="number"
                  min={0}
                  title="Promo / sale price"
                  value={line.unitPrice}
                  onChange={(e) =>
                    updateLine(line.id, {
                      unitPrice: Number(e.target.value) || 0,
                    })
                  }
                />
                <input
                  type="number"
                  min={0}
                  title="Original price (optional)"
                  placeholder="Was $"
                  value={line.originalUnitPrice ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateLine(line.id, {
                      originalUnitPrice:
                        value === "" ? undefined : Number(value) || 0,
                    });
                  }}
                />
                <span className="admin-line__amount">
                  {lineHasPromo(line) ? (
                    <>
                      <s>{formatMoney(line.quantity * (line.originalUnitPrice ?? 0))}</s>{" "}
                      {formatMoney(line.quantity * line.unitPrice)}
                    </>
                  ) : (
                    formatMoney(line.quantity * line.unitPrice)
                  )}
                </span>
                <button
                  type="button"
                  className="is-danger"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      lines: draft.lines.filter((item) => item.id !== line.id),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <p className="admin-total">
              Total: <strong>{formatMoney(invoiceTotal(draft))}</strong>
            </p>
          </div>

          <label className="admin-form__full">
            Notes
            <textarea
              rows={3}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </label>

          <FormActions onCancel={() => setDraft(null)} submitLabel="Save invoice" />
        </form>
      ) : null}

      {printInvoice ? (
        <InvoicePrint
          invoice={printInvoice}
          onClose={() => setPrintId(null)}
        />
      ) : null}
    </section>
  );
}

function buildInvoiceEmail(invoice: Invoice) {
  const total = formatMoney(invoiceTotal(invoice));
  const lines = invoice.lines
    .map((line) => {
      const amount = formatMoney(line.quantity * line.unitPrice);
      if (lineHasPromo(line)) {
        const was = formatMoney(
          line.quantity * (line.originalUnitPrice as number),
        );
        return `• ${line.description} × ${line.quantity} — was ${was}, now ${amount}`;
      }
      return `• ${line.description} × ${line.quantity} — ${amount}`;
    })
    .join("\n");
  const subject = `Invoice ${invoice.number} — OnSite Cab Detailing`;
  const body = [
    `Hi${invoice.customerName ? ` ${invoice.customerName}` : ""},`,
    "",
    `Please find invoice ${invoice.number} below.`,
    invoice.poNumber ? `P.O.: ${invoice.poNumber}` : null,
    `Date: ${invoice.createdAt}`,
    `Due: ${invoice.dueDate}`,
    `Total due: ${total}`,
    "",
    "Line items:",
    lines,
    invoice.notes ? `\nNotes: ${invoice.notes}` : null,
    "",
    "You can also attach the PDF from Print / Save PDF.",
    "",
    "Thanks,",
    "OnSite Cab Detailing",
    "250-938-7938",
  ]
    .filter((line) => line != null)
    .join("\n");

  const to = encodeURIComponent(invoice.customerEmail.trim());
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function InvoicePrint({
  invoice,
  onClose,
}: {
  invoice: Invoice;
  onClose: () => void;
}) {
  function handleEmail() {
    window.location.href = buildInvoiceEmail(invoice);
  }

  return createPortal(
    <div className="invoice-print-overlay">
      <div className="invoice-print-toolbar no-print">
        <button
          className="btn btn--primary"
          type="button"
          onClick={() => window.print()}
        >
          Print / Save PDF
        </button>
        <button className="btn btn--outline" type="button" onClick={handleEmail}>
          Email invoice
        </button>
        <button className="btn btn--outline" type="button" onClick={onClose}>
          Close
        </button>
        <p className="invoice-print-hint">
          Print / Save PDF opens your browser print dialog. Keep paper size set to
          Letter, then choose “Save as PDF”.
          Email opens your mail app with the invoice details ready to
          send{invoice.customerEmail ? ` to ${invoice.customerEmail}` : ""}.
        </p>
      </div>
      <article className="invoice-sheet">
        <header className="invoice-sheet__head">
          <div className="invoice-sheet__brand">
            <img
              className="invoice-sheet__logo"
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="OnSite Cab Detailing"
            />
            <div>
              <h1>OnSite Cab Detailing</h1>
              <p>Mobile heavy equipment cab detailing</p>
              <p>North Okanagan · 250-938-7938</p>
              <p>onsitecabdetailing.ca</p>
            </div>
          </div>
          <div className="invoice-sheet__meta">
            <h2>Invoice</h2>
            <p>
              <strong>{invoice.number}</strong>
            </p>
            <p>P.O.: {invoice.poNumber?.trim() ? invoice.poNumber : "—"}</p>
            <p>Date: {invoice.createdAt}</p>
            <p>Due: {invoice.dueDate}</p>
          </div>
        </header>
        <section className="invoice-sheet__bill">
          <h3>Bill to</h3>
          <p>
            <strong>{invoice.customerName}</strong>
          </p>
          {invoice.customerPhone ? <p>{invoice.customerPhone}</p> : null}
          {invoice.customerEmail ? <p>{invoice.customerEmail}</p> : null}
          {invoice.customerAddress ? <p>{invoice.customerAddress}</p> : null}
        </section>
        <table className="invoice-sheet__table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={line.id}>
                <td>{line.description}</td>
                <td>{line.quantity}</td>
                <td>
                  {lineHasPromo(line) ? (
                    <span className="invoice-sheet__promo">
                      <s>{formatMoney(line.originalUnitPrice as number)}</s>{" "}
                      <strong>{formatMoney(line.unitPrice)}</strong>
                    </span>
                  ) : (
                    formatMoney(line.unitPrice)
                  )}
                </td>
                <td>
                  {lineHasPromo(line) ? (
                    <span className="invoice-sheet__promo">
                      <s>
                        {formatMoney(
                          line.quantity * (line.originalUnitPrice as number),
                        )}
                      </s>{" "}
                      <strong>
                        {formatMoney(line.quantity * line.unitPrice)}
                      </strong>
                    </span>
                  ) : (
                    formatMoney(line.quantity * line.unitPrice)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="invoice-sheet__total">
          Total due: <strong>{formatMoney(invoiceTotal(invoice))}</strong>
        </p>
        {invoice.notes ? (
          <p className="invoice-sheet__notes">
            {renderNotesWithBoldEmail(invoice.notes)}
          </p>
        ) : null}
        <p className="invoice-sheet__thanks">
          Thank you for your business! Hope to hear from you again soon.
        </p>
      </article>
    </div>,
    document.body,
  );
}

function Table({ children }: { children: ReactNode }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">{children}</table>
    </div>
  );
}

function FormActions({
  onCancel,
  submitLabel = "Save",
}: {
  onCancel: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="admin-form__actions">
      <button className="btn btn--primary" type="submit">
        {submitLabel}
      </button>
      <button className="btn btn--outline" type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
