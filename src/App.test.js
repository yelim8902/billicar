import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/VehicleMap', () => function MockVehicleMap() {
  return <div data-testid="vehicle-map" />;
});

test('renders the MobiTrust onboarding choices', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: 'Mobi Trust' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /차량 빌려타기/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /내 차 빌려주기/ })).toBeInTheDocument();
});
