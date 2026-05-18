import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';

export function useRealtimeOrders(restaurantId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    orderService.getActiveOrders(restaurantId).then(({ data }) => {
      setOrders(data || []);
      setLoading(false);
    });
    const unsub = orderService.subscribeToOrders(restaurantId, () => {
      orderService.getActiveOrders(restaurantId).then(({ data }) => {
        setOrders(data || []);
      });
    });
    return () => unsub();
  }, [restaurantId]);

  return { orders, loading };
}

export function useRealtimeTables(restaurantId) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (!restaurantId) return;
    orderService.getTables(restaurantId).then(({ data }) => setTables(data || []));
    const unsub = orderService.subscribeToTables(restaurantId, () => {
      orderService.getTables(restaurantId).then(({ data }) => setTables(data || []));
    });
    return () => unsub();
  }, [restaurantId]);

  return { tables };
}

export function useKitchenDisplay(restaurantId) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!restaurantId) return;
    orderService.getActiveOrders(restaurantId).then(({ data }) => setOrders(data || []));
    const unsub = orderService.subscribeToKitchen(restaurantId, () => {
      orderService.getActiveOrders(restaurantId).then(({ data }) => setOrders(data || []));
    });
    return () => unsub();
  }, [restaurantId]);

  return { orders };
}
