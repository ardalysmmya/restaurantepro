import { create } from 'zustand';

export const TABLE_STATUS = {
  FREE: 'free',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  DIRTY: 'dirty',
};

export const usePOSStore = create((set, get) => ({
  tables: [],
  activeTableId: null,
  orders: {},

  setTables: (tables) => set({ tables }),

  selectTable: (tableId) => set({ activeTableId: tableId }),

  addItemToOrder: (tableId, item) =>
    set((state) => {
      const current = state.orders[tableId] || { items: [], total: 0 };
      const newItems = [...current.items, { ...item, id: crypto.randomUUID?.() || Date.now() }];
      const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return {
        orders: { ...state.orders, [tableId]: { items: newItems, total } },
      };
    }),

  removeItemFromOrder: (tableId, itemId) =>
    set((state) => {
      const current = state.orders[tableId];
      if (!current) return state;
      const newItems = current.items.filter((i) => i.id !== itemId);
      const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return {
        orders: { ...state.orders, [tableId]: { items: newItems, total } },
      };
    }),

  clearOrder: (tableId) =>
    set((state) => {
      const { [tableId]: _, ...rest } = state.orders;
      return { orders: rest, activeTableId: null };
    }),

  changeTableStatus: (tableId, status) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status } : t
      ),
    })),
}));
