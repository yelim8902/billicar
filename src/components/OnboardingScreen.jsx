import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { IconCar, IconShield, IconChevronRight } from './ui/Icon';

const Screen = styled.div`
  width:100%; max-width:${theme.layout.maxWidth}; min-height:100dvh; margin:0 auto;
  position:relative; overflow:hidden; background:#141816;
  box-shadow:0 0 0 1px rgba(17,20,19,.08);
`;
const Hero = styled.div`
  position:absolute; inset:0 0 300px;
  background-image:linear-gradient(180deg,rgba(8,12,10,.58) 0%,rgba(8,12,10,.04) 52%,rgba(8,12,10,.34) 100%),url('/images/onboarding-neighbors-v3.jpg');
  background-size:cover; background-position:center 57%;
`;
const Brand = styled.div`position:relative;z-index:2;padding:58px 24px 0;color:#fff;`;
const Logo = styled.h1`font-size:24px;letter-spacing:-.5px;margin:0 0 14px;font-weight:800;span{color:#45E28E}`;
const Headline = styled.h2`font-size:30px;line-height:1.28;letter-spacing:-1.2px;margin:0;font-weight:800;`;
const NeighborBadge = styled.div`display:inline-flex;align-items:center;gap:8px;margin-top:16px;padding:7px 11px;border-radius:999px;background:rgba(255,255,255,.16);backdrop-filter:blur(8px);font-size:12px;font-weight:700;color:#fff;`;
const NeighborDots = styled.span`display:flex;align-items:center;span{width:16px;height:16px;border-radius:50%;background:#45E28E;border:2px solid rgba(255,255,255,.8)}span+span{margin-left:-5px;background:#fff}`;
const Sheet = styled.div`
  position:absolute;z-index:3;left:0;right:0;bottom:0;background:#fff;
  border-radius:28px 28px 0 0;padding:26px 20px calc(24px + env(safe-area-inset-bottom,0px));
`;
const SheetTitle = styled.p`font-size:14px;color:${theme.colors.textSecondary};margin:0 0 15px;font-weight:600;`;
const Choice = styled.button`
  width:100%;border:0;border-radius:16px;background:${p=>p.$primary?theme.colors.primary:'#F3F5F4'};
  color:${p=>p.$primary?'#fff':theme.colors.text};padding:18px;display:flex;align-items:center;gap:14px;
  text-align:left;cursor:pointer;margin-bottom:10px;
  &:active{transform:scale(.99)}
`;
const IconBox = styled.div`width:42px;height:42px;border-radius:13px;background:${p=>p.$primary?'rgba(255,255,255,.18)':'#fff'};display:flex;align-items:center;justify-content:center;flex-shrink:0;`;
const Copy = styled.div`flex:1;h3{font-size:18px;margin:0 0 4px;letter-spacing:-.4px}p{font-size:12px;margin:0;color:${p=>p.$primary?'rgba(255,255,255,.76)':theme.colors.textSecondary}}`;
const Fine = styled.p`text-align:center;color:${theme.colors.textTertiary};font-size:11px;margin:16px 0 0;`;

export default function OnboardingScreen({ onSelect }) {
  return (
    <Screen>
      <Hero />
      <Brand>
        <Logo>Billi<span>Car</span></Logo>
        <Headline>이웃의 차가<br/>나의 이동이 되는 순간</Headline>
        <NeighborBadge><NeighborDots><span/><span/></NeighborDots>이웃 간 차량 공유</NeighborBadge>
      </Brand>
      <Sheet>
        <SheetTitle>어떤 방식으로 시작할까요?</SheetTitle>
        <Choice $primary onClick={()=>onSelect('renter')}>
          <IconBox $primary><IconCar size={23}/></IconBox>
          <Copy $primary><h3>차량 빌려타기</h3><p>가까운 차량을 찾고 바로 예약해요</p></Copy><IconChevronRight size={21}/>
        </Choice>
        <Choice onClick={()=>onSelect('host')}>
          <IconBox><IconShield size={23}/></IconBox>
          <Copy><h3>내 차 빌려주기</h3><p>쉬고 있는 내 차로 수익을 만들어요</p></Copy><IconChevronRight size={21}/>
        </Choice>
        <Fine>역할은 언제든 바꿀 수 있어요</Fine>
      </Sheet>
    </Screen>
  );
}
