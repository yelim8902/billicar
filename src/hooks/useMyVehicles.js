import { useCallback, useEffect, useState } from 'react';
import { listMyVehicles } from '../services/vehicleRepository';

export function useMyVehicles(userId) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setVehicles(await listMyVehicles(userId));
      setError('');
    } catch (loadError) {
      setError(loadError.message || '차량 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { vehicles, loading, error, refresh };
}
