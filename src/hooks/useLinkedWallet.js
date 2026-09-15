import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { supabase } from '../lib/supabase';
import { getProvider, KAIA_KAIROS } from '../utils/kaia';

export function useLinkedWallet(user) {
  const [linkedWallet, setLinkedWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!supabase || !user?.id) {
      setLinkedWallet(null);
      return;
    }
    const { data, error: walletError } = await supabase
      .from('wallets')
      .select('id, user_id, address, chain_id, is_primary, created_at')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .maybeSingle();
    if (walletError) throw walletError;
    setLinkedWallet(data);
  }, [user?.id]);

  useEffect(() => {
    refresh().catch((walletError) => setError(walletError.message));
  }, [refresh]);

  const link = useCallback(async (address) => {
    if (!supabase || !user?.id) throw new Error('로그인이 필요합니다.');
    if (!address) throw new Error('먼저 MetaMask 지갑을 연결해주세요.');
    setLoading(true);
    setError(null);
    try {
      const normalizedAddress = ethers.getAddress(address);
      const message = [
        'MobiTrust 지갑 연결',
        '',
        '이 서명은 결제를 실행하지 않습니다.',
        `사용자: ${user.id}`,
        `지갑: ${normalizedAddress}`,
        `체인: Kaia Kairos (${KAIA_KAIROS.chainIdDecimal})`,
      ].join('\n');
      const signer = await (await getProvider()).getSigner();
      const signature = await signer.signMessage(message);
      const recoveredAddress = ethers.verifyMessage(message, signature);
      if (ethers.getAddress(recoveredAddress) !== normalizedAddress) {
        throw new Error('지갑 서명을 확인할 수 없습니다.');
      }
      const { data, error: linkError } = await supabase.rpc('link_primary_wallet', {
        p_address: normalizedAddress,
        p_chain_id: KAIA_KAIROS.chainIdDecimal,
      });
      if (linkError) throw linkError;
      setLinkedWallet(data);
      return data;
    } catch (linkError) {
      setError(linkError.message);
      throw linkError;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const unlink = useCallback(async () => {
    if (!supabase || !user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { error: unlinkError } = await supabase
        .from('wallets')
        .delete()
        .eq('user_id', user.id)
        .eq('is_primary', true);
      if (unlinkError) throw unlinkError;
      setLinkedWallet(null);
    } catch (unlinkError) {
      setError(unlinkError.message);
      throw unlinkError;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { linkedWallet, loading, error, link, unlink, refresh };
}
