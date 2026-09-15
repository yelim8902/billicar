# 작업 인수인계 문서 (Codex ↔ Claude)

> 이 파일은 AI 세션(코덱스/클로드)을 번갈아 쓸 때 컨텍스트를 이어받기 위한 문서예요.
> **작업을 마칠 때마다 "최근 세션 로그"에 한 줄이라도 남기고, "지금 해야 할 일"을 최신 상태로 갱신해주세요.**
> 코드 구조 자체(파일 위치, 함수명 등)는 여기 적지 않습니다 — 그건 코드/README/DATA_MODEL.md를 보면 되니까요.
> 여기 적는 건 "코드만 봐서는 알기 어려운 것" — 지금까지의 결정, 다음에 할 일, 막힌 부분입니다.

---

## 지금 해야 할 일 (다음 세션이 이어받을 것)

### ✅ 온체인 예치/정산 연동 완료 (2026-09-15, 시간 없어서 간소화된 버전)

시간이 부족해서 **호스트 승인 단계 없이 렌터가 셀프서비스로 전체 흐름을 진행**하는 걸로 간소화함. 아래가 지금 실제로 도는 흐름:

```
예약(BookingForm) → MockWKRW.approve + RentalEscrow.deposit → bookings(status=confirmed) + payments(escrowed)
  → "내 예약"에서 [이용 시작] 누르면 → bookings(status=active)
    → "내 렌탈"에서 [반납] 누르면 → RentalEscrow.release + bookings(status=completed)
```

**바뀐 파일:**
- [bookingRepository.js](src/services/bookingRepository.js) — `getHostWalletAddress`, `startBooking`, `completeBooking` 추가. `createBooking`은 이제 `id`(클라이언트에서 미리 만든 UUID)와 `txHash`를 받아서 성공 시 `bookings`를 바로 `confirmed`로 만들고 `payments` row(kind='rental', status='escrowed')도 같이 기록함
- [BookingForm.jsx](src/components/BookingForm.jsx) — 예약 버튼 누르면 실제로 `MockWKRW.approve` → `RentalEscrow.deposit` 트랜잭션을 태우고, 성공한 tx hash로 `createBooking` 호출
- [ActiveRental.jsx](src/components/ActiveRental.jsx) — 더 이상 App의 죽은 `activeRental` state를 안 받고, `useBookings(userId)`에서 `status==='active'`인 예약을 직접 찾음 (예전에 찾았던 "내 렌탈 탭이 항상 빈 화면" 버그 여기서 같이 고쳐짐). 반납 버튼 → `RentalEscrow.release` 호출 후 `completeBooking`
- [MyBookings.jsx](src/components/MyBookings.jsx) — `confirmed` 상태 예약에 "이용 시작" 버튼 추가 (`startBooking` 호출 후 "내 렌탈" 탭으로 이동)
- [App.js](src/App.js) — 안 쓰이던 `activeRental`/`setActiveRental` state 전부 제거
- 새 마이그레이션 [202609150005_relax_booking_status_updates.sql](supabase/migrations/202609150005_relax_booking_status_updates.sql) — 렌터가 자기 예약을 `pending`일 때만 수정 가능하던 RLS를 **상태 무관하게 자기 예약이면 수정 가능**하도록 완화 (호스트 승인 없는 셀프서비스 모델이라 앱 로직이 전이를 통제함). **이미 `npx supabase db push --linked`로 실제 프로젝트에 적용 완료**
- 린트/테스트 전부 통과 확인

### ⚠️ 시간 없어서 생략한 것들 (알고 있어야 할 간소화 지점)

- **호스트 승인 단계가 아예 없음**: 원래 기획에 있었을 수도 있는데, 지금은 렌터가 예치만 하면 바로 `confirmed`. 데모/발표엔 문제없지만 실서비스 스코프면 나중에 넣어야 함.
- **차주가 지갑을 안 걸어놨으면 플랫폼 지갑으로 대신 예치됨**: `getHostWalletAddress`가 null 반환하면 `RentalEscrow.platformWallet()`으로 폴백. 데모 차량(host 없음)도 마찬가지. 실제 차주 정산이 아니라 플랫폼이 대신 받는 셈이라, 실서비스면 "지갑 연결 안 한 차주는 차량 등록 자체를 막기" 같은 제약이 필요함.
- **`payments`를 kind별로 안 나누고 한 건으로 합침**: 스키마는 `kind: rental/deposit/insurance/refund`로 나누게 되어있는데 지금은 `kind='rental'` 한 row에 합계 금액만 기록함. 정산 리포트 세분화하려면 나중에 3개로 쪼개야 함.
- **`release`/`refund`가 `onlyOwner`(배포 지갑)만 호출 가능**: `ActiveRental`의 반납 버튼을 실제로 누르는 사람은 렌터인데, 온체인 `release()`는 배포 지갑(플랫폼 owner)만 실행 가능함 → **지금 상태로는 일반 렌터 계정으로 반납 버튼 누르면 트랜잭션이 실패함**. 데모할 땐 배포했던 지갑(팀원 계정)으로 로그인해서 반납 버튼을 눌러야 함. 정식으로 하려면 컨트랙트에 렌터도 release 호출 가능하게 권한을 풀거나, 백엔드가 대신 호출해주는 구조가 필요 — 시간 되면 다음 작업으로.
- **취소(`cancelBooking`)는 사실상 안 쓰임**: 예약이 이제 pending을 안 거치고 바로 confirmed로 생성되기 때문에, "예약 취소" 버튼이 뜨는 조건(`status==='pending'`)이 거의 발생 안 함. 온체인 예치까지 끝난 confirmed 예약을 취소하려면 `RentalEscrow.refund()` 연동이 따로 필요한데 아직 안 함.
- **`rentals`/`trip_events` 테이블은 안 씀**: 상태 전이는 `bookings.status`만으로 관리, 실제 주행 기록(주행거리, 상태 사진 해시 등)은 손 안 댐 — README의 "차량 상태 자료 해시 검증" 항목이 이거.

### 다음에 할 일 (우선순위 추천)

1. **테스트넷에서 실제로 예약→반납까지 한 번 끝까지 돌려보기** (지금까지는 코드만 짜고 배포까지만 확인, 실제 트랜잭션 플로우 end-to-end 검증은 아직 안 함)
2. release 권한 문제 정리 (배포 지갑으로만 반납 가능한 부분)
3. 여유 있으면: payments를 kind별로 분리, 취소 시 온체인 refund 연동

### 참고: 지난 세션(2026-09-15, Claude)에서 확인한 관련 정보

- `payments` 테이블 컬럼: `kind`(rental/deposit/insurance/refund), `status`(pending/escrowed/released/refunded/failed), `amount`, `currency`, `chain_id`, `tx_hash`
- `settlements` 테이블: `gross_amount`, `platform_fee`, `host_amount`(generated), `status`, `tx_hash`
- 지갑 연결은 이미 구현되어 있음 — [src/hooks/useLinkedWallet.js](src/hooks/useLinkedWallet.js) (MetaMask 서명 검증 후 `wallets` 테이블에 저장)
- `BookingForm.jsx`는 예약 시점에 `walletProfile.linkedWallet.address`가 현재 연결된 MetaMask 계정과 같은지 검증하는 로직이 있음 → 온체인 결제 붙일 때 이 지갑으로 트랜잭션 보내면 됨

---

## 최근 세션 로그

### 2026-09-15 (Claude) — 4차
- 시간 부족 때문에 호스트 승인 없는 셀프서비스 모델로 간소화하기로 결정하고 진행
- 예약→예치→확정, 이용 시작, 반납→정산까지 온체인 연동 실제로 배선 완료 (BookingForm/ActiveRental/MyBookings/App.js/bookingRepository)
- RLS 정책 완화 마이그레이션 작성 후 `supabase db push --linked`로 실제 프로젝트에 적용 완료 (확인: `supabase migration list --linked`)
- "내 렌탈 탭이 항상 빈 화면" 버그, 이번에 ActiveRental을 useBookings 기반으로 바꾸면서 같이 해결됨
- 간소화하면서 생긴 제약(호스트 승인 없음, release가 owner 전용이라 반납은 배포 지갑으로만 가능 등) 위에 정리해둠 — 실제 데모/시연 전에 팀원들이 꼭 읽어야 함
- 린트/테스트 통과, `feat/booking-and-contracts` 브랜치에 커밋 예정

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
