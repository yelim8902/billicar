const mockUpload = jest.fn();
const mockInsertVehicle = jest.fn();
const mockInsertPhoto = jest.fn();

jest.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    storage: {
      from: () => ({
        upload: mockUpload,
        remove: jest.fn(),
        getPublicUrl: path => ({ data: { publicUrl: path } }),
      }),
    },
    from: table => {
      if (table === 'vehicles') {
        return {
          insert: payload => {
            mockInsertVehicle(payload);
            return { select: () => ({ single: async () => ({ data: { id: payload.id, make: payload.make, model: payload.model, status: payload.status }, error: null }) }) };
          },
        };
      }
      return { insert: mockInsertPhoto };
    },
  },
}));

const { createVehicle } = require('./vehicleRepository');

beforeEach(() => {
  jest.clearAllMocks();
  global.TextEncoder = class TextEncoder {
    encode(value) { return new Uint8Array([...value].map(char => char.charCodeAt(0))); }
  };
  mockUpload.mockResolvedValue({ error: null });
  mockInsertPhoto.mockResolvedValue({ error: null });
  Object.defineProperty(window, 'crypto', {
    configurable: true,
    value: {
      randomUUID: () => '11111111-1111-4111-8111-111111111111',
      subtle: { digest: async () => new Uint8Array([1, 2, 3]).buffer },
    },
  });
});

test('uploads a photo and stores only the VIN hash', async () => {
  const imageFile = new File(['car'], 'car.jpg', { type: 'image/jpeg' });
  await createVehicle({
    userId: '22222222-2222-4222-8222-222222222222',
    imageFile,
    vehicle: {
      vin: 'KMHE341HBPA000001', plateNumber: '12가 3456', make: '현대', model: '아이오닉 5',
      year: 2026, seats: 5, fuelType: 'electric', pricePerHour: 15000, depositAmount: 100000,
      location: '서울 강남구', latitude: 37.5, longitude: 127.03,
    },
  });

  expect(mockUpload).toHaveBeenCalledTimes(1);
  expect(mockInsertVehicle).toHaveBeenCalledWith(expect.objectContaining({
    vin_hash: '010203', plate_number_masked: '12**56', status: 'available',
  }));
  expect(mockInsertVehicle.mock.calls[0][0]).not.toHaveProperty('vin');
  expect(mockInsertPhoto).toHaveBeenCalledWith(expect.objectContaining({ is_primary: true }));
});
