import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { API } from "@/lib/data";
import { Download, LogOut, Users, MessageSquare, ClipboardList, BellRing, RefreshCw, Search } from "lucide-react";

const TABS = [
  { key: "early-access", label: "Early Access", path: "early-access", icon: Users, color: "#8B5CF6" },
  { key: "contacts", label: "Contacts", path: "contacts", icon: MessageSquare, color: "#A78BFA" },
  { key: "quiz", label: "Quiz Results", path: "quiz", icon: ClipboardList, color: "#7C3AED" },
  { key: "waitlist", label: "Waitlist", path: "waitlist", icon: BellRing, color: "#C4B5FD" },
];

const STORAGE_KEY = "curlloom_admin_token";

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);

  // Auto-check on mount if token exists
  useEffect(() => {
    if (token && !authed) verify(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async (t) => {
    setChecking(true);
    try {
      const r = await fetch(`${API}/admin/early-access`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (r.ok) {
        localStorage.setItem(STORAGE_KEY, t);
        setAuthed(true);
        return true;
      }
      throw new Error(r.status === 401 ? "Invalid token" : "Server error");
    } catch (e) {
      toast.error(e.message || "Login failed");
      return false;
    } finally {
      setChecking(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <form
          onSubmit={(e) => { e.preventDefault(); verify(token); }}
          className="cl-glass-strong rounded-3xl p-10 w-full max-w-md"
          data-testid="admin-login"
        >
          <Link to="/" className="text-zinc-500 hover:text-white text-xs">← Back to site</Link>
          <h1 className="mt-4 text-3xl font-bold text-white tracking-[-0.02em]">Admin</h1>
          <p className="mt-3 text-sm text-zinc-400">Enter your admin token to access submissions.</p>

          <div className="mt-7">
            <div className="text-[11px] uppercase tracking-widest text-zinc-400 mb-2">Token</div>
            <input
              type="password"
              required
              autoFocus
              value={token}
              onChange={(e) => setToken(e.target.value)}
              data-testid="admin-token-input"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none"
              placeholder="Paste admin token"
            />
          </div>

          <button
            type="submit"
            disabled={checking || !token}
            data-testid="admin-login-submit"
            className="mt-7 w-full cl-btn-primary text-white rounded-full px-7 py-4 text-xs font-semibold uppercase disabled:opacity-50"
          >
            {checking ? "Verifying…" : "Sign in"}
          </button>

          <p className="mt-6 text-[11px] text-zinc-500 leading-relaxed">
            Token lives in <code className="text-zinc-300">/app/backend/.env</code> as <code className="text-zinc-300">ADMIN_TOKEN</code>.
          </p>
        </form>
      </div>
    );
  }

  return <Dashboard token={token} onLogout={logout} />;
}

function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState("early-access");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        TABS.map(async (t) => {
          const r = await fetch(`${API}/admin/${t.path}`, { headers: { Authorization: `Bearer ${token}` } });
          return [t.key, r.ok ? await r.json() : []];
        })
      );
      setData(Object.fromEntries(results));
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, []);

  const current = data[tab] || [];
  const filtered = !query
    ? current
    : current.filter((row) =>
        Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(query.toLowerCase()))
      );

  const downloadCsv = () => {
    if (!current.length) return;
    const cols = Array.from(
      current.reduce((set, row) => {
        Object.keys(row).forEach((k) => set.add(k));
        return set;
      }, new Set())
    );
    const escape = (v) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [cols.join(","), ...current.map((row) => cols.map((c) => escape(row[c])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `curlloom-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-3">Admin</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-[-0.025em]">Submissions</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-testid="admin-refresh"
            onClick={fetchAll}
            className="cl-btn-secondary text-white rounded-full px-5 py-3 text-xs font-semibold uppercase flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            data-testid="admin-logout"
            onClick={onLogout}
            className="cl-btn-secondary text-white rounded-full px-5 py-3 text-xs font-semibold uppercase flex items-center gap-2"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = (data[t.key] || []).length;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              data-testid={`stat-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`cl-glass rounded-3xl p-7 text-left transition-all hover:border-violet-500/30 ${active ? "border-violet-500/40 bg-violet-500/[0.04]" : ""}`}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${t.color}22`, border: `1px solid ${t.color}55` }}
                >
                  <Icon size={18} style={{ color: t.color }} />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-white tracking-[-0.03em]">{count}</div>
              <div className="mt-2 text-sm text-zinc-400">{t.label}</div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            data-testid="admin-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${TABS.find((t) => t.key === tab)?.label.toLowerCase()}…`}
            className="w-full bg-white/[0.03] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none"
          />
        </div>
        <button
          data-testid="admin-download"
          onClick={downloadCsv}
          disabled={!current.length}
          className="cl-btn-primary text-white rounded-full px-6 py-3 text-xs font-semibold uppercase flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <DataTable rows={filtered} tab={tab} />
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

function DataTable({ rows, tab }) {
  if (!rows.length) {
    return (
      <div className="cl-glass rounded-3xl p-16 text-center text-zinc-500">
        No submissions yet.
      </div>
    );
  }

  const cols = COLUMN_PRESETS[tab] || Object.keys(rows[0]).filter((k) => k !== "id");

  return (
    <div className="cl-glass rounded-3xl overflow-hidden" data-testid={`admin-table-${tab}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              {cols.map((c) => (
                <th key={c} className="text-left text-[11px] uppercase tracking-widest text-zinc-500 font-medium px-5 py-4 whitespace-nowrap">
                  {c.replace(/_/g, " ")}
                </th>
              ))}
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
