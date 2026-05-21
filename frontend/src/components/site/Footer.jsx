import { Link } from "react-router-dom";
import { Instagram, Linkedin } from "lucide-react";
import Wordmark from "./Wordmark";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-white/5 bg-[#08080A]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <Wordmark size="lg" testid="footer-logo" />
            <p className="mt-5 text-zinc-400 text-sm leading-relaxed max-w-md">
              Lightweight, low-buildup curl care — built for waves, curls, coils, perms, and the routines that move through real life.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"
                 data-testid="social-instagram"
                 className="w-10 h-10 flex items-center justify-center rounded-full cl-glass text-zinc-300 hover:text-white transition">
                <Instagram size={16} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok"
                 data-testid="social-tiktok"
                 className="w-10 h-10 flex items-center justify-center rounded-full cl-glass text-zinc-300 hover:text-white transition text-xs font-bold">
                TT
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"
                 data-testid="social-linkedin"
                 className="w-10 h-10 flex items-center justify-center rounded-full cl-glass text-zinc-300 hover:text-white transition">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Explore</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop" className="text-zinc-300 hover:text-white">Products</Link></li>
              <li><Link to="/quiz" className="text-zinc-300 hover:text-white">Curl Quiz</Link></li>
              <li><Link to="/about" className="text-zinc-300 hover:text-white">About</Link></li>
              <li><Link to="/ingredients" className="text-zinc-300 hover:text-white">Ingredients</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Care</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/athletes" className="text-zinc-300 hover:text-white">Athletes</Link></li>
              <li><Link to="/perm-care" className="text-zinc-300 hover:text-white">Perm Care</Link></li>
              <li><Link to="/testing" className="text-zinc-300 hover:text-white">Testing & Safety</Link></li>
              <li><Link to="/faq" className="text-zinc-300 hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Reach Us</div>
            <ul className="space-y-3 text-sm">
              <li className="text-zinc-300">help@curlloom.co</li>
              <li className="text-zinc-300">curlloom.co</li>
              <li><Link to="/contact" className="text-zinc-300 hover:text-white">Contact</Link></li>
              <li><Link to="/shipping" className="text-zinc-300 hover:text-white">Shipping & Returns</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6 text-xs text-zinc-500">
          <div className="flex flex-wrap gap-6">
            <Link to="/faq" className="hover:text-zinc-300">FAQ</Link>
            <Link to="/shipping" className="hover:text-zinc-300">Shipping & Returns</Link>
            <Link to="/privacy" className="hover:text-zinc-300">Privacy</Link>
            <Link to="/terms" className="hover:text-zinc-300">Terms</Link>
          </div>
          <div>&copy; {new Date().getFullYear()} CurlLoom. All rights reserved.</div>
        </div>

        <p className="mt-6 text-[11px] text-zinc-600 leading-relaxed max-w-3xl">
          CurlLoom products are cosmetic products and are not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </div>
    </footer>
  );
}
