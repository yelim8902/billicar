import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const EMPTY_STATS = { bookings: 0, vehicles: 0, earnings: 0 };

export function useMyPageStats(userId) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!supabase || !userId) {
      setStats(EMPTY_STATS);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('renter_id', userId),
      supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('host_id', userId),
      supabase.from('settlements').select('host_amount,status').eq('host_id', userId).eq('status', 'completed'),
    ]).then(([bookings, vehicles, settlements]) => {
      const error = bookings.error || vehicles.error || settlements.error;
      if (error) throw error;
      if (!active) return;
      setStats({
        bookings: bookings.count || 0,
        vehicles: vehicles.count || 0,
        earnings: (settlements.data || []).reduce((sum, item) => sum + Number(item.host_amount), 0),
      });
    }).catch(() => {
      if (active) setStats(EMPTY_STATS);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [userId]);

  return { stats, loading };
}
