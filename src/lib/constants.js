export const ROOT_DOMAIN = 'dominio.com';
export const ADMIN_SUBDOMAIN = 'app';
export const CORPORATE_SUBDOMAIN = 'www';

export const SUBDOMAIN_TYPES = {
  CORPORATE: 'corporate',
  RESTAURANT: 'restaurant',
  ADMIN: 'admin',
};

export const NAV_ITEMS = {
  corporate: [
    { label: 'Producto', href: '/#producto' },
    { label: 'Casos de Éxito', href: '/#casos' },
    { label: 'Precios', href: '/#precios' },
    { label: 'Contacto', href: '/contacto' },
  ],
  admin: [
    { label: 'Dashboard', href: 'dashboard', icon: 'LayoutDashboard' },
    { label: 'POS', href: 'pos', icon: 'UtensilsCrossed' },
    { label: 'KDS', href: 'kds', icon: 'ChefHat' },
    { label: 'Inventario', href: 'inventory', icon: 'Package' },
    { label: 'Recetas', href: 'recipes', icon: 'Calculator' },
    { label: 'Ing. Menú', href: 'menu-engineering', icon: 'BarChart3' },
    { label: 'CRM', href: 'crm', icon: 'Users' },
    { label: 'Menú Digital', href: 'digital-menu', icon: 'QrCode' },
    { label: 'Reportes', href: 'reports', icon: 'TrendingUp' },
  ],
};

export const ANIMATION_VARIANTS = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  stagger: {
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
  },
};

export const GLASS_STYLE =
  'bg-surface-glass backdrop-blur-xl border border-surface-glass-border rounded-2xl shadow-2xl';
