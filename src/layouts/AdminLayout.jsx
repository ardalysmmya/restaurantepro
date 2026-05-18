import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UtensilsCrossed, ChefHat, Calculator,
  Users, QrCode, BarChart3, Bell, ChevronLeft, LogOut, Menu,
  Store, ChevronDown, Check, Building2, ArrowLeftRight,
  Package, TrendingUp,
} from 'lucide-react';
import { NAV_ITEMS } from '../lib/constants';
import { cn } from '../lib/utils';

const iconMap = {
  LayoutDashboard, UtensilsCrossed, ChefHat, Calculator, Users, QrCode, BarChart3,
  Package, TrendingUp,
};

const STORE_LIST = [
  { id: 'la-maison', name: 'La Maison', type: 'Fine Dining', color: 'from-brand-400 to-brand-600' },
  { id: 'el-asador', name: 'El Asador Prime', type: 'Steakhouse', color: 'from-amber-400 to-red-600' },
  { id: 'sakura-bar', name: 'Sakura Bar', type: 'Nikkei Fusion', color: 'from-pink-400 to-purple-600' },
  { id: 'la-terraza', name: 'La Terraza', type: 'Mediterráneo', color: 'from-emerald-400 to-teal-600' },
];

export default function AdminLayout() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  const currentStore = STORE_LIST.find((s) => s.id === storeId) || STORE_LIST[0];
  const buildPath = (href) => `/store/${storeId}/${href}`;

  return (
    <div className="flex h-screen overflow-hidden bg-premium-dark noise-bg">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative z-50 h-full glass-card !rounded-none !border-t-0 !border-l-0 !border-b-0 transition-all duration-500 flex flex-col',
          collapsed ? 'w-[72px]' : 'w-[272px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Store Switcher Header */}
        <div className={cn('border-b border-white/5', collapsed ? 'p-3' : 'p-4')}>
          <button
            onClick={() => !collapsed && setStoreDropdownOpen(!storeDropdownOpen)}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl transition-all duration-300',
              collapsed
                ? 'justify-center p-2 hover:bg-white/5'
                : 'p-2.5 hover:bg-white/[0.03]'
            )}
          >
            <div className={cn(
              'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center font-display font-bold text-xs shrink-0',
              currentStore.color
            )}>
              {currentStore.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{currentStore.name}</p>
                  <p className="text-[10px] text-white/30 truncate">{currentStore.type}</p>
                </div>
                <ChevronDown
                  size={14}
                  className={cn(
                    'text-white/30 transition-transform duration-300 shrink-0',
                    storeDropdownOpen && 'rotate-180'
                  )}
                />
              </>
            )}
          </button>

          {/* Store Dropdown */}
          <AnimatePresence>
            {storeDropdownOpen && !collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-1">
                  {STORE_LIST.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => {
                        navigate(`/store/${store.id}/dashboard`);
                        setStoreDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                        store.id === storeId
                          ? 'bg-brand-500/10 text-brand-400'
                          : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center font-display font-bold text-[10px]',
                        store.color
                      )}>
                        {store.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="flex-1 text-left truncate">{store.name}</span>
                      {store.id === storeId && <Check size={14} className="text-brand-400 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      navigate('/');
                      setStoreDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-colors"
                  >
                    <ArrowLeftRight size={13} />
                    <span>Cambiar de Restaurante</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse Toggle */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex absolute -right-3 top-6 w-6 h-6 rounded-full bg-premium-card border border-white/10 items-center justify-center hover:border-white/20 transition-colors z-10"
          >
            <ChevronLeft size={12} className="text-white/40" />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {NAV_ITEMS.admin.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <NavLink
                key={item.href}
                to={buildPath(item.href)}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative',
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5',
                  collapsed && 'justify-center px-2'
                )}
              >
                {Icon && <Icon size={20} />}
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2 py-1 bg-premium-card text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn('p-4 border-t border-white/5', collapsed && 'flex justify-center')}>
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Expandir menú"
            >
              <ChevronLeft size={16} className="text-white/30 rotate-180" />
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 text-white/30 hover:text-white/60 transition-colors text-sm px-3 py-2 rounded-lg hover:bg-white/[0.02]"
              >
                <Building2 size={16} />
                <span>Mis Restaurantes</span>
              </button>
              <button className="w-full flex items-center gap-3 text-white/30 hover:text-red-400 transition-colors text-sm px-3 py-2 rounded-lg hover:bg-white/[0.02]">
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 glass-card !rounded-none !border-t-0 !border-x-0 flex items-center justify-between px-6 shrink-0">
          <button
            className="md:hidden p-1.5"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={24} className="text-white/60" />
          </button>

          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">En vivo</span>
            <span className="text-white/10 mx-2">|</span>
            <span className="text-xs text-white/20">{currentStore.name}</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Bell size={20} className="text-white/40" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold">
              JM
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
