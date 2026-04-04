import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

export const useAlerts = (initialPage = 1, initialLimit = 20) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/dashboard/alerts?page=${page}&limit=${initialLimit}`);
      setAlerts(res.data.data || []);
      setMeta(res.data.meta || { total: 0, page: 1, limit: 20 });
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  }, [page, initialLimit]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const addAlert = (newAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };

  return { alerts, loading, error, page, setPage, meta, fetchAlerts, addAlert };
};
