import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { IconLogout } from './ui/Icon';

const Wrap = styled.div`position: relative; flex-shrink: 0;`;
const Avatar = styled.button`
  width: 32px; height: 32px; border: 0; border-radius: 50%; background: ${theme.colors.primaryLight};
  color: ${theme.colors.primaryDark}; font-size: 13px; font-weight: 800; cursor: pointer;
`;
const Menu = styled.div`
  position: absolute; top: calc(100% + 9px); right: 0; width: 220px; padding: 15px;
  border-radius: ${theme.radius.md}; background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.cardHover}; z-index: 50;
`;
const Name = styled.p`font-size: 14px; font-weight: 800; color: ${theme.colors.text}; margin: 0 0 3px;`;
const Email = styled.p`
  font-size: 11px; color: ${theme.colors.textSecondary}; margin: 0 0 13px;
  overflow: hidden; text-overflow: ellipsis;
`;
const Logout = styled.button`
  width: 100%; display: flex; align-items: center; gap: 7px; padding: 10px 0 0; border: 0;
  border-top: 1px solid ${theme.colors.border}; background: none; color: ${theme.colors.danger};
  font-family: ${theme.fonts.body}; font-size: 12px; font-weight: 700; cursor: pointer;
`;

export default function UserMenu({ auth }) {
  const [open, setOpen] = useState(false);
  const name = auth.profile?.display_name || auth.user?.email || 'BilliCar 사용자';
  const handleSignOut = async () => {
    setOpen(false);
    await auth.signOut();
  };

  return (
    <Wrap>
      <Avatar onClick={() => setOpen((value) => !value)} aria-label="내 계정">
        {name.slice(0, 1).toUpperCase()}
      </Avatar>
      {open && (
        <Menu onMouseLeave={() => setOpen(false)}>
          <Name>{name}</Name>
          <Email>{auth.user?.email}</Email>
          <Logout onClick={handleSignOut}><IconLogout size={14} /> 로그아웃</Logout>
        </Menu>
      )}
    </Wrap>
  );
}
