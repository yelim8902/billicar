import React, { useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { theme } from '../styles/theme';
import { useContract } from '../hooks/useContract';
import { createBooking, getHostWalletAddress } from '../services/bookingRepository';
import RentalEscrowData from '../contracts/RentalEscrow.json';
import InsuranceSelect, { PLANS } from './InsuranceSelect';
import {
  Screen, PageTitle, Card, SectionLabel, FormGroup, Label, Input,
  Divider, Button, StickyFooter, InlineError, Spinner,
} from './ui/Primitives';
import { IconMapPin, IconAlert } from './ui/Icon';

const VehicleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const VehiclePhoto = styled.img`
  width: 88px;
  height: 66px;
  object-fit: cover;
  border-radius: ${theme.radius.sm};
  flex-shrink: 0;
`;

const VehicleName = styled.p`font-size: 16px; font-weight: 700; color: ${theme.colors.text}; margin-bottom: 4px;`;
const VehicleMeta = styled.p`
  font-size: 12.5px;
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
`;

const PriceSummary = styled.div`
  background: ${theme.colors.surfaceMuted};
  border-radius: ${theme.radius.sm};
  padding: 14px 16px;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13.5px;
  margin-bottom: 8px;
  &:last-child { margin-bottom: 0; }
`;

const PriceLabel = styled.span`color: ${theme.colors.textSecondary};`;
const PriceValue = styled.span`
  color: ${p => (p.$highlight ? theme.colors.primaryDark : theme.colors.text)};
  font-weight: ${p => (p.$highlight ? 800 : 600)};
  font-size: ${p => (p.$highlight ? '17px' : '13.5px')};
`;

function localDateTimeMin() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export default function BookingForm({ userId, vehicle, wallet, walletProfile, addTxLog, onSuccess }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [insurance, setInsurance] = useState(PLANS[0]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const [error, setError] = useState('');
  const { getMockWKRW, getRentalEscrow } = useContract();

  if (!vehicle) {
    return (
      <Screen>
        <PageTitle>차량을 먼저 선택해주세요</PageTitle>
      </Screen>
    );
  }

  const hours = startDate && endDate
    ? Math.max(0, (new Date(endDate) - new Date(startDate)) / 3600000)
    : 0;
  const totalHours = Math.ceil(hours);
  const rentalFee = totalHours * vehicle.pricePerHour;
  const insuranceFee = insurance?.price || 0;
  const depositAmount = Number(vehicle.depositAmount || 0);
  const total = rentalFee + insuranceFee + depositAmount;

  const handleBook = async () => {
    if (!wallet.isConnected) { setError('MetaMask를 먼저 연결해주세요.'); return; }
    if (!wallet.isCorrectChain) { setError('Kaia Kairos 테스트넷으로 전환해주세요.'); return; }
    if (walletProfile.linkedWallet?.address?.toLowerCase() !== wallet.account?.toLowerCase()) { setError('현재 지갑을 로그인 계정에 연결해주세요.'); return; }
    if (!startDate || !endDate || hours <= 0) { setError('대여 시간을 올바르게 입력해주세요.'); return; }
    if (new Date(startDate) <= new Date()) { setError('대여 시작은 현재 시간 이후여야 해요.'); return; }

    setLoading(true);
    setError('');

    try {
      // 차주가 지갑을 아직 안 연결했거나 데모 차량(host 없음)이면 플랫폼 지갑으로 예치
      // (해커톤 MVP 간소화 — 원래는 차주 지갑 필수로 강제해야 함)
      const escrow = await getRentalEscrow(true);
      const hostAddress = (await getHostWalletAddress(vehicle.hostId)) || (await escrow.platformWallet());

      const bookingId = window.crypto.randomUUID();
      const bookingIdHash = ethers.id(bookingId);
      const rentalFeeUnits = ethers.parseUnits(String(rentalFee), 18);
      const insuranceFeeUnits = ethers.parseUnits(String(insuranceFee), 18);
      const depositUnits = ethers.parseUnits(String(depositAmount), 18);
      const totalUnits = rentalFeeUnits + insuranceFeeUnits + depositUnits;

      setStep('W-KRW 사용 승인 중…');
      const wkrw = await getMockWKRW(true);
      await (await wkrw.approve(RentalEscrowData.address, totalUnits)).wait();

      setStep('예치 트랜잭션 처리 중…');
      addTxLog({ type: '예약', message: '예치 트랜잭션 처리 중', status: 'pending' });
      const tx = await escrow.deposit(bookingIdHash, hostAddress, rentalFeeUnits, insuranceFeeUnits, depositUnits);
      await tx.wait();

      setStep('예약 저장 중…');
      const booking = await createBooking({ id: bookingId, userId, vehicle, startDate, endDate, insurance, txHash: tx.hash });
      addTxLog({ type: '예약', message: `${vehicle.name}을(를) ${totalHours}시간 예약했어요 (${insurance?.name} 적용)`, status: 'success' });
      onSuccess(booking);
    } catch (err) {
      const msg = err.shortMessage || err.reason || err.message || '예약 처리에 실패했습니다.';
      setError(msg);
      addTxLog({ type: '예약', message: `예약 중 문제가 생겼어요: ${msg}`, status: 'error' });
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  return (
    <Screen>
      <PageTitle>차량 예약</PageTitle>

      <Card>
        <SectionLabel>선택된 차량</SectionLabel>
        <VehicleInfo>
          <VehiclePhoto src={vehicle.image} alt={vehicle.name} />
          <div>
            <VehicleName>{vehicle.name}</VehicleName>
            <VehicleMeta><IconMapPin size={12} /> {vehicle.location}</VehicleMeta>
            <VehicleMeta>{vehicle.pricePerHour.toLocaleString()} W-KRW / 시간</VehicleMeta>
          </div>
        </VehicleInfo>
      </Card>

      <Card>
        <SectionLabel>대여 기간</SectionLabel>
        <FormGroup>
          <Label>대여 시작</Label>
          <Input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} min={localDateTimeMin()} />
        </FormGroup>
        <FormGroup>
          <Label>반납 시간</Label>
          <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
        </FormGroup>
      </Card>

      <Card>
        <SectionLabel>DAO 보험 선택</SectionLabel>
        <InsuranceSelect selected={insurance?.key} onChange={setInsurance} />
      </Card>

      <Card>
        <SectionLabel>결제 요약</SectionLabel>
        <PriceSummary>
          <PriceRow>
            <PriceLabel>대여 시간</PriceLabel>
            <PriceValue>{totalHours > 0 ? `${totalHours}시간` : '-'}</PriceValue>
          </PriceRow>
          <PriceRow>
            <PriceLabel>대여 요금</PriceLabel>
            <PriceValue>{rentalFee > 0 ? `${rentalFee.toLocaleString()} W-KRW` : '-'}</PriceValue>
          </PriceRow>
          <PriceRow>
            <PriceLabel>보험료 ({insurance?.name})</PriceLabel>
            <PriceValue>{insuranceFee > 0 ? `${insuranceFee.toLocaleString()} W-KRW` : '무료'}</PriceValue>
          </PriceRow>
          <PriceRow>
            <PriceLabel>보증금 (반납 후 환불)</PriceLabel>
            <PriceValue>{depositAmount.toLocaleString()} W-KRW</PriceValue>
          </PriceRow>
          <Divider />
          <PriceRow>
            <PriceLabel>총 결제 금액</PriceLabel>
            <PriceValue $highlight>{total > 0 ? `${total.toLocaleString()} W-KRW` : '-'}</PriceValue>
          </PriceRow>
        </PriceSummary>
      </Card>

      {error && <InlineError><IconAlert size={14} /> {error}</InlineError>}

      <StickyFooter>
        <Button onClick={handleBook} disabled={loading || total <= 0}>
          {loading ? <><Spinner /> {step || '예약 확인 중…'}</> : `${total > 0 ? total.toLocaleString() + ' W-KRW ' : ''}예약하기`}
        </Button>
      </StickyFooter>
    </Screen>
  );
}
