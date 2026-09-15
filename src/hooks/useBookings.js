import { useCallback, useEffect, useState } from 'react';
import { cancelBooking, listMyBookings, startBooking } from '../services/bookingRepository';

export function useBookings(userId) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setBookings(await listMyBookings(userId));
      setError('');
    } catch (loadError) {
      setError(loadError.message || '예약 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const cancel = async (bookingId) => {
    await cancelBooking(bookingId);
    await refresh();
  };

  const start = async (bookingId) => {
    await startBooking(bookingId);
    await refresh();
  };

  return { bookings, loading, error, cancel, start, refresh };
}
