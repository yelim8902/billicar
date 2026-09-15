# BilliCar 데이터 모델

## 핵심 관계

```text
auth.users
  └─ profiles
      ├─ wallets
      ├─ vehicles (호스트)
      │   ├─ vehicle_photos
      │   ├─ vehicle_availability
      │   └─ bookings
      └─ bookings (이용자)
          ├─ rentals
          │   └─ trip_events
          ├─ payments
          └─ settlements
```

금액은 부동소수점 오차를 피하기 위해 모두 `bigint` 최소 화폐 단위로 저장합니다. 현재 W-KRW는 1원 단위를 사용합니다. VIN 원문은 저장하지 않고 `vin_hash`만 저장합니다.

## 주요 상태 전이

### 차량

```text
draft → pending_review → available → reserved → rented → available
                                  ↘ maintenance / inactive
```

### 예약

```text
pending → confirmed → active → completed
       ↘ rejected / cancelled / disputed
```

### 결제

```text
pending → escrowed → released
                  ↘ refunded / failed
```

활성 예약의 시간 범위가 겹치면 PostgreSQL exclusion constraint가 저장 자체를 거부합니다.

## Supabase 연결

1. Supabase 프로젝트를 생성합니다.
2. SQL Editor에서 `supabase/migrations/202609150001_initial_mobitrust_schema.sql`을 실행합니다.
3. Storage에 `vehicle-images` 버킷을 생성합니다.
4. `.env.example`을 참고해 `.env.local`에 URL과 publishable key를 입력합니다.
5. 개발 서버를 다시 시작합니다.

```env
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

프런트엔드에는 publishable key만 사용합니다. `service_role` 또는 secret key는 절대 넣지 않습니다. 환경 변수가 없으면 `seedVehicles.js`의 데모 데이터로 자동 전환됩니다.

## 다음 연결 순서

1. 차량 검색에 현재 위치 기반 거리 계산 추가
2. 결제 트랜잭션 확인 후 `payments` 상태 갱신
3. 운행 종료 후 `rentals`, `settlements` 생성

로그인 사용자는 MetaMask 메시지 서명 후 기본 지갑을 연결할 수 있습니다. 현재 브라우저에서 서명을 검증하는 MVP 단계이며, 결제 기능을 연결하기 전 Edge Function에서 nonce와 서명을 재검증하도록 강화합니다.

결제 확정과 정산 상태 변경은 클라이언트가 직접 수행하지 않고 Edge Function 또는 신뢰할 수 있는 백엔드에서 처리해야 합니다.
