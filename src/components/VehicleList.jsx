import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import VehicleCard from './VehicleCard';
import { useVehicles } from '../hooks/useVehicles';
import { Screen, PageTitle, PageSubtitle, SmallButton, EmptyState } from './ui/Primitives';
import { IconSearch, IconCar, IconChevronLeft, IconClock } from './ui/Icon';

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${theme.colors.surface};
  border-radius: 12px;
  padding: 13px 15px;
  margin-bottom: 14px;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textTertiary};
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: none;
  font-family: ${theme.fonts.body};
  font-size: 14px;
  color: ${theme.colors.text};

  &::placeholder { color: ${theme.colors.textTertiary}; }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 22px;
  overflow-x: auto;
`;

const BackTitle = styled.div`display:flex;align-items:center;gap:10px;margin:2px 0 18px; button{border:0;background:none;padding:4px;color:${theme.colors.text};} h1{font-size:24px;margin:0;letter-spacing:-.6px;}`;
const TimeCard = styled.div`display:flex;align-items:center;gap:11px;background:#F5F6F7;border-radius:15px;padding:17px;margin-bottom:14px; div{flex:1} b{font-size:15px} p{font-size:13px;margin:5px 0 0;color:${theme.colors.textSecondary}} button{border:0;background:none;color:${theme.colors.primaryDark};font-size:14px;font-weight:700}`;
const Map = styled.div`height:260px;margin:0 -20px;border-top:1px solid ${theme.colors.border};border-bottom:1px solid ${theme.colors.border};overflow:hidden;position:relative;`;
const MapImage = styled.img`width:100%;height:100%;object-fit:cover;display:block;`;
const MapBadge = styled.span`position:absolute;left:12px;bottom:12px;background:rgba(20,20,20,.72);color:#fff;font-size:11px;font-weight:600;padding:5px 10px;border-radius:999px;`;
const ResultHead = styled.div`display:flex;justify-content:space-between;align-items:end;margin:22px 0 14px;h2{font-size:21px;margin:0}span{font-size:13px;color:${theme.colors.textSecondary}}`;

export default function VehicleList({ onSelect, mode = 'default', onBack }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { vehicles, loading, error } = useVehicles();

  const filtered = vehicles
    .filter(v => filter === 'all' || v.status === filter)
    .filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.location.includes(search));

  const availableCount = vehicles.filter(v => v.status === 'available').length;

  return (
    <Screen>
      {mode === 'default' ? <><PageTitle>가까운 차량</PageTitle><PageSubtitle>내 주변에서 바로 이용 가능한 차량 {availableCount}대</PageSubtitle></> : <BackTitle><button onClick={onBack}><IconChevronLeft size={25}/></button><h1>{mode === 'pickup' ? '가서 타기' : '불러서 타기'}</h1></BackTitle>}

      {mode !== 'default' && <TimeCard><IconClock size={20}/><div><b>6시간 이용</b><p>오늘 11:30 – 오늘 17:30</p></div><button>변경</button></TimeCard>}

      <SearchBar>
        <IconSearch size={16} />
        <SearchInput
          placeholder="차량명 또는 지역 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </SearchBar>

      <FilterRow>
        {[
          { key: 'all',       label: '전체' },
          { key: 'available', label: '대여 가능' },
          { key: 'rented',    label: '대여 중' },
        ].map(f => (
          <SmallButton key={f.key} $active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </SmallButton>
        ))}
      </FilterRow>

      {mode === 'pickup' && <><Map><MapImage src="/images/map/seoul-gangnam.jpg" alt="서울 강남 일대 지도" /><MapBadge>서울 강남 일대</MapBadge></Map><ResultHead><h2>지도 주변 차량</h2><span>{filtered.length}대</span></ResultHead></>}
      {mode === 'delivery' && <ResultHead><h2>부를 수 있는 차량</h2><span>{filtered.length}대</span></ResultHead>}

      {loading && <p style={{fontSize:13,color:theme.colors.textSecondary}}>차량 정보를 불러오는 중이에요…</p>}
      {error && <p style={{fontSize:12,color:theme.colors.warning}}>DB 연결 오류로 데모 차량을 표시하고 있어요.</p>}

      {!loading && filtered.length === 0 ? (
        <EmptyState>
          <IconCar size={40} />
          <p>검색 결과가 없어요</p>
        </EmptyState>
      ) : (
        filtered.map(v => <VehicleCard key={v.id} vehicle={v} onSelect={onSelect} compact={mode === 'pickup'} />)
      )}
    </Screen>
  );
}
