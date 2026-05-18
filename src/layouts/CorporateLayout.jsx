import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NAV_ITEMS } from '../lib/constants';

export default function CorporateLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen noise-bg">
      <nav className="fixed top-0 inset-x-0 z-50 glass-card !rounded-none !border-t-0 !border-x-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-display text-xl font-bold tracking-tight">
            <span className="text-gradient-brand">Restaurante</span>
            <span className="text-gradient">Pro</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.corporate.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-white/60 hover:text-white transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
            <a
              href={`https://app.${window.location.hostname}`}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium rounded-full transition-all duration-300 hover:shadow-[0_0_24px_rgba(238,122,18,0.4)]"
            >
              Iniciar Sesión
            </a>
          </div>

          <button
            className="md:hidden text-white/80"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden px-6 pb-6 space-y-4"
          >
            {NAV_ITEMS.corporate.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-white/60 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </motion.div>
        )}
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-12 section-padding">
        <div className="max-w-7xl mx-auto text-center text-white/30 text-sm">
          &copy; {new Date().getFullYear()} RestaurantePro. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
