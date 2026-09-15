import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { useMyVehicles } from '../hooks/useMyVehicles';
import { Screen, PageTitle, PageSubtitle, Card, Chip, EmptyState, GhostButton } from './ui/Primitives';
import { IconCar, IconMapPin } from './ui/Icon';

const VehicleCardBox = styled(Card)`padding: 0; overflow: hidden; display: flex; gap: 0;`;
const Photo = styled.img`width: 108px; height: auto; object-fit: cover; flex-shrink: 0;`;
const Body = styled.div`padding: 14px 16px; flex: 1; min-width: 0;`;
const Head = styled.div`display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;`;
const Name = styled.h3`font-size: 15.5px; color: ${theme.colors.text}; margin: 0;`;
const Meta = styled.p`display: flex; align-items: center; gap: 4px; color: ${theme.colors.textSecondary}; font-size: 12px; margin: 3px 0;`;
const Price = styled.p`font-size: 13px; font-weight: 700; color: ${theme.colors.text}; margin: 4px 0 0;`;
const ErrorText = styled.p`color: ${theme.colors.danger}; font-size: 12px; margin-bottom: 12px;`;

const STATUS_TONE = {
  available: 'primary', reserved: 'warning', rented: 'primary',
  maintenance: 'warning', inactive: 'danger', draft: undefined, pending_review: 'warning',
};

export default function MyVehicles({ userId, onRegister }) {
  const { vehicles, loading, error } = useMyVehicles(userId);

  return (
    <Screen>
      <PageTitle>내 차량 관리</PageTitle>
      <PageSubtitle>등록한 차량과 지금 상태를 확인하세요</PageSubtitle>
      {error && <ErrorText>{error}</ErrorText>}
      {loading ? <Meta>차량 목록을 불러오는 중이에요…</Meta> : vehicles.length === 0 ? (
        <EmptyState>
          <IconCar size={40} />
          <p>아직 등록한 차량이 없어요</p>
          <GhostButton style={{ marginTop: 16 }} onClick={onRegister}>차량 등록하러 가기</GhostButton>
        </EmptyState>
      ) : vehicles.map(vehicle => (
        <VehicleCardBox key={vehicle.id}>
          <Photo src={vehicle.image} alt={vehicle.name} />
          <Body>
            <Head><Name>{vehicle.name}</Name><Chip $tone={STATUS_TONE[vehicle.status]}>{vehicle.statusLabel}</Chip></Head>
            <Meta><IconMapPin size={12} />{vehicle.location}</Meta>
            <Price>{vehicle.pricePerHour.toLocaleString()} W-KRW / 시간</Price>
          </Body>
        </VehicleCardBox>
      ))}
    </Screen>
  );
}
