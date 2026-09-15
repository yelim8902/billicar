import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import WalletConnect from './WalletConnect';
import UserMenu from './UserMenu';
import { IconHome, IconCalendar, IconKey, IconDocument, IconCar, IconChart, IconAlert } from './ui/Icon';

const Backdrop = styled.div`
  min-height: 100vh;
  background: #F4F5F6;
  display: flex;
  justify-content: center;
`;

const Shell = styled.div`
  width: 100%;
  max-width: ${theme.layout.maxWidth};
  min-height: 100vh;
  background: ${theme.colors.bg};
  position: relative;
  display: flex;
  flex-direction: column;

  @media (min-width: 540px) {
    box-shadow: 0 0 0 1px ${theme.colors.border};
  }
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  height: ${theme.layout.topBarHeight};
  padding: 0 16px 0 20px;
  padding-top: env(safe-area-inset-top, 0px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${theme.colors.border};
`;

const LogoWordmark = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 17px;
  font-weight: 800;
  color: ${theme.colors.text};
  letter-spacing: -0.3px;
  cursor: pointer;
  flex-shrink: 0;

  span { color: ${theme.colors.primary}; }
`;

const RoleChip = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: none;
  border-radius: ${theme.radius.pill};
  background: ${theme.colors.surfaceMuted};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.body};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const Main = styled.main`
  flex: 1;
  padding-bottom: calc(${theme.layout.bottomNavHeight} + ${theme.layout.activityDockHeight} + 20px + env(safe-area-inset-bottom, 0px));
`;

const NetworkWarning = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${theme.colors.warningLight};
  color: #B4630B;
  padding: 12px 14px;
  border-radius: ${theme.radius.sm};
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.4;
  margin: 16px 20px 0;

  svg { flex-shrink: 0; }
`;

const BottomNav = styled.nav`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: ${theme.layout.maxWidth};
  height: calc(${theme.layout.bottomNavHeight} + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: ${theme.colors.surface};
  border-top: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.nav};
  display: flex;
  z-index: 30;
`;

const NavItem = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: none;
  background: transparent;
  color: ${p => (p.$active ? theme.colors.primary : theme.colors.textTertiary)};
  cursor: pointer;
`;

const NavLabel = styled.span`
  font-size: 11px;
  font-weight: ${p => (p.$active ? 700 : 500)};
`;

const NAV = {
  renter: [
    { key: 'home', label: '홈', Icon: IconHome },
    { key: 'book', label: '예약', Icon: IconCalendar },
    { key: 'active', label: '내 렌탈', Icon: IconKey },
  ],
  host: [
    { key: 'register', label: '차량 등록', Icon: IconDocument },
    { key: 'myVehicles', label: '내 차량', Icon: IconCar },
    { key: 'earnings', label: '수익', Icon: IconChart },
  ],
};

export default function Layout({ wallet, walletProfile, auth, currentPage, onNavigate, role, onSwitchRole, children }) {
  const navItems = NAV[role] || NAV.renter;

  return (
    <Backdrop>
      <Shell>
        <TopBar>
          <LogoWordmark onClick={() => onNavigate(navItems[0].key)}>
            Mobi<span>Trust</span>
          </LogoWordmark>
          <TopRight>
            <RoleChip onClick={onSwitchRole}>
              {role === 'renter' ? '이용자' : '호스트'} 전환
            </RoleChip>
            <WalletConnect wallet={wallet} walletProfile={walletProfile} />
            <UserMenu auth={auth} />
          </TopRight>
        </TopBar>

        {wallet.isConnected && !wallet.isCorrectChain && (
          <NetworkWarning>
            <IconAlert size={16} />
            Kaia Kairos 테스트넷(Chain ID 1001)으로 전환해주세요. 현재: {wallet.chainId}
          </NetworkWarning>
        )}

        <Main>{children}</Main>

        <BottomNav>
          {navItems.map(item => (
            <NavItem
              key={item.key}
              $active={currentPage === item.key}
              onClick={() => onNavigate(item.key)}
            >
              <item.Icon size={22} />
              <NavLabel $active={currentPage === item.key}>{item.label}</NavLabel>
            </NavItem>
          ))}
        </BottomNav>
      </Shell>
    </Backdrop>
  );
}
