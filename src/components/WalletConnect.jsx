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

export default function WalletConnect({ wallet }) {
  const { account, balance, status, isConnected, connect, disconnect } = wallet;
  const [open, setOpen] = useState(false);

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
