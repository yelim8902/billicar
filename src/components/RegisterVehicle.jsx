import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { createVehicle } from '../services/vehicleRepository';
import {
  Screen, PageTitle, PageSubtitle, Card, SectionLabel, FormGroup, Label, Input,
  Button, StickyFooter, InlineError, Spinner,
} from './ui/Primitives';
import { IconDocument, IconCheck, IconAlert, IconMapPin, IconCar } from './ui/Icon';

const FormRow = styled.div`
  display: grid; grid-template-columns: ${p => p.$cols || '1fr'}; gap: 12px;
`;
const Select = styled.select`
  width: 100%; padding: 13px 14px; background: ${theme.colors.surfaceMuted};
  border: 1.5px solid transparent; border-radius: ${theme.radius.sm};
  color: ${theme.colors.text}; font-family: ${theme.fonts.body}; font-size: 15px; outline: none;
  &:focus { border-color: ${theme.colors.primary}; background: ${theme.colors.surface}; }
`;
const ImageLabel = styled.label`
  position: relative; display: grid; place-items: center; width: 100%; min-height: 190px;
  border: 1.5px dashed ${theme.colors.borderStrong}; border-radius: ${theme.radius.md};
  background: ${theme.colors.surfaceMuted}; overflow: hidden; cursor: pointer; color: ${theme.colors.textSecondary};
  input { position: absolute; width: 1px; height: 1px; opacity: 0; }
`;
const Preview = styled.img`width: 100%; height: 210px; display: block; object-fit: cover;`;
const ImageEmpty = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 9px; font-size: 13px; font-weight: 700;
  small { color: ${theme.colors.textTertiary}; font-size: 11px; font-weight: 500; }
`;
const LocationButton = styled.button`
  display: inline-flex; align-items: center; gap: 6px; margin-top: 9px; padding: 9px 12px;
  border: 0; border-radius: 10px; background: ${theme.colors.primaryLight};
  color: ${theme.colors.primaryDark}; font-family: ${theme.fonts.body}; font-size: 12px; font-weight: 800; cursor: pointer;
`;
const Help = styled.p`font-size: 11px; line-height: 1.5; color: ${theme.colors.textTertiary}; margin-top: 7px;`;
const SuccessBox = styled.div`
  display: flex; align-items: flex-start; gap: 10px; padding: 16px; margin: 4px 0 12px;
  border-radius: ${theme.radius.sm}; background: ${theme.colors.primaryLight};
  color: ${theme.colors.primaryDark}; font-size: 13px; line-height: 1.6;
  svg { flex-shrink: 0; margin-top: 2px; }
`;

const initialForm = {
  vin: '', plateNumber: '', make: '', model: '', year: new Date().getFullYear(),
  pricePerHour: '', depositAmount: '100000', location: '', latitude: '', longitude: '',
  seats: 5, fuelType: 'electric',
};

export default function RegisterVehicle({ userId, wallet, walletProfile, addTxLog }) {
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('JPG, PNG, WEBP 사진만 등록할 수 있어요.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('사진 크기는 10MB 이하여야 해요.');
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('이 기기에서는 현재 위치를 사용할 수 없어요.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm(current => ({ ...current, latitude: coords.latitude.toFixed(6), longitude: coords.longitude.toFixed(6) }));
        setLocating(false);
      },
      () => {
        setError('위치 권한을 허용하거나 좌표를 직접 입력해주세요.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validate = () => {
    if (!wallet.isConnected) return 'MetaMask를 먼저 연결해주세요.';
    if (!wallet.isCorrectChain) return 'Kaia Kairos 테스트넷으로 전환해주세요.';
    if (walletProfile.linkedWallet?.address?.toLowerCase() !== wallet.account?.toLowerCase()) {
      return '상단 지갑 메뉴에서 현재 지갑을 로그인 계정에 연결해주세요.';
    }
    if (!form.vin || !form.plateNumber || !form.make || !form.model || !form.pricePerHour || !form.location) {
      return '차량과 대여 설정의 필수 항목을 모두 입력해주세요.';
    }
    if (!form.latitude || !form.longitude) return '현재 위치를 불러오거나 좌표를 입력해주세요.';
    if (!imageFile) return '실제 차량 대표 사진을 추가해주세요.';
    if (Number(form.pricePerHour) <= 0 || Number(form.depositAmount) < 0) return '요금 정보를 확인해주세요.';
    return '';
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      const vehicle = await createVehicle({
        userId,
        vehicle: form,
        imageFile,
      });
      setSuccess(vehicle);
      addTxLog({ type: '차량 등록', message: `${form.make} ${form.model}이 실제 차량 목록에 등록됐어요`, status: 'success' });
      setForm(initialForm);
      setImageFile(null);
      setImagePreview('');
    } catch (registerError) {
      const message = registerError.message || '차량 등록에 실패했습니다.';
      setError(message);
      addTxLog({ type: '차량 등록', message: `등록 중 문제가 생겼어요: ${message}`, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <PageTitle>내 차 빌려주기</PageTitle>
      <PageSubtitle>실제 차량 정보와 사진을 등록하면 주변 이용자에게 바로 보여요</PageSubtitle>
      <form onSubmit={handleRegister}>
        <Card>
          <SectionLabel>대표 사진 *</SectionLabel>
          <ImageLabel>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} />
            {imagePreview
              ? <Preview src={imagePreview} alt="등록할 차량 미리보기" />
              : <ImageEmpty><IconCar size={30} />차량 사진 추가<small>JPG, PNG, WEBP · 최대 10MB</small></ImageEmpty>}
          </ImageLabel>
        </Card>

        <Card>
          <SectionLabel>차량 정보</SectionLabel>
          <FormRow $cols="1fr 1fr" style={{ marginBottom: 12 }}>
            <FormGroup><Label>제조사 *</Label><Input placeholder="예: 현대" value={form.make} onChange={e => update('make', e.target.value)} required /></FormGroup>
            <FormGroup><Label>모델명 *</Label><Input placeholder="예: 아이오닉 5" value={form.model} onChange={e => update('model', e.target.value)} required /></FormGroup>
          </FormRow>
          <FormRow $cols="1fr 1fr" style={{ marginBottom: 12 }}>
            <FormGroup><Label>연식 *</Label><Input type="number" min="1990" max="2100" value={form.year} onChange={e => update('year', e.target.value)} required /></FormGroup>
            <FormGroup><Label>좌석 수 *</Label><Input type="number" min="2" max="15" value={form.seats} onChange={e => update('seats', e.target.value)} required /></FormGroup>
          </FormRow>
          <FormGroup>
            <Label>연료 종류 *</Label>
            <Select value={form.fuelType} onChange={e => update('fuelType', e.target.value)}>
              <option value="electric">전기</option><option value="hybrid">하이브리드</option>
              <option value="gasoline">가솔린</option><option value="diesel">디젤</option><option value="hydrogen">수소</option>
            </Select>
          </FormGroup>
          <FormGroup><Label>차량 번호 *</Label><Input placeholder="예: 12가 3456" value={form.plateNumber} onChange={e => update('plateNumber', e.target.value)} required /><Help>DB에는 일부가 가려진 번호만 저장해요.</Help></FormGroup>
          <FormGroup><Label>VIN(차대번호) *</Label><Input placeholder="17자리 차대번호" value={form.vin} onChange={e => update('vin', e.target.value.toUpperCase())} minLength={17} maxLength={17} required /><Help>원문은 저장하지 않고 SHA-256 해시만 저장해요.</Help></FormGroup>
        </Card>

        <Card>
          <SectionLabel>대여 설정</SectionLabel>
          <FormRow $cols="1fr 1fr">
            <FormGroup><Label>시간당 요금 *</Label><Input type="number" min="1" placeholder="15000" value={form.pricePerHour} onChange={e => update('pricePerHour', e.target.value)} required /></FormGroup>
            <FormGroup><Label>보증금 *</Label><Input type="number" min="0" value={form.depositAmount} onChange={e => update('depositAmount', e.target.value)} required /></FormGroup>
          </FormRow>
          <FormGroup><Label>차량 위치 *</Label><Input placeholder="예: 서울 강남구 역삼동" value={form.location} onChange={e => update('location', e.target.value)} required /></FormGroup>
          <LocationButton type="button" onClick={useCurrentLocation} disabled={locating}><IconMapPin size={15} />{locating ? '위치 확인 중…' : '현재 위치 불러오기'}</LocationButton>
          <FormRow $cols="1fr 1fr" style={{ marginTop: 12 }}>
            <FormGroup><Label>위도 *</Label><Input type="number" step="0.000001" min="-90" max="90" value={form.latitude} onChange={e => update('latitude', e.target.value)} required /></FormGroup>
            <FormGroup><Label>경도 *</Label><Input type="number" step="0.000001" min="-180" max="180" value={form.longitude} onChange={e => update('longitude', e.target.value)} required /></FormGroup>
          </FormRow>
          <Help>해커톤 데모에서는 등록 즉시 대여 가능 상태로 자동 승인됩니다.</Help>
        </Card>

        {success && <SuccessBox><IconCheck size={17} /><span><b>차량 등록 완료!</b><br />이용자 화면과 지도에서 ${success.make} ${success.model}을 확인할 수 있어요.</span></SuccessBox>}
        {error && <InlineError><IconAlert size={14} /> {error}</InlineError>}
        <StickyFooter>
          <Button type="submit" disabled={loading}>{loading ? <><Spinner /> 저장 중…</> : <><IconDocument size={18} /> 차량 등록하기</>}</Button>
        </StickyFooter>
      </form>
    </Screen>
  );
}
