import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { API } from "@/lib/data";
import { Download, LogOut, Users, MessageSquare, ClipboardList, BellRing, RefreshCw, Search, Trash2, Edit3, Plus, Package, X } from "lucide-react";

const TABS = [
  { key: "early-access", label: "Early Access", path: "early-access", icon: Users, color: "#8B5CF6", deletable: true },
  { key: "contacts", label: "Contacts", path: "contacts", icon: MessageSquare, color: "#A78BFA", deletable: true },
  { key: "quiz", label: "Quiz Results", path: "quiz", icon: ClipboardList, color: "#7C3AED", deletable: true },
  { key: "waitlist", label: "Waitlist", path: "waitlist", icon: BellRing, color: "#C4B5FD", deletable: true },
  { key: "products", label: "Products", path: "products", icon: Package, color: "#8B5CF6", isProducts: true },
];

const STORAGE_KEY = "curlloom_admin_token";

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => { if (token && !authed) verify(token); /* eslint-disable-next-line */ }, []);

  const verify = async (t) => {
    setChecking(true);
    try {
      const r = await fetch(`${API}/admin/early-access`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) { localStorage.setItem(STORAGE_KEY, t); setAuthed(true); return true; }
      throw new Error(r.status === 401 ? "Invalid token" : "Server error");
    } catch (e) { toast.error(e.message || "Login failed"); return false; }
    finally { setChecking(false); }
  };

  const logout = () => { localStorage.removeItem(STORAGE_KEY); setToken(""); setAuthed(false); };

  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <form onSubmit={(e) => { e.preventDefault(); verify(token); }}
          className="cl-glass-strong rounded-3xl p-12 w-full max-w-md" data-testid="admin-login">
          <Link to="/" className="text-zinc-500 hover:text-white text-xs">← Back to site</Link>
          <h1 className="mt-5 text-3xl font-bold text-white tracking-[-0.02em]">Admin</h1>
          <p className="mt-4 text-sm text-zinc-400 leading-[1.75]">Enter your admin token to access submissions and the product editor.</p>

          <div className="mt-9">
            <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 mb-3">Token</div>
            <input type="password" required autoFocus value={token} onChange={(e) => setToken(e.target.value)}
              data-testid="admin-token-input"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none"
              placeholder="Paste admin token" />
          </div>

          <button type="submit" disabled={checking || !token} data-testid="admin-login-submit"
            className="mt-8 w-full cl-btn-primary text-white rounded-full px-7 py-4 text-xs font-semibold uppercase disabled:opacity-50">
            {checking ? "Verifying…" : "Sign in"}
          </button>

          <p className="mt-7 text-[11px] text-zinc-500 leading-relaxed">
            Token lives in <code className="text-zinc-300">/app/backend/.env</code> as <code className="text-zinc-300">ADMIN_TOKEN</code>.
          </p>
        </form>
      </div>
    );
  }

  return <Dashboard token={token} onLogout={logout} />;
}

function authHeaders(token) { return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }; }

function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState("early-access");
  const [data, setData] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subs, prods] = await Promise.all([
        Promise.all(TABS.filter((t) => t.deletable).map(async (t) => {
          const r = await fetch(`${API}/admin/${t.path}`, { headers: { Authorization: `Bearer ${token}` } });
          return [t.key, r.ok ? await r.json() : []];
        })),
        fetch(`${API}/products`).then((r) => r.ok ? r.json() : []),
      ]);
      setData(Object.fromEntries(subs));
      setProducts(prods);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, []);

  const counts = { ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])), products: products.length };
  const current = data[tab] || [];
  const filtered = !query ? current : current.filter((row) =>
    Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(query.toLowerCase()))
  );

  const downloadCsv = () => {
    if (!current.length) return;
    const cols = Array.from(current.reduce((set, row) => { Object.keys(row).forEach((k) => set.add(k)); return set; }, new Set()));
    const escape = (v) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [cols.join(","), ...current.map((row) => cols.map((c) => escape(row[c])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `curlloom-${tab}-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const deleteSubmission = async (kind, id) => {
    if (!window.confirm("Delete this entry permanently?")) return;
    try {
      const r = await fetch(`${API}/admin/${kind}/${id}`, { method: "DELETE", headers: authHeaders(token) });
      if (!r.ok) throw new Error();
      toast.success("Deleted");
      setData((d) => ({ ...d, [kind]: d[kind].filter((row) => row.id !== id) }));
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-14">
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-3">Admin</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-[-0.025em]">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button data-testid="admin-refresh" onClick={fetchAll}
            className="cl-btn-secondary text-white rounded-full px-5 py-3 text-xs font-semibold uppercase flex items-center gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button data-testid="admin-logout" onClick={onLogout}
            className="cl-btn-secondary text-white rounded-full px-5 py-3 text-xs font-semibold uppercase flex items-center gap-2">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-12">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = counts[t.key] ?? 0;
          const active = tab === t.key;
          return (
            <button key={t.key} data-testid={`stat-${t.key}`} onClick={() => setTab(t.key)}
              className={`cl-glass rounded-3xl p-7 text-left transition-all hover:border-violet-500/30 ${active ? "border-violet-500/40 bg-violet-500/[0.04]" : ""}`}>
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${t.color}22`, border: `1px solid ${t.color}55` }}>
                  <Icon size={18} style={{ color: t.color }} />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-white tracking-[-0.03em]">{count}</div>
              <div className="mt-2 text-sm text-zinc-400">{t.label}</div>
            </button>
          );
        })}
      </div>

      {tab === "products" ? (
        <ProductsEditor token={token} products={products} onReload={fetchAll} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-7 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input data-testid="admin-search" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${TABS.find((t) => t.key === tab)?.label.toLowerCase()}…`}
                className="w-full bg-white/[0.03] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none" />
            </div>
            <button data-testid="admin-download" onClick={downloadCsv} disabled={!current.length}
              className="cl-btn-primary text-white rounded-full px-6 py-3 text-xs font-semibold uppercase flex items-center justify-center gap-2 disabled:opacity-50">
              <Download size={14} /> Export CSV
            </button>
          </div>
          <DataTable rows={filtered} tab={tab} onDelete={(id) => deleteSubmission(tab, id)} />
        </>
      )}
    </div>
  );
}

const COLUMN_PRESETS = {
  "early-access": ["created_at", "queue_position", "name", "email", "hair_type", "main_concern", "is_athlete", "interested_in_testing", "ref_code", "referral_count", "referred_by"],
  "contacts": ["created_at", "name", "email", "reason", "message"],
  "quiz": ["created_at", "email", "routine_type", "hair_pattern", "porosity", "biggest_issue", "activity_level", "product_feel", "has_perm"],
  "waitlist": ["created_at", "email", "product_name"],
};

function fmtDate(s) {
  if (!s) return "";
  try { return new Date(s).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }); }
  catch { return s; }
}

function DataTable({ rows, tab, onDelete }) {
  if (!rows.length) {
    return <div className="cl-glass rounded-3xl p-16 text-center text-zinc-500">No submissions yet.</div>;
  }
  const cols = COLUMN_PRESETS[tab] || Object.keys(rows[0]).filter((k) => k !== "id");
  return (
    <div className="cl-glass rounded-3xl overflow-hidden" data-testid={`admin-table-${tab}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              {cols.map((c) => (
                <th key={c} className="text-left text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-medium px-5 py-4 whitespace-nowrap">
                  {c.replace(/_/g, " ")}
                </th>
              ))}
              <th className="text-right text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-medium px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id || i} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                {cols.map((c) => (
                  <td key={c} className="px-5 py-4 text-zinc-300 whitespace-nowrap max-w-[280px] truncate">
                    <Cell value={row[c]} col={c} />
                  </td>
                ))}
                <td className="px-5 py-4 text-right">
                  <button data-testid={`delete-${tab}-${row.id}`} onClick={() => onDelete(row.id)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs">
                    <Trash2 size={12} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({ value, col }) {
  if (value === true) return <span className="text-violet-300">Yes</span>;
  if (value === false) return <span className="text-zinc-500">No</span>;
  if (value === null || value === undefined || value === "") return <span className="text-zinc-600">—</span>;
  if (col === "created_at") return <span className="text-zinc-400">{fmtDate(value)}</span>;
  if (col === "ref_code") return <span className="font-mono text-violet-300">{value}</span>;
  if (col === "queue_position") return <span className="font-mono text-white">#{value}</span>;
  if (col === "message") return <span title={value}>{value}</span>;
  return <span>{String(value)}</span>;
}

// ---------------- Products editor ----------------

const STATUSES = ["In Development", "In Testing", "Coming Soon", "Planned"];
const EMPTY_PRODUCT = {
  slug: "", name: "", short: "", bestFor: "", status: "Planned",
  accent: "#8B5CF6", image: "",
  benefits: [], who: "", feel: "", howTo: "", ingredients: [], sort_order: 0,
};

function ProductsEditor({ token, products, onReload }) {
  const [editing, setEditing] = useState(null); // product object or "new"

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div className="text-sm text-zinc-400">{products.length} products. Manage what shows up on /shop.</div>
        <button data-testid="product-new" onClick={() => setEditing({ ...EMPTY_PRODUCT, sort_order: products.length + 1 })}
          className="cl-btn-primary text-white rounded-full px-6 py-3 text-xs font-semibold uppercase flex items-center gap-2">
          <Plus size={14} /> Add product
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => (
          <div key={p.slug} className="cl-glass rounded-3xl p-7" data-testid={`product-row-${p.slug}`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-white font-bold text-lg tracking-[-0.02em]">{p.name}</div>
                <div className="font-mono text-[11px] text-zinc-500 mt-1">{p.slug}</div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">{p.status}</span>
            </div>
            <p className="text-sm text-zinc-400 leading-[1.7] min-h-[40px]">{p.short}</p>
            <div className="mt-5 flex gap-2">
              <button data-testid={`product-edit-${p.slug}`} onClick={() => setEditing(p)}
                className="flex-1 cl-btn-secondary text-white rounded-full px-4 py-2.5 text-xs font-semibold uppercase flex items-center justify-center gap-2">
                <Edit3 size={12} /> Edit
              </button>
              <button data-testid={`product-delete-${p.slug}`}
                onClick={async () => {
                  if (!window.confirm(`Delete ${p.name}? This cannot be undone.`)) return;
                  try {
                    const r = await fetch(`${API}/admin/products/${p.slug}`, { method: "DELETE", headers: authHeaders(token) });
                    if (!r.ok) throw new Error();
                    toast.success("Product deleted"); onReload();
                  } catch { toast.error("Delete failed"); }
                }}
                className="px-4 py-2.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs flex items-center gap-2">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full cl-glass rounded-3xl p-12 text-center text-zinc-500">No products yet. Click "Add product" to create one.</div>
        )}
      </div>

      {editing && (
        <ProductEditor
          token={token}
          initial={editing}
          isNew={!editing.id}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); onReload(); }}
        />
      )}
    </div>
  );
}

function ProductEditor({ token, initial, isNew, onClose, onSaved }) {
  const [p, setP] = useState({
    ...EMPTY_PRODUCT,
    ...initial,
    benefits: initial.benefits || [],
    ingredients: initial.ingredients || [],
  });
  const [saving, setSaving] = useState(false);

  const setField = (k, v) => setP((x) => ({ ...x, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isNew ? `${API}/admin/products` : `${API}/admin/products/${initial.slug}`;
      const method = isNew ? "POST" : "PUT";
      const body = JSON.stringify({
        ...p,
        sort_order: Number(p.sort_order) || 0,
        benefits: p.benefits.filter(Boolean),
        ingredients: p.ingredients.filter(Boolean),
        image: p.image || null,
      });
      const r = await fetch(url, { method, headers: authHeaders(token), body });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || "Save failed");
      }
      toast.success(isNew ? "Product created" : "Product updated");
      onSaved();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()}
        className="cl-glass-strong rounded-3xl p-8 sm:p-12 max-w-3xl w-full my-8" data-testid="product-editor">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-2">{isNew ? "New" : "Edit"} product</div>
            <h2 className="text-3xl font-bold text-white tracking-[-0.025em]">{isNew ? "Create product" : p.name || "Edit product"}</h2>
          </div>
          <button type="button" onClick={onClose} data-testid="product-editor-close"
            className="w-10 h-10 rounded-full cl-glass flex items-center justify-center text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-7">
          <PField label="Slug (URL)">
            <input data-testid="pe-slug" required value={p.slug} onChange={(e) => setField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none font-mono text-sm"
              placeholder="leave-in-conditioner" />
          </PField>
          <PField label="Name">
            <input data-testid="pe-name" required value={p.name} onChange={(e) => setField("name", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none"
              placeholder="Leave-In Conditioner" />
          </PField>
        </div>

        <div className="mt-7">
          <PField label="Short tagline">
            <input data-testid="pe-short" value={p.short} onChange={(e) => setField("short", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none"
              placeholder="Lightweight daily moisture for curls…" />
          </PField>
        </div>

        <div className="grid sm:grid-cols-3 gap-7 mt-7">
          <PField label="Status">
            <select data-testid="pe-status" value={p.status} onChange={(e) => setField("status", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none">
              {STATUSES.map((s) => <option key={s} className="bg-[#121217]">{s}</option>)}
            </select>
          </PField>
          <PField label="Accent color">
            <div className="flex items-center gap-3">
              <input type="color" value={p.accent} onChange={(e) => setField("accent", e.target.value)}
                className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer" />
              <input value={p.accent} onChange={(e) => setField("accent", e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-violet-500/50 focus:outline-none" />
            </div>
          </PField>
          <PField label="Sort order">
            <input type="number" value={p.sort_order} onChange={(e) => setField("sort_order", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none" />
          </PField>
        </div>

        <div className="mt-7">
          <PField label="Bottle image (optional)">
            <ImageField token={token} value={p.image || ""} onChange={(v) => setField("image", v)} />
            <div className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
              Upload a PNG, JPG, or WebP (max 8 MB), or paste a URL. Leave empty to use the CSS bottle placeholder.
            </div>
          </PField>
        </div>

        <div className="grid sm:grid-cols-2 gap-7 mt-7">
          <PField label="Best for">
            <input value={p.bestFor} onChange={(e) => setField("bestFor", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none"
              placeholder="Daily hydration without buildup" />
          </PField>
          <PField label="Texture / feel">
            <input value={p.feel} onChange={(e) => setField("feel", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none"
              placeholder="Watery-cream texture…" />
          </PField>
        </div>

        <div className="mt-7">
          <PField label="Who it's for">
            <textarea rows={2} value={p.who} onChange={(e) => setField("who", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none resize-none" />
          </PField>
        </div>

        <div className="mt-7">
          <PField label="How to use">
            <textarea rows={2} value={p.howTo} onChange={(e) => setField("howTo", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none resize-none" />
          </PField>
        </div>

        <ListField label="Benefits (one per line)" value={p.benefits} onChange={(v) => setField("benefits", v)} testid="pe-benefits" />
        <ListField label="Ingredients (one per line)" value={p.ingredients} onChange={(v) => setField("ingredients", v)} testid="pe-ingredients" />

        <div className="mt-10 flex gap-3 justify-end">
          <button type="button" onClick={onClose}
            className="cl-btn-secondary text-white rounded-full px-7 py-4 text-xs font-semibold uppercase">Cancel</button>
          <button type="submit" disabled={saving} data-testid="pe-save"
            className="cl-btn-primary text-white rounded-full px-7 py-4 text-xs font-semibold uppercase disabled:opacity-50">
            {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PField({ label, children }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 mb-3">{label}</div>
      {children}
    </label>
  );
}

function ImageField({ token, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputId = `upload-${Math.random().toString(36).slice(2)}`;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Image must be under 8 MB"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${API}/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `Upload failed (${r.status})`);
      }
      const { url } = await r.json();
      onChange(url);
      toast.success("Image uploaded");
    } catch (e) { toast.error(e.message); }
    finally { setUploading(false); e.target.value = ""; }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {value && (
          <div className="w-20 h-20 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={value} alt="" className="max-w-full max-h-full object-contain" />
          </div>
        )}
        <div className="flex-1 flex gap-2">
          <label htmlFor={inputId}
            className="cl-btn-secondary text-white rounded-full px-5 py-3 text-xs font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer">
            {uploading ? "Uploading…" : value ? "Replace" : "Upload image"}
          </label>
          <input id={inputId} data-testid="pe-image-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleUpload} disabled={uploading} className="hidden" />
          {value && (
            <button type="button" onClick={() => onChange("")}
              className="px-4 py-2.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs flex items-center gap-2">
              <Trash2 size={12} /> Remove
            </button>
          )}
        </div>
      </div>
      <input data-testid="pe-image" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none font-mono text-xs"
        placeholder="…or paste an image URL" />
    </div>
  );
}

function ListField({ label, value, onChange, testid }) {
  return (
    <div className="mt-7">
      <PField label={label}>
        <textarea data-testid={testid} rows={4} value={value.join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none resize-none font-mono text-sm" />
      </PField>
    </div>
  );
}
