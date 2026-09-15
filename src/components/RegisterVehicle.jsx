import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { useContract } from '../hooks/useContract';
import {
  Screen, PageTitle, PageSubtitle, Card, SectionLabel, FormGroup, Label, Input,
  Button, StickyFooter, InlineError, Spinner,
} from './ui/Primitives';
import { IconDocument, IconCheck, IconAlert } from './ui/Icon';

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${p => p.$cols || '1fr'};
  gap: 12px;
`;

const NFTPreviewCard = styled.div`
  background: ${theme.colors.surfaceMuted};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  padding: 26px 20px;
  text-align: center;
`;

const VehiclePlaceholder = styled.div`
  width: 100%; height: 128px; border-radius: ${theme.radius.sm};
  background: #E9ECEE; display:flex; align-items:center; justify-content:center;
  color:${theme.colors.textTertiary}; margin-bottom:16px; font-size:13px; font-weight:600;
`;

const NFTName = styled.p`
  font-size: 16px;
  font-weight: 800;
  color: ${theme.colors.text};
  margin-bottom: 4px;
`;

const NFTMeta = styled.p`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 2px;
`;

const NFTBadge = styled.span`
  display: inline-block;
  margin-top: 12px;
  padding: 5px 14px;
  background: ${theme.colors.primary};
  border-radius: ${theme.radius.pill};
  font-size: 11px;
  font-weight: 700;
  color: ${theme.colors.onPrimary};
  letter-spacing: 0.3px;
`;

const SuccessBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: ${theme.colors.primaryLight};
  border-radius: ${theme.radius.sm};
  padding: 16px;
  margin-top: 4px;
  margin-bottom: 12px;
  font-size: 13px;
  color: ${theme.colors.primaryDark};
  line-height: 1.6;

  svg { flex-shrink: 0; margin-top: 2px; }
`;

export default function RegisterVehicle({ wallet, addTxLog }) {
  const [form, setForm] = useState({
    vin: '', make: '', model: '',
    year: new Date().getFullYear(),
    pricePerHour: '', location: '', seats: 4,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  // eslint-disable-next-line no-unused-vars
  const { getVehicleNFT } = useContract();

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!wallet.isConnected) { setError('MetaMask를 먼저 연결해주세요.'); return; }
    if (!wallet.isCorrectChain) { setError('Kaia Kairos 테스트넷으로 전환해주세요.'); return; }
    if (!form.vin || !form.make || !form.model || !form.pricePerHour) {
      setError('필수 항목(제조사, 모델명, VIN, 요금)을 입력해주세요.'); return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      // TODO: VehicleNFT.json ABI 설정 후 아래 주석을 해제하세요
      // const contract = await getVehicleNFT(true);
      // const metadata = JSON.stringify({ vin: form.vin, make: form.make, model: form.model, year: form.year, seats: form.seats });
      // addTxLog({ type: 'NFT 발행', message: `${form.make} ${form.model} NFT 발행 요청`, status: 'pending' });
      // const tx = await contract.mint(wallet.account, metadata);
      // const receipt = await tx.wait();

      await new Promise(r => setTimeout(r, 1800));
      const mockTokenId = Math.floor(Math.random() * 9999) + 1;
      addTxLog({ type: 'NFT 발행', message: `${form.make} ${form.model}이(가) 블록체인에 등록됐어요 (Token #${mockTokenId})`, status: 'success' });
      setSuccess({ tokenId: mockTokenId });
    } catch (err) {
      const msg = err.reason || err.message || '트랜잭션 실패';
      setError(msg);
      addTxLog({ type: 'NFT 발행', message: `등록 중 문제가 생겼어요: ${msg}`, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <PageTitle>차량 등록 &amp; NFT 발행</PageTitle>
      <PageSubtitle>내 차량을 등록하면 블록체인 NFT로 이력이 영구 기록돼요</PageSubtitle>

      <Card>
        <SectionLabel>차량 정보</SectionLabel>
        <FormRow $cols="1fr 1fr" style={{ marginBottom: 12 }}>
          <FormGroup>
            <Label>제조사 *</Label>
            <Input placeholder="예: 현대" value={form.make} onChange={e => update('make', e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label>모델명 *</Label>
            <Input placeholder="예: 아이오닉 5" value={form.model} onChange={e => update('model', e.target.value)} />
          </FormGroup>
        </FormRow>
        <FormRow $cols="1fr 1fr" style={{ marginBottom: 12 }}>
          <FormGroup>
            <Label>연식 *</Label>
            <Input type="number" min="2000" max="2030" value={form.year} onChange={e => update('year', e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label>좌석 수</Label>
            <Input type="number" min="2" max="9" value={form.seats} onChange={e => update('seats', e.target.value)} />
          </FormGroup>
        </FormRow>
        <FormGroup>
          <Label>VIN (차대번호) *</Label>
          <Input placeholder="예: KMHE341HBPA000001" value={form.vin} onChange={e => update('vin', e.target.value.toUpperCase())} />
        </FormGroup>
      </Card>

      <Card>
        <SectionLabel>대여 설정</SectionLabel>
        <FormRow $cols="1fr 1fr">
          <FormGroup>
            <Label>시간당 요금 (W-KRW) *</Label>
            <Input type="number" placeholder="예: 15000" value={form.pricePerHour} onChange={e => update('pricePerHour', e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label>차량 위치</Label>
            <Input placeholder="예: 서울 강남구" value={form.location} onChange={e => update('location', e.target.value)} />
          </FormGroup>
        </FormRow>
      </Card>

      {(form.make || form.model) && (
        <Card>
          <SectionLabel>NFT 미리보기</SectionLabel>
          <NFTPreviewCard>
            <VehiclePlaceholder>차량 사진은 등록 단계에서 추가돼요</VehiclePlaceholder>
            <NFTName>{form.make || '?'} {form.model || '?'} {form.year}</NFTName>
            <NFTMeta>VIN: {form.vin || '미입력'}</NFTMeta>
            <NFTMeta>Kaia Kairos Testnet · Chain ID: 1001</NFTMeta>
            <NFTBadge>차량 인증 기록</NFTBadge>
          </NFTPreviewCard>
        </Card>
      )}

      {success && (
        <SuccessBox>
          <IconCheck size={16} />
          <span><b>차량 등록 완료!</b><br />Token #{success.tokenId} — Kaia Kairos 블록체인에 NFT가 발행됐어요.</span>
        </SuccessBox>
      )}
      {error && <InlineError><IconAlert size={14} /> {error}</InlineError>}

      <StickyFooter>
        <Button onClick={handleRegister} disabled={loading}>
          {loading ? <><Spinner /> 차량 등록 중…</> : <><IconDocument size={18} /> 차량 등록하기</>}
        </Button>
      </StickyFooter>
    </Screen>
  );
}
