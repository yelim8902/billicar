import { render, screen } from '@testing-library/react';
import MyPage from './MyPage';

jest.mock('../hooks/useMyPageStats', () => ({
  useMyPageStats: () => ({ stats: { bookings: 3, vehicles: 2, earnings: 128500 }, loading: false }),
}));

test('shows the signed-in user and service stats', () => {
  render(
    <MyPage
      auth={{
        user: { id: 'user-1', email: 'billi@example.com' },
        profile: { display_name: '빌리', verification_status: 'verified' },
        signOut: jest.fn(),
      }}
      wallet={{ isConnected: false, account: null, connect: jest.fn() }}
      walletProfile={{ linkedWallet: null, loading: false, link: jest.fn(), unlink: jest.fn() }}
      onSwitchRole={jest.fn()}
    />
  );

  expect(screen.getByRole('heading', { name: '마이페이지' })).toBeInTheDocument();
  expect(screen.getByText('빌리')).toBeInTheDocument();
  expect(screen.getByText('128,500')).toBeInTheDocument();
  expect(screen.getByText('본인 인증 완료')).toBeInTheDocument();
});
