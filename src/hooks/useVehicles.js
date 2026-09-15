import { useCallback, useEffect, useState } from 'react';
import { listVehicles } from '../services/vehicleRepository';
import { SEED_VEHICLES } from '../data/seedVehicles';

export function useVehicles() {
  const [vehicles, setVehicles] = useState(SEED_VEHICLES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('seed');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listVehicles();
      setVehicles(result.vehicles);
      setSource(result.source);
      setError(null);
    } catch (err) {
      setVehicles(SEED_VEHICLES);
      setSource('seed');
      setError(err.message || '차량 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { vehicles, loading, error, source, refresh };
}
