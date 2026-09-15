# MobiTrust

> 이웃의 유휴 차량을 빌리고 빌려주는, 스테이블코인 기반 P2P 카셰어링 서비스

MobiTrust는 생활권 안의 차량을 연결하고 대여료·보증금·차주 정산 과정을 스마트컨트랙트로 투명하게 처리하는 블록체인 융합 해커톤 프로젝트입니다. 자주 변경되거나 개인정보가 포함된 데이터는 Supabase에 저장하고, 신뢰가 필요한 결제와 증명만 Kaia에 기록합니다.

## 현재 구현 상태

### 구현 완료

- 모바일 중심 온보딩 및 사용자·호스트 화면
- 직접 찾으러 가기 / 내 위치로 부르기 / 내 차 빌려주기 UI
- OpenStreetMap 기반 실제 지도와 차량 마커
- MetaMask 연결 및 Kaia Kairos 테스트넷 자동 전환
- Supabase 프로젝트와 PostgreSQL 마이그레이션
- 차량, 예약, 운행, 결제, 정산, 지갑 데이터 모델
- 활성 예약 시간 중복 방지 DB 제약조건
- 테이블별 Row Level Security 정책
- 차량 이미지 Storage 버킷과 사용자별 업로드 정책
- Supabase 미설정 시 데모 차량으로 동작하는 fallback
- Supabase Auth 이메일 회원가입·로그인과 세션 복원
- 사용자 프로필 자동 생성 및 MetaMask 지갑 서명 연결

### 개발 예정

- 실제 차량 등록·조회·예약 흐름
- W-KRW 데모 토큰 및 대여 에스크로 스마트컨트랙트
- 정상 반납 시 보증금 환불과 차주·플랫폼 즉시 정산
- 대여 전후 차량 상태 자료의 해시 기록 및 검증
- 컨트랙트 이벤트와 Supabase 상태 동기화

> 현재 W-KRW와 예약·정산 트랜잭션은 데모 UI입니다. 실제 가치가 연동된 원화 스테이블코인이 아닙니다.

## 왜 블록체인을 사용하는가

모든 차량 데이터를 온체인에 저장하지 않습니다.

| 구분 | 저장 위치 | 예시 |
| --- | --- | --- |
| 서비스 데이터 | Supabase PostgreSQL | 사용자, 차량, 위치, 예약 시간, 이용 상태 |
| 파일 원본 | Supabase Storage | 차량 사진, 대여 전후 점검 사진 |
| 가치 이전 | Kaia 스마트컨트랙트 | 대여료·보증금 에스크로, 환불, 차주 정산 |
| 위변조 증명 | Kaia 스마트컨트랙트 | 차량 점검 자료 해시와 기록 시점 |

위치와 사진 원본을 온체인에 공개하지 않으면서도, 정산 과정과 차량 상태 자료가 사후에 바뀌지 않았음을 검증할 수 있도록 구성합니다.

## 핵심 데모 흐름

```text
호스트 차량 등록
→ 이용자가 지도에서 차량 선택
→ W-KRW로 대여료와 보증금 예치
→ 대여 전 차량 상태 자료의 해시 기록
→ 이용 및 반납
→ 반납 상태 확인
→ 보증금 환불
→ 차주 95% / 플랫폼 5% 즉시 분배
→ Kaiascan에서 거래 확인
```

## 기술 스택

- React 19, Create React App
- styled-components
- Leaflet, React Leaflet, OpenStreetMap
- Supabase Auth, PostgreSQL, Storage
- ethers.js v6
- Kaia Kairos Testnet (Chain ID 1001)
- MetaMask

## 로컬 실행

### 준비 사항

- Node.js 18 이상
- npm
- MetaMask 브라우저 확장 프로그램
- Supabase 프로젝트

### 설치

```bash
git clone https://github.com/yelim8902/mobitrust-frontend.git
cd mobitrust-frontend
npm install
```

`.env.example`을 참고해 `.env.local`을 만듭니다.

```env
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

브라우저 프론트엔드에는 `sb_publishable_...` 키만 사용합니다. `sb_secret_...` 또는 레거시 `service_role` 키를 저장하거나 커밋하면 안 됩니다.

### 실행 및 검증

```bash
npm start
npm test -- --runInBand
npm run build
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## Supabase 설정

이 저장소에는 Supabase CLI가 개발 의존성으로 포함되어 있습니다.

```bash
npx supabase login --agent no
npx supabase link --project-ref YOUR_PROJECT_REF --agent no
npx supabase db push --linked --agent no
```

마이그레이션 파일:

- `supabase/migrations/202609150001_initial_mobitrust_schema.sql`
- `supabase/migrations/202609150002_vehicle_image_storage.sql`

자세한 테이블 관계와 상태 전이는 [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md)를 참고하세요.

## 데이터 모델

```text
auth.users
  └─ profiles
      ├─ wallets
      ├─ vehicles
      │   ├─ vehicle_photos
      │   ├─ vehicle_availability
      │   └─ bookings
      └─ bookings
          ├─ rentals
          │   └─ trip_events
          ├─ payments
          └─ settlements
```

금액은 부동소수점 오차를 피하기 위해 `bigint` 최소 화폐 단위로 저장합니다. 예약의 활성 시간대가 겹치면 PostgreSQL exclusion constraint가 저장을 거부합니다.

## 주요 디렉터리

```text
src/
├── components/             # 모바일 화면과 공통 UI
├── data/seedVehicles.js    # Supabase 미연결 시 데모 차량
├── hooks/
│   ├── useVehicles.js      # 차량 조회 상태
│   └── useWallet.js        # MetaMask 및 Kairos 연결
├── lib/supabase.js         # Supabase 클라이언트
├── services/               # 데이터 접근 계층
├── styles/theme.js         # 디자인 토큰
└── utils/kaia.js           # Kaia 네트워크 유틸리티

supabase/
├── config.toml             # Supabase CLI 설정
└── migrations/             # DB 및 Storage 마이그레이션
```

## Kaia Kairos 네트워크

| 항목 | 값 |
| --- | --- |
| 네트워크 | Kaia Kairos Testnet |
| RPC URL | `https://public-en-kairos.node.kaia.io` |
| Chain ID | `1001` (`0x3E9`) |
| 통화 기호 | `KAIA` |
| 탐색기 | `https://kairos.kaiascan.io` |

앱에서 지갑 연결을 누르면 MetaMask에 Kairos 네트워크를 추가하거나 해당 네트워크로 전환합니다.

## 개발 순서

1. 차량 등록 및 실제 데이터 조회
2. 예약 생성과 중복 예약 처리
3. MockWKRW와 RentalEscrow 컨트랙트 개발
4. Kairos 배포 및 프론트 연동
5. 반납·환불·즉시 정산 구현
6. 차량 상태 자료 해시 검증
7. 배포, 모바일 QA, 발표 데모 제작

## 라이선스

MIT
