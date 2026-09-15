import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
    error: null,
    isConfigured: true,
    isAuthenticated: false,
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
}));

jest.mock('./hooks/useLinkedWallet', () => ({
  useLinkedWallet: () => ({
    linkedWallet: null,
    loading: false,
    error: null,
    link: jest.fn(),
    unlink: jest.fn(),
  }),
}));

jest.mock('./components/VehicleMap', () => function MockVehicleMap() {
  return <div data-testid="vehicle-map" />;
});

test('renders the MobiTrust onboarding choices', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: 'Mobi Trust' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /차량 빌려타기/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /내 차 빌려주기/ })).toBeInTheDocument();
});

test('asks the selected user to sign in before entering the service', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /차량 빌려타기/ }));
  expect(screen.getByRole('heading', { name: '다시 만나서 반가워요' })).toBeInTheDocument();
  expect(screen.getByLabelText('이메일')).toBeInTheDocument();
  expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
});
