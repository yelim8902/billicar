import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';
import { IconChevronUp, IconChevronDown, IconCalendar, IconKey, IconDocument } from './ui/Icon';

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Dock = styled.div`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(${theme.layout.bottomNavHeight} + env(safe-area-inset-bottom, 0px));
  width: 100%;
  max-width: ${theme.layout.maxWidth};
  z-index: 25;
  pointer-events: none;
`;

const Panel = styled.div`
  pointer-events: auto;
  background: ${theme.colors.surface};
  border-radius: ${theme.radius.md} ${theme.radius.md} 0 0;
  box-shadow: ${theme.shadows.sheet};
  overflow: hidden;
`;

const Header = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 18px;
  border: none;
  background: none;
  cursor: pointer;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TitleText = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const Badge = styled.span`
  background: ${theme.colors.primaryLight};
  color: ${theme.colors.primaryDark};
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: ${theme.radius.pill};
`;

const LogList = styled.div`
  max-height: 46vh;
  overflow-y: auto;
  padding-bottom: 6px;
`;

const LogEntry = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  animation: ${slideIn} 0.25s ease;
`;

const IconCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${p =>
    p.$s === 'success' ? theme.colors.primaryLight :
    p.$s === 'error' ? theme.colors.dangerLight :
    theme.colors.warningLight};
  color: ${p =>
    p.$s === 'success' ? theme.colors.primaryDark :
    p.$s === 'error' ? theme.colors.danger :
    theme.colors.warning};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const LogBody = styled.div`flex: 1; min-width: 0;`;

const LogMessage = styled.p`
  font-size: 12.5px;
  font-weight: 600;
  color: ${theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
`;

const LogMeta = styled.p`
  font-size: 11px;
  color: ${theme.colors.textTertiary};
`;

const StatusText = styled.span`
  font-size: 11.5px;
  font-weight: 700;
  flex-shrink: 0;
  color: ${p =>
    p.$s === 'success' ? theme.colors.primaryDark :
    p.$s === 'error' ? theme.colors.danger : theme.colors.warning};
`;

const Empty = styled.div`
  padding: 24px 18px 20px;
  text-align: center;
  color: ${theme.colors.textTertiary};
  font-size: 13px;
`;

const TYPE_ICON = {
  '예약': IconCalendar,
  '정산': IconKey,
  'NFT 발행': IconDocument,
  '반납': IconKey,
};

const STATUS_LABEL = {
  success: '완료',
  error: '실패',
  pending: '처리 중',
};

export default function TransactionLog({ logs }) {
  const [open, setOpen] = useState(false);

  return (
    <Dock>
      <Panel>
        <Header onClick={() => setOpen(o => !o)}>
          <TitleArea>
            <TitleText>활동 내역</TitleText>
            {logs.length > 0 && <Badge>{logs.length}</Badge>}
          </TitleArea>
          {open ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
        </Header>

        {open && (
          <LogList>
            {logs.length === 0 ? (
              <Empty>아직 활동 내역이 없어요</Empty>
            ) : (
              logs.map(log => {
                const Ico = TYPE_ICON[log.type];
                return (
                  <LogEntry key={log.id}>
                    <IconCircle $s={log.status}>
                      {Ico ? <Ico size={15} /> : '·'}
                    </IconCircle>
                    <LogBody>
                      <LogMessage>{log.message}</LogMessage>
                      <LogMeta>{log.timestamp} · {log.type}</LogMeta>
                    </LogBody>
                    <StatusText $s={log.status}>{STATUS_LABEL[log.status]}</StatusText>
                  </LogEntry>
                );
              })
            )}
          </LogList>
        )}
      </Panel>
    </Dock>
  );
}
