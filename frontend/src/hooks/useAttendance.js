import { useState, useEffect, useCallback } from "react";
import { attendanceApi } from "../services/api";

export function useAttendance(studentId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await attendanceApi.list(studentId);
      setRecords(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { records, loading, error, refresh };
}
