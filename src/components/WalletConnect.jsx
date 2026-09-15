import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { shortenAddress } from '../utils/kaia';
import { IconWallet, IconLogout } from './ui/Icon';

const ConnectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: ${theme.colors.primary};
  color: ${theme.colors.onPrimary};
  border: none;
  border-radius: ${theme.radius.pill};
  font-family: ${theme.fonts.body};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  opacity: ${p => (p.disabled ? 0.6 : 1)};
`;

const Wrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const AccountChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: ${theme.colors.surfaceMuted};
  border: none;
  border-radius: ${theme.radius.pill};
  cursor: pointer;
`;

const Dot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  flex-shrink: 0;
`;

const Address = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${theme.colors.surface};
  border-radius: ${theme.radius.sm};
  box-shadow: ${theme.shadows.cardHover};
  padding: 12px 14px;
  min-width: 168px;
  z-index: 40;
`;

const MenuBalance = styled.p`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 10px;

  b { color: ${theme.colors.text}; font-weight: 700; }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 0 0;
  border: none;
  background: none;
  border-top: 1px solid ${theme.colors.border};
  color: ${theme.colors.danger};
  font-family: ${theme.fonts.body};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

const LinkStatus = styled.p`
  padding: 9px 0;
  border-top: 1px solid ${theme.colors.border};
  color: ${p => (p.$linked ? theme.colors.primaryDark : theme.colors.textSecondary)};
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
`;

const LinkButton = styled.button`
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: 10px;
  background: ${theme.colors.primaryLight};
  color: ${theme.colors.primaryDark};
  font-family: ${theme.fonts.body};
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
`;

const WalletError = styled.p`
  margin-top: 7px;
  color: ${theme.colors.danger};
  font-size: 10px;
  line-height: 1.4;
`;

export default function WalletConnect({ wallet, walletProfile }) {
  const { account, balance, status, isConnected, connect, disconnect } = wallet;
  const [open, setOpen] = useState(false);
  const linkedAddress = walletProfile.linkedWallet?.address;
  const isCurrentWalletLinked = linkedAddress?.toLowerCase() === account?.toLowerCase();

  const handleLink = async () => {
    try {
      await walletProfile.link(account);
    } catch {
      // Hook exposes the user-facing error below.
    }
  };

  if (isConnected) {
    return (
      <Wrap>
        <AccountChip onClick={() => setOpen(o => !o)}>
          <Dot />
          <Address>{shortenAddress(account)}</Address>
        </AccountChip>
        {open && (
          <Menu onMouseLeave={() => setOpen(false)}>
            <MenuBalance>잔액 <b>{balance ?? '-'} KAIA</b></MenuBalance>
            <LinkStatus $linked={isCurrentWalletLinked}>
              {isCurrentWalletLinked
                ? '이 계정에 연결된 지갑이에요'
                : linkedAddress
                  ? '다른 지갑이 계정에 연결되어 있어요'
                  : '로그인 계정에 지갑을 연결해주세요'}
            </LinkStatus>
            {!isCurrentWalletLinked && (
              <LinkButton onClick={handleLink} disabled={walletProfile.loading}>
                {walletProfile.loading ? '서명 확인 중…' : linkedAddress ? '현재 지갑으로 변경' : '이 지갑 연결하기'}
              </LinkButton>
            )}
            {walletProfile.error && <WalletError>{walletProfile.error}</WalletError>}
            <MenuButton onClick={() => { disconnect(); setOpen(false); }}>
              <IconLogout size={14} /> 연결 해제
            </MenuButton>
          </Menu>
        )}
      </Wrap>
    );
  }

  return (
    <ConnectButton onClick={connect} disabled={status === 'connecting'}>
      <IconWallet size={14} />
      {status === 'connecting' ? '연결 중…' : '지갑 연결'}
    </ConnectButton>
  );
}
