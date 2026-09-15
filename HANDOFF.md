# 작업 인수인계 문서 (Codex ↔ Claude)

> 이 파일은 AI 세션(코덱스/클로드)을 번갈아 쓸 때 컨텍스트를 이어받기 위한 문서예요.
> **작업을 마칠 때마다 "최근 세션 로그"에 한 줄이라도 남기고, "지금 해야 할 일"을 최신 상태로 갱신해주세요.**
> 코드 구조 자체(파일 위치, 함수명 등)는 여기 적지 않습니다 — 그건 코드/README/DATA_MODEL.md를 보면 되니까요.
> 여기 적는 건 "코드만 봐서는 알기 어려운 것" — 지금까지의 결정, 다음에 할 일, 막힌 부분입니다.

---

## 지금 해야 할 일 (다음 세션이 이어받을 것)

### 🟠 버그: "내 렌탈"(Active Rental) 탭이 항상 빈 화면만 나옴

이번 예약 기능 변경([src/App.js](src/App.js))에서 `handleBookingSuccess`가 더 이상 `setActiveRental(...)`을 호출하지 않도록 바뀌었는데, 앱 전체에서 `setActiveRental`을 **실제 렌탈 데이터로 채우는 곳이 한 군데도 안 남음** (null로 리셋하는 두 곳만 있음). 그래서 하단 탭 "내 렌탈"을 누르면 [ActiveRental.jsx](src/components/ActiveRental.jsx)가 항상 `rental={null}` → 빈 상태(EmptyState)만 보여줌. 크래시는 안 나지만 기능이 죽어있는 상태.

- 원인: 예약이 Supabase 기반으로 바뀌면서 "확정/이용중" 예약을 `ActiveRental`에 연결하는 로직이 빠짐
- 고치는 방향(둘 중 택1, 컨트랙트 작업과 같이 정리하면 좋을 듯):
  1. `useBookings`에서 `status: 'active'`(또는 `confirmed`)인 예약을 찾아 `ActiveRental`에 넘겨주기
  2. 아니면 `MyBookings` 카드에서 "이용 시작" 액션을 만들어 그 예약을 `activeRental`로 세팅
- 온체인 트립 시작/종료(`rentals.started_at/ended_at`, `trip_events`)와도 맞물리는 부분이라 스마트컨트랙트 연동할 때 같이 설계하는 게 나아 보임

### ✅ 스마트컨트랙트 배포 완료 (2026-09-15) — 다음은 프론트 연동

**결정한 것:** 이름 불일치는 VehicleNFT는 그대로 두고, 결제/에스크로 계약을 `RentalEscrow`로 확정. DB의 `vehicles.nft_*` 컬럼이 남아있어서 차량 NFT 개념은 별개로 유지.

**배포된 주소 (Kaia Kairos Testnet, chain id 1001):**
- `MockWKRW`: `0x9849d85AC4b015269580F2d0ed296aCB8F8A0458`
- `RentalEscrow`: `0x77ACb25486015d756AE2d8ecfC8D8E4562e05074` (owner/platformWallet = 배포한 팀원 지갑 `0xCBB495f5...Bd2c144`, platformFeeBps = 1000 = 10%)
- RPC로 값 읽어서 배포 상태 직접 검증 완료 (paymentToken이 MockWKRW 주소와 일치, decimals 18, totalSupply 10억 W-KRW 등)
- `src/contracts/MockWKRW.json`, `RentalEscrow.json`에 실제 address+ABI 반영 완료 → **`useContract().getRentalEscrow()`/`getMockWKRW()`로 바로 컨트랙트 인스턴스 만들 수 있는 상태**

**한 것 (코드/문서):**
- [contracts/MockWKRW.sol](contracts/MockWKRW.sol) — 데모용 ERC-20 (OpenZeppelin 기반, `faucet()`으로 테스트 토큰 발급 가능)
- [contracts/RentalEscrow.sol](contracts/RentalEscrow.sol) — `deposit`(예치) / `release`(정상 반납 정산) / `refund`(취소 환불) 세 함수로 `payments`/`settlements` 흐름을 구현. bookingId는 UUID라 온체인에 못 쓰니 `ethers.id(bookingId)`로 bytes32 변환해서 키로 씀
- [contracts/README.md](contracts/README.md) — Remix 배포 단계별 가이드
- `src/contracts/CarSharing.json` → `RentalEscrow.json`으로 이름 정리, `MockWKRW.json` 추가, [useContract.js](src/hooks/useContract.js)를 `getRentalEscrow`/`getMockWKRW`/`getVehicleNFT`로 갱신
- `BookingForm.jsx`, `ActiveRental.jsx`에 실제 호출 코드를 주석(TODO)으로 미리 적어둠 — **아직 주석 처리된 상태** (아래 "프론트 연동 시 막힐 수 있는 점" 먼저 해결해야 안전하게 켤 수 있음)

**다음 세션이 할 일:**
1. `BookingForm.jsx`의 TODO 주석 풀고 실제 연동 (아래 "프론트 연동 시 막힐 수 있는 점" 먼저 해결)
2. `ActiveRental.jsx`의 TODO 주석 풀고 `release`/`refund` 연동
3. 데모/테스트용으로 렌터·차주 역할 지갑에 MockWKRW의 `faucet()` 호출해서 테스트 토큰 미리 넣어두기

### 프론트 연동 시 막힐 수 있는 점 (미리 파악해둔 것)

- **차주(host) 지갑 주소를 아직 못 가져옴**: `deposit(bookingId, host, ...)` 호출하려면 차량 등록자(host)의 지갑 주소가 필요한데, 지금 `vehicleRepository.toVehicle()`이 반환하는 차량 객체엔 `host_id`만 있고 지갑 주소가 없음. `wallets` 테이블에서 `host_id`의 `is_primary` 지갑을 조인해서 가져오는 코드를 추가해야 함 (`useLinkedWallet.js`의 쿼리 패턴 참고하면 됨). 데모 차량(`is_demo=true`)은 `host_id`가 null이라 별도 처리(플랫폼 지갑으로 대체 등) 필요.
- **`payments` 테이블에 아직 아무것도 안 씀**: `bookingRepository.createBooking()`은 `bookings`만 insert하고 `payments` row를 만들지 않음. 온체인 예치 성공 후 `payments` insert(`tx_hash` 포함)를 추가해야 데이터 모델과 앞뒤가 맞음.
- **`release`/`refund`가 `onlyOwner`(배포 지갑)만 호출 가능**: 지금 설계로는 렌터/차주가 직접 호출 못 함. 데모에서는 배포자 지갑으로 운영자가 직접 눌러주면 되지만, 누가 언제 반납 확인을 트리거할지(자동/수동)는 아직 미정 — 위 "내 렌탈 탭 버그" 고칠 때 같이 정하면 좋음.
- **`booking_status`가 `pending`에서 더 못 감**: `bookings` 테이블 RLS 정책이 렌터가 `status = 'pending'`인 자기 예약만 업데이트하게 해놔서, confirmed/active/completed로 넘어가는 경로 자체가 아직 없음 (호스트가 승인하는 정책도 없음). 온체인 정산을 붙이기 전에 이 상태 전이를 누가 어떻게 시키는지부터 설계해야 함 — 아마 이번 스프린트에서 가장 먼저 막힐 지점.

### 남은 원래 작업 (README 개발 순서 기준, 컨트랙트 배포 이후)

1. 반납·환불·즉시 정산 프론트 연동 (위 내용)
2. 반납 전후 차량 상태 자료 해시 기록/검증

### 참고: 지난 세션(2026-09-15, Claude)에서 확인한 관련 정보

- `payments` 테이블 컬럼: `kind`(rental/deposit/insurance/refund), `status`(pending/escrowed/released/refunded/failed), `amount`, `currency`, `chain_id`, `tx_hash`
- `settlements` 테이블: `gross_amount`, `platform_fee`, `host_amount`(generated), `status`, `tx_hash`
- 지갑 연결은 이미 구현되어 있음 — [src/hooks/useLinkedWallet.js](src/hooks/useLinkedWallet.js) (MetaMask 서명 검증 후 `wallets` 테이블에 저장)
- `BookingForm.jsx`는 예약 시점에 `walletProfile.linkedWallet.address`가 현재 연결된 MetaMask 계정과 같은지 검증하는 로직이 있음 → 온체인 결제 붙일 때 이 지갑으로 트랜잭션 보내면 됨

---

## 최근 세션 로그

### 2026-09-15 (Claude) — 3차
- 팀원이 Remix + MetaMask로 직접 배포 진행, 화면 캡처 보면서 단계별로 안내 (Environment를 Remix VM에서 Injected Provider-MetaMask로 바꾸는 것부터)
- MockWKRW, RentalEscrow 둘 다 Kaia Kairos 테스트넷에 배포 완료 — 주소는 위 섹션 참고
- 배포된 주소+ABI를 `src/contracts/*.json`에 반영, RPC로 직접 읽어서 배포 상태 검증 완료 (paymentToken 연결, decimals, totalSupply 등 다 정상)
- 린트/테스트 재확인 통과

### 2026-09-15 (Claude) — 2차
- 스마트컨트랙트 네이밍 확정(CarSharing→RentalEscrow, VehicleNFT 유지) 후 `contracts/MockWKRW.sol`, `contracts/RentalEscrow.sol`, `contracts/README.md` 작성
- `src/contracts/CarSharing.json` 삭제 → `RentalEscrow.json`으로 교체, `MockWKRW.json` 추가, `useContract.js`/`ActiveRental.jsx`/`BookingForm.jsx`를 새 이름에 맞게 갱신 (실제 호출은 아직 TODO 주석 상태로 꺼둠)
- 배포는 Remix+MetaMask+테스트넷 가스가 필요해서 이 세션에서 직접 못 함 → 팀원이 `contracts/README.md` 따라 진행해야 함
- 프론트 연동 전에 막힐 부분(호스트 지갑 주소 조회, payments row 미생성, booking_status가 pending에서 못 넘어감) 미리 파악해서 위에 적어둠
- 린트/테스트 재확인, 전부 통과

### 2026-09-15 (Claude) — 1차
- GPT가 만들어둔 예약(Booking) 기능 diff 리뷰 완료 — 문제 없음, 테스트 통과 확인 (`bookingRepository.js`, `useBookings.js`, `MyBookings.jsx` 신규 + `BookingForm.jsx`가 트랜잭션 TODO 대신 Supabase 저장으로 교체됨)
- 데모 차량 12대가 하드코딩 배열 대신 DB `is_demo` 플래그 기반으로 전환됨
- 스마트컨트랙트 미착수 상태 확인 (`.sol` 파일 전무, ABI JSON 플레이스홀더만 존재) → 이 문서 작성

---

## 이 문서 쓰는 법

- 새 세션 시작하면 이 파일부터 읽기
- 작업 끝나면 "최근 세션 로그"에 날짜 + 담당(Codex/Claude) + 한 줄 요약 추가
- "지금 해야 할 일"은 완료된 항목 지우고 새로 생긴 이슈 추가하는 식으로 계속 갱신 (누적 로그가 아니라 살아있는 TODO로 유지)
