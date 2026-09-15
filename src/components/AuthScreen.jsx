import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Button, FormGroup, Input, Label, InlineError, Spinner } from './ui/Primitives';
import { IconChevronLeft, IconShield } from './ui/Icon';

const Backdrop = styled.div`
  min-height: 100dvh; background: #f4f5f6; display: flex; justify-content: center;
`;
const Shell = styled.main`
  width: 100%; max-width: ${theme.layout.maxWidth}; min-height: 100dvh;
  padding: 24px 20px calc(32px + env(safe-area-inset-bottom, 0px)); background: ${theme.colors.bg};
`;
const BackButton = styled.button`
  width: 40px; height: 40px; margin: 0 0 30px -8px; border: 0; border-radius: 50%;
  background: transparent; color: ${theme.colors.text}; display: grid; place-items: center; cursor: pointer;
`;
const Brand = styled.p`color: ${theme.colors.primary}; font-size: 15px; font-weight: 800; margin-bottom: 12px;`;
const Title = styled.h1`
  color: ${theme.colors.text}; font-size: 30px; line-height: 1.3; letter-spacing: -1px; margin: 0 0 10px;
`;
const Description = styled.p`
  color: ${theme.colors.textSecondary}; font-size: 14px; line-height: 1.6; margin: 0 0 30px;
`;
const Tabs = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 4px; margin-bottom: 24px;
  border-radius: 14px; background: ${theme.colors.surfaceMuted};
`;
const Tab = styled.button`
  padding: 11px; border: 0; border-radius: 11px;
  background: ${({ $active }) => ($active ? theme.colors.surface : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? theme.shadows.card : 'none')};
  color: ${({ $active }) => ($active ? theme.colors.text : theme.colors.textSecondary)};
  font-family: ${theme.fonts.body}; font-size: 14px; font-weight: 700; cursor: pointer;
`;
const Notice = styled.div`
  display: flex; gap: 10px; padding: 14px; margin-top: 18px; border-radius: ${theme.radius.sm};
  background: ${theme.colors.primaryLight}; color: ${theme.colors.primaryDark};
  font-size: 12px; line-height: 1.55;
`;

export default function AuthScreen({ auth, onBack }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  const selectMode = (nextMode) => {
    setMode(nextMode);
    setFormError('');
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');
    setMessage('');
    try {
      if (mode === 'signup') {
        const data = await auth.signUp({ email, password, displayName });
        if (!data.session) {
          setMessage('가입 확인 메일을 보냈어요. 이메일 인증 후 로그인해주세요.');
          setMode('signin');
        }
      } else {
        await auth.signIn({ email, password });
      }
    } catch (error) {
      setFormError(error.message || '인증 중 문제가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Backdrop>
      <Shell>
        <BackButton type="button" onClick={onBack} aria-label="이전 화면"><IconChevronLeft size={25} /></BackButton>
        <Brand>BilliCar</Brand>
        <Title>{mode === 'signin' ? '다시 만나서 반가워요' : '이웃과 차량을 공유해요'}</Title>
        <Description>
          {mode === 'signin'
            ? '예약과 정산 내역을 안전하게 이어서 확인하세요.'
            : '계정을 만든 뒤 내 지갑과 차량을 연결할 수 있어요.'}
        </Description>
        <Tabs>
          <Tab type="button" $active={mode === 'signin'} onClick={() => selectMode('signin')}>로그인</Tab>
          <Tab type="button" $active={mode === 'signup'} onClick={() => selectMode('signup')}>회원가입</Tab>
        </Tabs>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <FormGroup>
              <Label htmlFor="display-name">이름 또는 닉네임</Label>
              <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="빌리" minLength={1} maxLength={40} required />
            </FormGroup>
          )}
          <FormGroup>
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@billicar.kr" autoComplete="email" required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상 입력해주세요" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={8} required />
          </FormGroup>
          {(formError || auth.error) && <InlineError>{formError || auth.error}</InlineError>}
          {message && <Notice><IconShield size={18} />{message}</Notice>}
          <Button type="submit" disabled={submitting} style={{ marginTop: 24 }}>
            {submitting ? <><Spinner /> 처리 중…</> : mode === 'signin' ? '로그인' : '계정 만들기'}
          </Button>
        </form>
      </Shell>
    </Backdrop>
  );
}
