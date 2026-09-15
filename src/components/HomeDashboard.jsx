import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Screen } from './ui/Primitives';
import { IconChevronRight, IconMapPin, IconWallet, IconCar } from './ui/Icon';

const Greeting = styled.p`font-size:14px; color:${theme.colors.textSecondary}; margin:8px 0 6px;`;
const Title = styled.h1`font-size:28px; line-height:1.28; letter-spacing:-1px; margin:0 0 24px; font-weight:800; color:${theme.colors.text};`;
const Balance = styled.button`
  width:100%; padding:20px; margin-bottom:24px; border:0; border-radius:18px;
  background:#151817; color:#fff; text-align:left; cursor:pointer;
`;
const BalanceTop = styled.div`display:flex; align-items:center; justify-content:space-between; margin-bottom:13px; color:#B8BFBC; font-size:13px;`;
const Amount = styled.p`font-size:27px; letter-spacing:-.6px; font-weight:800; margin:0 0 9px;`;
const CoinRow = styled.p`font-size:12px; color:#969D9A; margin:0;`;
const Grid = styled.div`display:grid;grid-template-columns:1.08fr .92fr;grid-template-rows:166px 166px;gap:12px;margin-bottom:38px;`;
const Action = styled.button`
  border:0;border-radius:20px;padding:21px 18px;text-align:left;cursor:pointer;overflow:hidden;position:relative;
  display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;
  background:#F5F6F7;color:${theme.colors.text};
  &:active { transform:scale(.985); }
`;
const Pickup = styled(Action)`grid-row:1 / 3;background:${theme.colors.primaryLight};padding:24px 21px;`;
const ActionTitle = styled.h2`font-size:${p => p.$large ? '25px' : '20px'}; line-height:1.22; letter-spacing:-.8px; margin:0 0 9px; font-weight:800; position:relative; z-index:2; word-break:keep-all;`;
const ActionText = styled.p`font-size:${p => p.$large ? '14.5px' : '14px'}; line-height:1.5; color:${theme.colors.textSecondary}; margin:0; position:relative; z-index:2; word-break:keep-all; span{color:${theme.colors.primaryDark};font-weight:800;}`;
const CarPhoto = styled.img`position:absolute;width:100%;height:56%;left:0;bottom:0;object-fit:cover;object-position:center 58%;border-radius:28px 28px 0 0;`;
const RoundIcon = styled.div`position:absolute;right:17px;bottom:17px;width:50px;height:50px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:#fff;color:${theme.colors.primaryDark};box-shadow:0 1px 0 rgba(17,20,19,.05);`;
const SectionTitle = styled.h2`font-size:21px; letter-spacing:-.5px; margin:0 0 14px;`;
const Notice = styled.button`width:100%; border:0; background:#F7F8F9; border-radius:16px; padding:17px; display:flex; align-items:center; gap:13px; text-align:left; cursor:pointer;`;
const NoticeIcon = styled.div`width:38px;height:38px;border-radius:12px;background:#fff;color:${theme.colors.primaryDark};display:flex;align-items:center;justify-content:center;`;
const NoticeBody = styled.div`flex:1; p:first-child{font-size:14px;font-weight:700;margin:0 0 3px} p:last-child{font-size:12px;color:${theme.colors.textSecondary};margin:0}`;

export default function HomeDashboard({ wallet, onNavigate }) {
  return (
    <Screen>
      <Greeting>안녕하세요</Greeting>
      <Title>오늘 필요한 차를<br />가장 편한 방법으로 이용하세요</Title>

      <Balance onClick={wallet.isConnected ? undefined : wallet.connect}>
        <BalanceTop><span><IconWallet size={15} /> &nbsp;내 지갑</span><IconChevronRight size={17} /></BalanceTop>
        <Amount>{wallet.isConnected ? '128,500' : '—'} <small style={{fontSize:15}}>W-KRW</small></Amount>
        <CoinRow>{wallet.isConnected ? `${wallet.balance ?? '0.0000'} KAIA · 결제 가능한 잔액` : '지갑을 연결해 잔액을 확인하세요'}</CoinRow>
      </Balance>

      <Grid>
        <Pickup onClick={() => onNavigate('pickup')}>
          <ActionTitle $large>직접 찾으러 가기</ActionTitle>
          <ActionText $large>내 주변 <span>4대</span>를<br />바로 이용할 수 있어요</ActionText>
          <CarPhoto src="/images/vehicles/taycan.jpg" alt="" />
        </Pickup>
        <Action onClick={() => onNavigate('delivery')}>
          <ActionTitle>내 위치로 부르기</ActionTitle>
          <ActionText>원하는 곳에서<br />차량을 받아요</ActionText>
          <RoundIcon><IconMapPin size={24} /></RoundIcon>
        </Action>
        <Action onClick={() => onNavigate('switchHost')}>
          <ActionTitle>내 차 빌려주기</ActionTitle>
          <ActionText>유휴 차량으로<br />수익을 만들어요</ActionText>
          <RoundIcon><IconCar size={24} /></RoundIcon>
        </Action>
      </Grid>

      <SectionTitle>이용 전 확인하세요</SectionTitle>
      <Notice><NoticeIcon><IconCar size={20}/></NoticeIcon><NoticeBody><p>처음 이용하시나요?</p><p>차량 확인부터 반납까지 1분 만에 알아보기</p></NoticeBody><IconChevronRight size={18}/></Notice>
    </Screen>
  );
}
