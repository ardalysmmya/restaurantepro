import { create } from 'zustand';

const MOCK_STORES = [
  {
    id: 'la-maison',
    name: 'La Maison',
    type: 'Fine Dining',
    logo: 'LM',
    status: 'active',
    tables: 16,
    revenue: '$842K',
  },
  {
    id: 'el-asador',
    name: 'El Asador Prime',
    type: 'Steakhouse',
    logo: 'AP',
    status: 'active',
    tables: 24,
    revenue: '$1.2M',
  },
  {
    id: 'sakura-bar',
    name: 'Sakura Bar',
    type: 'Nikkei Fusion',
    logo: 'SB',
    status: 'active',
    tables: 12,
    revenue: '$560K',
  },
  {
    id: 'la-terraza',
    name: 'La Terraza',
    type: 'Mediterráneo',
    logo: 'LT',
    status: 'setup',
    tables: 20,
    revenue: '—',
  },
];

export const useStoreContext = create((set, get) => ({
  stores: MOCK_STORES,
  activeStoreId: null,

  setActiveStore: (storeId) => set({ activeStoreId: storeId }),

  get activeStore() {
    return get().stores.find((s) => s.id === get().activeStoreId) || null;
  },

  initFromRoute: (storeId) => {
    if (get().stores.find((s) => s.id === storeId)) {
      set({ activeStoreId: storeId });
    }
  },
}));
