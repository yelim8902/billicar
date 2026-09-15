import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

// ── 공통 UI 프리미티브 (토스형 라이트 모바일 톤) ─────────────────────

export const Screen = styled.div`
  padding: 20px 20px 12px;
`;

export const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 800;
  color: ${theme.colors.text};
  letter-spacing: -0.3px;
  margin-bottom: 4px;
`;

export const PageSubtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 20px;
  line-height: 1.5;
`;

export const SectionLabel = styled.h3`
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 12px;
`;

export const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radius.md};
  padding: 18px;
  margin-bottom: 12px;
  box-shadow: ${theme.shadows.card};
`;

export const Divider = styled.div`
  height: 1px;
  background: ${theme.colors.border};
  margin: 12px 0;
`;

const buttonBase = `
  width: 100%;
  border: none;
  border-radius: ${theme.radius.pill};
  font-family: ${theme.fonts.body};
  font-size: 16px;
  font-weight: 700;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: ${theme.transitions.fast};
`;

export const Button = styled.button`
  ${buttonBase}
  background: ${p => (p.disabled ? theme.colors.border : theme.colors.primary)};
  color: ${p => (p.disabled ? theme.colors.textTertiary : theme.colors.onPrimary)};
  box-shadow: ${p => (p.disabled ? 'none' : theme.shadows.button)};
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};

  &:active:not(:disabled) { transform: scale(0.98); background: ${theme.colors.primaryDark}; }
`;

export const GhostButton = styled.button`
  ${buttonBase}
  background: ${theme.colors.surfaceMuted};
  color: ${theme.colors.text};

  &:active { transform: scale(0.98); }
`;

export const DangerButton = styled.button`
  ${buttonBase}
  background: ${p => (p.disabled ? theme.colors.border : theme.colors.dangerLight)};
  color: ${p => (p.disabled ? theme.colors.textTertiary : theme.colors.danger)};

  &:active:not(:disabled) { transform: scale(0.98); }
`;

export const SmallButton = styled.button`
  border: none;
  border-radius: ${theme.radius.pill};
  padding: 8px 16px;
  font-family: ${theme.fonts.body};
  font-size: 13px;
  font-weight: 700;
  background: ${p => (p.$active ? theme.colors.primary : theme.colors.surfaceMuted)};
  color: ${p => (p.$active ? theme.colors.onPrimary : theme.colors.textSecondary)};
  cursor: pointer;
  transition: ${theme.transitions.fast};
  white-space: nowrap;
`;

export const StickyFooter = styled.div`
  position: sticky;
  bottom: calc(${theme.layout.bottomNavHeight} + ${theme.layout.activityDockHeight} + 10px + env(safe-area-inset-bottom, 0px));
  left: 0; right: 0;
  padding: 14px 20px 4px;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, ${theme.colors.bg} 34%);
  margin: 0 -20px;
`;

export const FormGroup = styled.div`
  margin-bottom: 14px;
  &:last-child { margin-bottom: 0; }
`;

export const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  margin-bottom: 6px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 13px 14px;
  background: ${theme.colors.surfaceMuted};
  border: 1.5px solid transparent;
  border-radius: ${theme.radius.sm};
  color: ${theme.colors.text};
  font-family: ${theme.fonts.body};
  font-size: 15px;
  outline: none;
  transition: ${theme.transitions.fast};

  &::placeholder { color: ${theme.colors.textTertiary}; }
  &:focus { border-color: ${theme.colors.primary}; background: ${theme.colors.surface}; }
`;

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: ${theme.radius.pill};
  font-size: 11px;
  font-weight: 700;
  background: ${p => p.$tone === 'primary' ? theme.colors.primaryLight
    : p.$tone === 'danger' ? theme.colors.dangerLight
    : p.$tone === 'warning' ? theme.colors.warningLight
    : theme.colors.surfaceMuted};
  color: ${p => p.$tone === 'primary' ? theme.colors.primaryDark
    : p.$tone === 'danger' ? theme.colors.danger
    : p.$tone === 'warning' ? theme.colors.warning
    : theme.colors.textSecondary};
`;

export const IconTile = styled.div`
  width: ${p => p.size || 44}px;
  height: ${p => p.size || 44}px;
  border-radius: ${theme.radius.sm};
  background: ${p => p.$tone === 'primary' ? theme.colors.primaryLight : theme.colors.surfaceMuted};
  color: ${p => p.$tone === 'primary' ? theme.colors.primaryDark : theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 72px 20px;
  color: ${theme.colors.textTertiary};

  svg { margin-bottom: 14px; color: ${theme.colors.borderStrong}; }
`;

export const InlineError = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${theme.colors.danger};
  font-size: 13px;
  font-weight: 600;
  margin-top: 10px;
`;

const spin = keyframes`to { transform: rotate(360deg); }`;

export const Spinner = styled.div`
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

export const SpinnerDark = styled(Spinner)`
  border: 2.5px solid ${theme.colors.borderStrong};
  border-top-color: ${theme.colors.textSecondary};
`;
