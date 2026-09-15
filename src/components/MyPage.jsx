import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { useMyPageStats } from '../hooks/useMyPageStats';
import { shortenAddress } from '../utils/kaia';
import { Screen, PageTitle, PageSubtitle, Card, Button, GhostButton } from './ui/Primitives';
import { IconWallet, IconShield, IconChevronRight, IconLogout, IconCar, IconCalendar } from './ui/Icon';

const Profile = styled.div`display: flex; align-items: center; gap: 14px;`;
const Avatar = styled.div`
  width: 54px; height: 54px; border-radius: 18px; display: grid; place-items: center;
  background: ${theme.colors.primaryLight}; color: ${theme.colors.primaryDark}; font-size: 21px; font-weight: 800;
`;
const ProfileCopy = styled.div`
  min-width: 0; flex: 1;
  h2 { margin: 0 0 4px; color: ${theme.colors.text}; font-size: 18px; }
  p { margin: 0; color: ${theme.colors.textSecondary}; font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
`;
const Verify = styled.span`
  display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; padding: 5px 8px;
  border-radius: 8px; background: ${theme.colors.surfaceMuted}; color: ${theme.colors.textSecondary};
  font-size: 10px; font-weight: 700;
`;
const StatGrid = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0 20px;`;
const Stat = styled.div`
  padding: 17px 7px; border-radius: ${theme.radius.sm}; background: ${theme.colors.surfaceMuted}; text-align: center;
  b { display: block; margin-bottom: 5px; color: ${theme.colors.text}; font-size: 17px; }
  span { color: ${theme.colors.textSecondary}; font-size: 11px; }
`;
const Row = styled.div`
  display: flex; align-items: center; gap: 11px; padding: 14px 0;
  & + & { border-top: 1px solid ${theme.colors.border}; }
`;
const RowIcon = styled.div`
  width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center;
  background: ${theme.colors.primaryLight}; color: ${theme.colors.primaryDark};
`;
const RowCopy = styled.div`
  min-width: 0; flex: 1;
  b { display: block; margin-bottom: 3px; color: ${theme.colors.text}; font-size: 13px; }
  span { display: block; color: ${theme.colors.textSecondary}; font-size: 11px; overflow: hidden; text-overflow: ellipsis; }
`;
const DangerAction = styled(GhostButton)`color: ${theme.colors.danger}; margin-top: 10px;`;
const ErrorText = styled.p`margin-top: 8px; color: ${theme.colors.danger}; font-size: 11px;`;

const VERIFICATION_LABEL = {
  unverified: '본인 인증 전', pending: '본인 인증 확인 중', verified: '본인 인증 완료', rejected: '인증 재확인 필요',
};

export default function MyPage({ auth, wallet, walletProfile, onSwitchRole }) {
  const { stats, loading } = useMyPageStats(auth.user?.id);
  const [actionError, setActionError] = useState('');
  const name = auth.profile?.display_name || 'MobiTrust 사용자';
  const linkedAddress = walletProfile.linkedWallet?.address;

  const handleWalletAction = async () => {
    setActionError('');
    try {
      if (linkedAddress) await walletProfile.unlink();
      else if (!wallet.isConnected) await wallet.connect();
      else await walletProfile.link(wallet.account);
    } catch (error) {
      setActionError(error.message || '지갑 처리 중 문제가 발생했습니다.');
    }
  };

  return (
    <Screen>
      <PageTitle>마이페이지</PageTitle>
      <PageSubtitle>내 계정과 MobiTrust 이용 현황을 확인하세요</PageSubtitle>
      <Card>
        <Profile>
          <Avatar>{name.slice(0, 1).toUpperCase()}</Avatar>
          <ProfileCopy>
            <h2>{name}</h2>
            <p>{auth.user?.email}</p>
            <Verify><IconShield size={12} />{VERIFICATION_LABEL[auth.profile?.verification_status] || '본인 인증 전'}</Verify>
          </ProfileCopy>
        </Profile>
      </Card>

      <StatGrid>
        <Stat><b>{loading ? '–' : stats.bookings}</b><span>전체 예약</span></Stat>
        <Stat><b>{loading ? '–' : stats.vehicles}</b><span>등록 차량</span></Stat>
        <Stat><b>{loading ? '–' : stats.earnings.toLocaleString()}</b><span>정산 W-KRW</span></Stat>
      </StatGrid>

      <Card>
        <Row>
          <RowIcon><IconWallet size={19} /></RowIcon>
          <RowCopy><b>연결 지갑</b><span>{linkedAddress ? `Kaia Kairos · ${shortenAddress(linkedAddress)}` : '연결된 지갑이 없어요'}</span></RowCopy>
          <IconChevronRight size={18} />
        </Row>
        <Button type="button" onClick={handleWalletAction} disabled={walletProfile.loading}>
          {walletProfile.loading ? '처리 중…' : linkedAddress ? '지갑 연결 해제' : wallet.isConnected ? '현재 지갑 연결하기' : 'MetaMask 연결하기'}
        </Button>
        {actionError && <ErrorText>{actionError}</ErrorText>}
      </Card>

      <Card>
        <Row><RowIcon><IconCalendar size={19} /></RowIcon><RowCopy><b>예약 내역</b><span>다가오는 예약과 지난 이용 기록</span></RowCopy><IconChevronRight size={18} /></Row>
        <Row><RowIcon><IconCar size={19} /></RowIcon><RowCopy><b>내 차량 관리</b><span>등록 차량과 대여 상태 확인</span></RowCopy><IconChevronRight size={18} /></Row>
      </Card>

      <GhostButton type="button" onClick={onSwitchRole}>이용자·호스트 역할 다시 선택</GhostButton>
      <DangerAction type="button" onClick={auth.signOut}><IconLogout size={17} /> 로그아웃</DangerAction>
    </Screen>
  );
}
