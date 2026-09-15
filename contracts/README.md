# 스마트컨트랙트 (Remix 배포용)

이 폴더의 `.sol` 파일은 로컬에서 컴파일/배포하는 하드햇 프로젝트가 아니라, **Remix에 그대로 복사해서 배포하는 소스**입니다.
(기존 CarSharing/VehicleNFT 스캐폴딩도 이 방식이었어서 그대로 따름.)

## 배포 순서

### 1. MetaMask 준비
- Kaia Kairos 테스트넷으로 전환 (앱에서 자동 전환됨, 또는 [Kaia 지갑 가이드](https://docs.kaia.io) 참고)
- [Kairos 파우셋](https://faucet.kaia.io)에서 가스비용 테스트 KAIA 받기

### 2. Remix에서 MockWKRW 배포
1. [remix.ethereum.org](https://remix.ethereum.org) 접속 → `contracts/MockWKRW.sol` 내용을 새 파일로 붙여넣기
2. **Solidity Compiler** 탭 → 컴파일러 버전 `0.8.24` 이상 선택 → Compile
   - `@openzeppelin/contracts/...` import는 Remix가 자동으로 npm에서 받아옴 (인터넷 연결 필요)
3. **Deploy & Run Transactions** 탭 → Environment를 **Injected Provider - MetaMask**로 설정 (Kairos 네트워크인지 확인)
4. `MockWKRW` 선택 → Deploy (생성자 인자 없음) → MetaMask 서명
5. 배포 후 나온 **컨트랙트 주소**를 기록해두기 (RentalEscrow 배포 시 필요)

### 3. Remix에서 RentalEscrow 배포
1. `contracts/RentalEscrow.sol` 새 파일로 붙여넣고 Compile (같은 컴파일러 버전)
2. Deploy 시 생성자 인자 3개 입력:
   - `_paymentToken`: 위에서 배포한 MockWKRW 주소
   - `_platformWallet`: 수수료/보험료를 받을 지갑 주소 (팀 대표 지갑 or 데모용 지갑)
   - `_platformFeeBps`: 플랫폼 수수료 (예: `1000` = 10%, 최대 `3000`)
3. Deploy → MetaMask 서명 → 배포된 **컨트랙트 주소** 기록

### 4. ABI 복사해서 프론트에 붙여넣기
각 컨트랙트를 컴파일한 뒤 **Solidity Compiler 탭 → ABI 복사 버튼**으로 ABI를 복사해서:

- `src/contracts/MockWKRW.json` → `address`, `abi` 채우기
- `src/contracts/RentalEscrow.json` → `address`, `abi` 채우기

### 5. 데모용 W-KRW 미리 받아두기
Remix의 **Deploy & Run** 탭에서 MockWKRW 컨트랙트의 `faucet` 함수를 호출해 데모 계정들(렌터/차주 역할용 지갑)에 테스트 토큰을 미리 넣어두면 데모가 매끄럽습니다. (1시간에 1번, 최대 1천만 W-KRW)

## 아직 안 된 것 (다음 단계)

- 프론트엔드(`BookingForm.jsx`, `ActiveRental.jsx`)에서 실제로 `deposit`/`release`/`refund`를 호출하는 부분은 **아직 주석 처리된 TODO 상태**입니다. 주소/ABI를 채운 뒤 주석을 풀고 연결하는 작업이 남아있습니다 — 자세한 건 저장소 루트의 [HANDOFF.md](../HANDOFF.md) 참고.
- `release`/`refund`는 지금 `onlyOwner`(배포한 지갑)만 호출 가능합니다. 데모에서는 배포자 지갑으로 직접 호출하면 되지만, 실서비스라면 이 권한을 누가/어떻게 행사할지(운영자 백엔드, 반납 확인 로직 등) 별도 설계가 필요합니다.
