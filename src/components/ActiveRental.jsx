import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';
import { useContract } from '../hooks/useContract';
import {
  Screen, PageTitle, Card, SectionLabel, Chip, DangerButton,
  StickyFooter, InlineError, SpinnerDark, EmptyState,
} from './ui/Primitives';
import { IconKey, IconMapPin, IconAlert } from './ui/Icon';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
`;

const PulseDot = styled.span`
  width: 7px; height: 7px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  animation: ${pulse} 1.4s ease-in-out infinite;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const InfoItem = styled.div`
  background: ${theme.colors.surfaceMuted};
  border-radius: ${theme.radius.sm};
  padding: 12px 14px;
`;

const InfoLabel = styled.p`
  font-size: 11px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const InfoValue = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: ${p => (p.$highlight ? theme.colors.primaryDark : theme.colors.text)};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RentalPhoto = styled.img`
  width: 100%; aspect-ratio: 16 / 8; object-fit: cover;
  border-radius: ${theme.radius.sm}; margin-bottom: 14px; display: block;
`;

const TimerBox = styled.div`
  text-align: center;
  padding: 26px;
  background: ${theme.colors.surfaceMuted};
  border-radius: ${theme.radius.sm};
  margin-bottom: 12px;
`;

const TimerLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const TimerValue = styled.p`
  font-size: 38px;
  font-weight: 800;
  letter-spacing: 1px;
  color: ${theme.colors.text};
  font-variant-numeric: tabular-nums;
`;

function useElapsed(startDate) {
  const [elapsed, setElapsed] = useState('00:00:00');
  useEffect(() => {
    if (!startDate) return;
    const tick = () => {
      const s = Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 1000));
      const h = String(Math.floor(s / 3600)).padStart(2, '0');
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const sec = String(s % 60).padStart(2, '0');
      setElapsed(`${h}:${m}:${sec}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startDate]);
  return elapsed;
}

export default function ActiveRental({ rental, wallet, addTxLog, onEnd }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // eslint-disable-next-line no-unused-vars
  const { getCarSharing } = useContract();
  const elapsed = useElapsed(rental?.startDate);

  if (!rental) {
    return (
      <Screen>
        <PageTitle>내 렌탈</PageTitle>
        <EmptyState>
          <IconKey size={40} />
          <p>진행 중인 렌탈이 없어요</p>
        </EmptyState>
      </Screen>
    );
  }

  const handleEnd = async () => {
    if (!wallet.isConnected) { setError('MetaMask를 먼저 연결해주세요.'); return; }
    setLoading(true);
    setError('');

    try {
      // TODO: CarSharing.json ABI 설정 후 아래 주석을 해제하세요
      // const contract = await getCarSharing(true);
      // const tx = await contract.checkout();
      // addTxLog({ type: '반납', message: '운행 종료 요청', status: 'pending' });
      // await tx.wait();

      await new Promise(r => setTimeout(r, 1500));
      addTxLog({ type: '정산', message: `${rental.vehicle.name} 반납 완료! ${rental.total.toLocaleString()} W-KRW가 즉시 정산됐어요`, status: 'success' });
      onEnd();
    } catch (err) {
      const msg = err.reason || err.message || '트랜잭션 실패';
      setError(msg);
      addTxLog({ type: '반납', message: `반납 중 문제가 생겼어요: ${msg}`, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <PageTitle>내 렌탈</PageTitle>
      <Chip $tone="primary" style={{ marginBottom: 16 }}><PulseDot /> &nbsp;운행 중</Chip>

      <Card>
        <SectionLabel>차량 정보</SectionLabel>
        <RentalPhoto src={rental.vehicle.image} alt={rental.vehicle.name} />
        <InfoGrid>
          <InfoItem>
            <InfoLabel>차량</InfoLabel>
            <InfoValue>{rental.vehicle.name}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>위치</InfoLabel>
            <InfoValue><IconMapPin size={12} /> {rental.vehicle.location}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>대여 시작</InfoLabel>
            <InfoValue style={{ fontSize: 11.5 }}>{new Date(rental.startDate).toLocaleString('ko-KR')}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>예정 반납</InfoLabel>
            <InfoValue style={{ fontSize: 11.5 }}>{new Date(rental.endDate).toLocaleString('ko-KR')}</InfoValue>
          </InfoItem>
        </InfoGrid>
      </Card>

      <Card>
        <SectionLabel>경과 시간</SectionLabel>
        <TimerBox>
          <TimerLabel>운행 경과 시간</TimerLabel>
          <TimerValue>{elapsed}</TimerValue>
        </TimerBox>
        <InfoItem>
          <InfoLabel>예상 결제 금액</InfoLabel>
          <InfoValue $highlight style={{ fontSize: 19 }}>{rental.total.toLocaleString()} W-KRW</InfoValue>
        </InfoItem>
      </Card>

      {error && <InlineError><IconAlert size={14} /> {error}</InlineError>}

      <StickyFooter>
        <DangerButton onClick={handleEnd} disabled={loading}>
          {loading ? <><SpinnerDark /> 정산 처리 중…</> : <><IconKey size={18} /> 운행 종료 및 즉시 정산</>}
        </DangerButton>
      </StickyFooter>
    </Screen>
  );
}
