const mockBookingInsert = jest.fn();
const mockBookingResult = jest.fn();

jest.mock('../lib/supabase', () => ({
  supabase: {
    storage: { from: () => ({ getPublicUrl: path => ({ data: { publicUrl: path } }) }) },
    from: table => {
      if (table === 'insurance_plans') {
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'plan-1', fee: 10000 }, error: null }) }) }) };
      }
      return {
        insert: payload => {
          mockBookingInsert(payload);
          return { select: () => ({ single: mockBookingResult }) };
        },
      };
    },
  },
}));

const { createBooking } = require('./bookingRepository');

const input = {
  userId: '22222222-2222-4222-8222-222222222222',
  vehicle: { id: '00000000-0000-4000-8000-000000000001', pricePerHour: 15000, depositAmount: 100000 },
  startDate: '2026-09-20T10:00',
  endDate: '2026-09-20T13:00',
  insurance: { key: 'basic' },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockBookingResult.mockResolvedValue({ data: { id: 'booking-1', status: 'pending' }, error: null });
});

test('stores calculated rental, insurance and deposit amounts', async () => {
  await createBooking(input);
  expect(mockBookingInsert).toHaveBeenCalledWith(expect.objectContaining({
    rental_fee: 45000,
    insurance_fee: 10000,
    deposit_amount: 100000,
    status: 'pending',
  }));
});

test('returns a helpful message for overlapping reservations', async () => {
  mockBookingResult.mockResolvedValue({ data: null, error: { code: '23P01' } });
  await expect(createBooking(input)).rejects.toThrow('이미 예약이 있어요');
});

test('confirms the booking and records an escrowed payment when a tx hash is given', async () => {
  await createBooking({ ...input, id: 'booking-1', txHash: '0xabc' });
  expect(mockBookingInsert).toHaveBeenCalledWith(expect.objectContaining({
    id: 'booking-1',
    status: 'confirmed',
  }));
  expect(mockBookingInsert).toHaveBeenCalledWith(expect.objectContaining({
    booking_id: 'booking-1',
    kind: 'rental',
    status: 'escrowed',
    tx_hash: '0xabc',
    amount: 155000,
  }));
});
