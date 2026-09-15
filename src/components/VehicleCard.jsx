import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Button } from './ui/Primitives';
import { IconMapPin } from './ui/Icon';

const Card = styled.article`
  ${p => p.$compact && 'display:grid; grid-template-columns:112px 1fr;'}
  background: ${theme.colors.surface};
  border-radius: ${theme.radius.md};
  overflow: hidden;
  margin-bottom: 22px;
  box-shadow: ${theme.shadows.card};
  cursor: ${p => (p.$available ? 'pointer' : 'default')};
  transition: ${theme.transitions.fast};
  opacity: ${p => (p.$available ? 1 : 0.6)};

  &:active { transform: ${p => (p.$available ? 'scale(0.985)' : 'none')}; }
`;

const PhotoWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${theme.colors.surfaceMuted};
  ${p => p.$compact && 'height:100%; min-height:150px; aspect-ratio:auto;'}
`;

const Photo = styled.img`width: 100%; height: 100%; object-fit: cover; display: block;`;

const Status = styled.span`
  position: absolute; top: 12px; left: 12px;
  padding: 6px 10px; border-radius: ${theme.radius.pill};
  background: ${p => p.$available ? '#fff' : 'rgba(23,26,25,.76)'};
  color: ${p => p.$available ? theme.colors.primaryDark : '#fff'};
  font-size: 11px; font-weight: 700;
`;

const Body = styled.div`
  padding: 15px 16px 16px;
  ${p => p.$compact && 'padding:14px;'}
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
`;

const Name = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const Location = styled.p`
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 12px;
`;

const BottomRow = styled.div`
  padding-top: 13px;
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Price = styled.p`
  font-size: 17px;
  font-weight: 800;
  color: ${theme.colors.text};

  span { font-size: 11.5px; font-weight: 500; color: ${theme.colors.textSecondary}; margin-left: 3px; }
`;

const MiniButton = styled(Button)`
  width: auto;
  padding: 8px 16px;
  font-size: 13px;
`;

const Tags = styled.div`display:flex; gap:6px; margin-bottom:13px;`;
const Tag = styled.span`font-size:11px; color:${theme.colors.textSecondary}; background:${theme.colors.surfaceMuted}; padding:4px 8px; border-radius:6px;`;

export default function VehicleCard({ vehicle, onSelect, compact = false }) {
  const available = vehicle.status === 'available';

  return (
    <Card $available={available} $compact={compact} onClick={() => available && onSelect(vehicle)}>
      <PhotoWrap $compact={compact}>
        <Photo src={vehicle.image} alt={vehicle.name} />
        <Status $available={available}>{available ? '바로 이용 가능' : '이용 중'}</Status>
      </PhotoWrap>
      <Body $compact={compact}>
        <TopRow>
          <Name>{vehicle.name}</Name>
        </TopRow>
        <Location><IconMapPin size={13} /> {vehicle.location} · {vehicle.distance}</Location>
        <Tags>{vehicle.tags?.map(tag => <Tag key={tag}>{tag}</Tag>)}</Tags>
        <BottomRow>
          <Price>{vehicle.pricePerHour.toLocaleString()}<span>W-KRW/시간</span></Price>
          {available && <MiniButton onClick={e => { e.stopPropagation(); onSelect(vehicle); }}>예약하기</MiniButton>}
        </BottomRow>
      </Body>
    </Card>
  );
}
