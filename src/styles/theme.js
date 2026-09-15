// MobiTrust 디자인 토큰
// 토스/쏘카류 라이트 모바일 UI + 시그니처 그린을 기준으로 한 팔레트입니다.
export const theme = {
  colors: {
    // 배경
    bg: '#FFFFFF',        // 앱 바탕
    surface: '#FFFFFF',   // 카드/시트 표면
    surfaceMuted: '#F6F7F8', // 아이콘 타일 등 옅은 배경
    overlay: 'rgba(17, 20, 19, 0.45)',

    // 시그니처 그린 (로고 라임그린 계열)
    primary: '#18B66A',
    primaryDark: '#0E8D50',
    primaryLight: '#EAF8F1',
    accentLime: '#18B66A',

    // 보더
    border: '#EAEDF0',
    borderStrong: '#D9DEE3',

    // 텍스트
    text: '#171A19',
    textSecondary: '#6E7573',
    textTertiary: '#A2A8A6',
    onPrimary: '#FFFFFF',

    // 상태
    danger: '#F0424D',
    dangerLight: '#FDEAEB',
    warning: '#FF9F1C',
    warningLight: '#FFF4E2',
    success: '#1FC873',
    successLight: '#E4F9EC',
  },

  shadows: {
    card: '0 0 0 1px rgba(17,20,19,0.06)',
    cardHover: '0 6px 20px rgba(17,20,19,0.08)',
    nav: '0 -1px 0 rgba(17,20,19,0.08)',
    sheet: '0 -8px 24px rgba(17,20,19,0.12)',
    button: 'none',
  },

  fonts: {
    body: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  transitions: {
    fast: 'all 0.15s ease',
    normal: 'all 0.2s ease',
  },

  radius: {
    sm: '12px',
    md: '16px',
    lg: '20px',
    pill: '999px',
  },

  layout: {
    maxWidth: '480px',
    topBarHeight: '56px',
    bottomNavHeight: '64px',
    activityDockHeight: '45px',
    activityDockHeight: '46px', // 하단 "활동 내역" 접힌 독의 높이 (BottomNav 바로 위에 겹쳐 떠있음)
  },
};
