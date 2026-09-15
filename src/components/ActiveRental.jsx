import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ethers } from 'ethers';
import { theme } from '../styles/theme';
import { useContract } from '../hooks/useContract';
import { useBookings } from '../hooks/useBookings';
import { completeBooking, recordSettlement } from '../services/bookingRepository';
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

export default function ActiveRental({ userId, wallet, addTxLog, onEnd }) {
  const { bookings, loading: bookingsLoading, refresh } = useBookings(userId);
  const rental = bookings.find(b => b.status === 'active') || null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getRentalEscrow } = useContract();
  const elapsed = useElapsed(rental?.startDate);

  if (bookingsLoading) {
    return (
      <Screen>
        <PageTitle>내 렌탈</PageTitle>
        <EmptyState><p>불러오는 중이에요…</p></EmptyState>
      </Screen>
    );
  }

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
    if (!wallet.isCorrectChain) { setError('Kaia Kairos 테스트넷으로 전환해주세요.'); return; }
    setLoading(true);
    setError('');

    try {
      // 반납 확인/정산 승인은 지금 플랫폼(owner) 지갑만 호출 가능함 — 데모에선 배포한
      // 지갑으로 직접 눌러서 넘기면 되고, 실서비스면 이 권한을 누가 행사할지 별도 설계 필요 (HANDOFF 참고)
      const contract = await getRentalEscrow(true);
      const tx = await contract.release(ethers.id(rental.id));
      addTxLog({ type: '반납', message: '운행 종료 요청', status: 'pending' });
      const receipt = await tx.wait();

      // 실제 온체인에서 얼마씩 나뉘었는지 이벤트 로그에서 직접 읽어서 settlements에 기록
      // (직접 재계산하지 않고 이벤트 값을 그대로 써서 컨트랙트 실제 결과와 항상 일치하게 함)
      const released = receipt.logs
        .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
        .find(log => log?.name === 'Released');
      if (released && rental.vehicle.hostId) {
        // 온체인 값은 18자리 소수 단위라 DB에 쓰는 정수 KRW 단위로 환산해야 함 (bigint라 JSON 직렬화도 안 됨)
        const hostAmount = Number(ethers.formatUnits(released.args.hostAmount, 18));
        const platformFee = Number(ethers.formatUnits(released.args.platformFee, 18));
        await recordSettlement({
          bookingId: rental.id,
          hostId: rental.vehicle.hostId,
          grossAmount: hostAmount + platformFee,
          platformFee,
          txHash: tx.hash,
        });
      }

      await completeBooking(rental.id);
      await refresh();
      addTxLog({ type: '정산', message: `${rental.vehicle.name} 반납 완료! ${rental.totalAmount.toLocaleString()} W-KRW가 즉시 정산됐어요`, status: 'success' });
      onEnd();
    } catch (err) {
      const msg = err.shortMessage || err.reason || err.message || '트랜잭션 실패';
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
          <InfoValue $highlight style={{ fontSize: 19 }}>{rental.totalAmount.toLocaleString()} W-KRW</InfoValue>
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
