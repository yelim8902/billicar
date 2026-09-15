// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockWKRW
/// @notice BilliCar 데모용 W-KRW 테스트 토큰입니다. Kaia Kairos 테스트넷 전용이며 실제 가치는 없습니다.
///         RentalEscrow 컨트랙트의 결제 수단(paymentToken)으로 사용됩니다.
contract MockWKRW is ERC20 {
    uint256 public constant FAUCET_LIMIT = 10_000_000 * 10 ** 18; // 1회 최대 1천만 W-KRW
    uint256 public constant FAUCET_COOLDOWN = 1 hours;

    mapping(address => uint256) public lastFaucetAt;

    constructor() ERC20("Wrapped KRW (BilliCar Demo)", "W-KRW") {
        // 배포자에게 데모 초기 유동성 지급 (필요하면 이후 다른 지갑으로 나눠주면 됨)
        _mint(msg.sender, 1_000_000_000 * 10 ** 18);
    }

    /// @notice 테스트/데모용 수도꼭지. 누구나 자기 지갑으로 최대 1천만 W-KRW를 발급받을 수 있고,
    ///         지갑당 1시간에 한 번만 호출 가능합니다. 데모 시연 전에 팀원들이 미리 받아두면 됩니다.
    function faucet(uint256 amount) external {
        require(amount > 0 && amount <= FAUCET_LIMIT, "MockWKRW: amount out of range");
        require(block.timestamp - lastFaucetAt[msg.sender] >= FAUCET_COOLDOWN, "MockWKRW: cooldown, try later");
        lastFaucetAt[msg.sender] = block.timestamp;
        _mint(msg.sender, amount);
    }
}
