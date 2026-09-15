import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { listMyEarnings } from '../services/bookingRepository';
import { Screen, PageTitle, PageSubtitle, Card, Chip, EmptyState } from './ui/Primitives';
import { IconWallet } from './ui/Icon';

const SummaryCard = styled(Card)`text-align: center; padding: 22px;`;
const SummaryLabel = styled.p`font-size: 12px; color: ${theme.colors.textSecondary}; margin-bottom: 6px;`;
const SummaryValue = styled.p`font-size: 26px; font-weight: 800; color: ${theme.colors.primaryDark};`;

const Row = styled.div`display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 8px; &:last-child { margin-bottom: 0; }`;
const Name = styled.h3`font-size: 15px; color: ${theme.colors.text}; margin: 0;`;
const Meta = styled.p`font-size: 12px; color: ${theme.colors.textSecondary}; margin: 0;`;
const Amount = styled.p`font-size: 15px; font-weight: 800; color: ${theme.colors.text}; text-align: right;`;
const Breakdown = styled.p`font-size: 11px; color: ${theme.colors.textTertiary}; text-align: right; margin: 2px 0 0;`;
const TxLink = styled.a`display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; color: ${theme.colors.primaryDark}; text-decoration: none; margin-top: 8px;`;
const ErrorText = styled.p`color: ${theme.colors.danger}; font-size: 12px; margin-bottom: 12px;`;

const KAIROS_EXPLORER = 'https://kairos.kaiascan.io/tx/';

export default function Earnings({ userId }) {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setEarnings(await listMyEarnings(userId));
      setError('');
    } catch (loadError) {
      setError(loadError.message || '수익 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const total = earnings.reduce((sum, item) => sum + item.hostAmount, 0);

  return (
    <Screen>
      <PageTitle>수익 현황</PageTitle>
      <PageSubtitle>반납과 동시에 온체인에서 즉시 정산된 내역이에요</PageSubtitle>

      <SummaryCard>
        <SummaryLabel>누적 정산액</SummaryLabel>
        <SummaryValue>{total.toLocaleString()} W-KRW</SummaryValue>
      </SummaryCard>

      {error && <ErrorText>{error}</ErrorText>}
      {loading ? <Meta>불러오는 중이에요…</Meta> : earnings.length === 0 ? (
        <EmptyState>
          <IconWallet size={40} />
          <p>아직 정산된 내역이 없어요</p>
        </EmptyState>
      ) : earnings.map(item => (
        <Card key={item.id}>
          <Row>
            <div>
              <Name>{item.vehicleName}</Name>
              <Meta>{item.rentedAt ? new Date(item.rentedAt).toLocaleDateString('ko-KR') : ''}</Meta>
            </div>
            <div>
              <Amount>+{item.hostAmount.toLocaleString()} W-KRW</Amount>
              <Breakdown>총 {item.grossAmount.toLocaleString()} - 수수료 {item.platformFee.toLocaleString()}</Breakdown>
            </div>
          </Row>
          <Row>
            <Chip $tone="primary">정산 완료</Chip>
            {item.txHash && (
              <TxLink href={`${KAIROS_EXPLORER}${item.txHash}`} target="_blank" rel="noreferrer">
                Kaiascan에서 보기 ↗
              </TxLink>
            )}
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
