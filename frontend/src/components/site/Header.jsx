import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import Wordmark from "./Wordmark";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Products" },
  { to: "/ingredients", label: "Ingredients" },
  { to: "/quiz", label: "Curl Quiz" },
  { to: "/testing", label: "Testing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 inset-x-0 z-50 cl-glass">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <Wordmark testid="header-logo" />

        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? "text-white" : "text-zinc-400 hover:text-white"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            data-testid="cart-icon"
            aria-label="Cart"
            className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full cl-glass text-zinc-400 hover:text-white transition"
          >
            <ShoppingBag size={18} />
          </button>
          <Link
            to="/#early-access"
            data-testid="header-join-early-access"
            className="hidden sm:inline-flex cl-btn-primary text-white rounded-full px-5 py-2.5 text-xs font-semibold tracking-wider uppercase"
          >
            Join Early Access
          </Link>
          <button
            data-testid="mobile-menu-toggle"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full cl-glass text-white"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/5 bg-[#0A0A0C]/95 backdrop-blur-xl">
          <nav className="px-6 py-6 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
                className={({ isActive }) =>
                  `py-3 text-base ${isActive ? "text-white" : "text-zinc-400"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <Link
              to="/#early-access"
              onClick={() => setOpen(false)}
              data-testid="mobile-join-early-access"
              className="mt-4 cl-btn-primary text-white rounded-full px-6 py-3 text-xs font-semibold tracking-wider uppercase text-center"
            >
              Join Early Access
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
