import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { useBookings } from '../hooks/useBookings';
import { Screen, PageTitle, PageSubtitle, Card, Chip, EmptyState, GhostButton } from './ui/Primitives';
import { IconCalendar, IconMapPin } from './ui/Icon';

const BookingCard = styled(Card)`padding: 0; overflow: hidden;`;
const Photo = styled.img`width: 100%; height: 150px; object-fit: cover; display: block;`;
const Body = styled.div`padding: 16px;`;
const Head = styled.div`display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 7px;`;
const Name = styled.h3`font-size: 17px; color: ${theme.colors.text}; margin: 0;`;
const Meta = styled.p`display: flex; align-items: center; gap: 4px; color: ${theme.colors.textSecondary}; font-size: 12px; margin: 4px 0;`;
const DateBox = styled.div`
  margin: 13px 0; padding: 12px; border-radius: ${theme.radius.sm}; background: ${theme.colors.surfaceMuted};
  color: ${theme.colors.text}; font-size: 12px; line-height: 1.7;
`;
const Price = styled.p`text-align: right; color: ${theme.colors.text}; font-size: 16px; font-weight: 800;`;
const ErrorText = styled.p`color: ${theme.colors.danger}; font-size: 12px; margin-bottom: 12px;`;

const STATUS = {
  pending: { label: '결제 대기', tone: 'warning' },
  confirmed: { label: '예약 확정', tone: 'primary' },
  active: { label: '이용 중', tone: 'primary' },
  completed: { label: '이용 완료' },
  cancelled: { label: '예약 취소', tone: 'danger' },
  rejected: { label: '예약 거절', tone: 'danger' },
  disputed: { label: '분쟁 처리 중', tone: 'warning' },
};

export default function MyBookings({ userId, onFindVehicle }) {
  const { bookings, loading, error, cancel } = useBookings(userId);
  const [actionError, setActionError] = useState('');

  const handleCancel = async (id) => {
    setActionError('');
    try {
      await cancel(id);
    } catch (cancelError) {
      setActionError(cancelError.message || '예약을 취소하지 못했습니다.');
    }
  };

  return (
    <Screen>
      <PageTitle>내 예약</PageTitle>
      <PageSubtitle>다가오는 예약과 지난 차량 이용 기록이에요</PageSubtitle>
      {(error || actionError) && <ErrorText>{error || actionError}</ErrorText>}
      {loading ? <Meta>예약 내역을 불러오는 중이에요…</Meta> : bookings.length === 0 ? (
        <EmptyState>
          <IconCalendar size={40} />
          <p>아직 예약한 차량이 없어요</p>
          <GhostButton style={{ marginTop: 16 }} onClick={onFindVehicle}>차량 찾아보기</GhostButton>
        </EmptyState>
      ) : bookings.map(booking => {
        const status = STATUS[booking.status] || STATUS.pending;
        return (
          <BookingCard key={booking.id}>
            <Photo src={booking.vehicle.image} alt={booking.vehicle.name} />
            <Body>
              <Head><Name>{booking.vehicle.name}</Name><Chip $tone={status.tone}>{status.label}</Chip></Head>
              <Meta><IconMapPin size={13} />{booking.vehicle.location}</Meta>
              <DateBox>
                <b>대여</b> {new Date(booking.startDate).toLocaleString('ko-KR')}<br />
                <b>반납</b> {new Date(booking.endDate).toLocaleString('ko-KR')}
              </DateBox>
              <Meta>{booking.insuranceName} · 보증금 {booking.depositAmount.toLocaleString()} W-KRW</Meta>
              <Price>{booking.totalAmount.toLocaleString()} W-KRW</Price>
              {booking.status === 'pending' && <GhostButton style={{ marginTop: 12 }} onClick={() => handleCancel(booking.id)}>예약 취소</GhostButton>}
            </Body>
          </BookingCard>
        );
      })}
    </Screen>
  );
}
