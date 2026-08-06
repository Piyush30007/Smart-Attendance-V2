import { useState, useEffect, useCallback } from "react";
import attendanceService from "../services/attendanceService";
import { getErrorMessage }  from "../utils/getErrorMessage";
export function useAttendance(studentId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await attendanceService.list(studentId);
      setRecords(data);
    } catch (err) {
  setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { records, loading, error, refresh };
}
