import { create } from 'zustand';

export const ORDER_STATUS = {
  PENDING: 'pending',
  COOKING: 'cooking',
  READY: 'ready',
  DELIVERED: 'delivered',
};

export const PRIORITY = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  RUSH: 3,
};

export const useKDSStore = create((set) => ({
  orders: [],

  addOrder: (order) =>
    set((state) => ({
      orders: [
        ...state.orders,
        {
          ...order,
          status: ORDER_STATUS.PENDING,
          priority: order.priority ?? PRIORITY.NORMAL,
          startedAt: new Date().toISOString(),
        },
      ].sort((a, b) => b.priority - a.priority || a.startedAt.localeCompare(b.startedAt)),
    })),

  updateStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    })),

  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
    })),
}));
