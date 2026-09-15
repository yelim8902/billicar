// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title RentalEscrow
/// @notice MobiTrust 예약 결제(대여료+보험료+보증금)를 예치했다가, 정상 반납 시 차주/플랫폼에게
///         즉시 정산하거나 취소 시 렌터에게 환불하는 컨트랙트입니다.
///
///         Supabase `bookings.id`는 UUID라 온체인 키로 그대로 쓸 수 없어서, 프론트엔드에서
///         `ethers.id(bookingId)` (keccak256 of the UUID string)로 만든 bytes32 값을 키로 씁니다.
///         release/refund는 지금 단계에선 플랫폼(owner)만 호출합니다 — 반납 확인·분쟁 판정을
///         프론트/운영 로직에서 하고 그 결과로 컨트랙트를 호출하는 구조입니다. 추후 운행 종료
///         조건(오라클/서명 검증 등)을 자동화하고 싶으면 이 owner 권한을 그 로직으로 옮기면 됩니다.
contract RentalEscrow is Ownable {
    using SafeERC20 for IERC20;

    enum Status { None, Escrowed, Released, Refunded }

    struct Booking {
        address renter;
        address host;
        uint256 rentalFee;
        uint256 insuranceFee;
        uint256 depositAmount;
        Status status;
    }

    IERC20 public immutable paymentToken;   // MockWKRW 주소
    address public platformWallet;          // 수수료 + 보험료 수령 지갑
    uint16 public platformFeeBps;           // 대여료 중 플랫폼 수수료 (1000 = 10%, 최대 3000 = 30%)

    mapping(bytes32 => Booking) public bookings;

    event Escrowed(bytes32 indexed bookingId, address indexed renter, address indexed host, uint256 total);
    event Released(bytes32 indexed bookingId, uint256 hostAmount, uint256 platformFee, uint256 depositRefund);
    event Refunded(bytes32 indexed bookingId, uint256 amount);

    constructor(address _paymentToken, address _platformWallet, uint16 _platformFeeBps) Ownable(msg.sender) {
        require(_paymentToken != address(0) && _platformWallet != address(0), "RentalEscrow: zero address");
        require(_platformFeeBps <= 3000, "RentalEscrow: fee too high");
        paymentToken = IERC20(_paymentToken);
        platformWallet = _platformWallet;
        platformFeeBps = _platformFeeBps;
    }

    /// @notice 렌터가 예약을 확정하며 대여료+보험료+보증금을 예치합니다.
    ///         호출 전에 프론트에서 `paymentToken.approve(escrow주소, total)`을 먼저 실행해야 합니다.
    /// @param bookingId `ethers.id(supabase bookings.id)`로 만든 bytes32 키
    /// @param host 차주 지갑 주소 (정산 대상)
    function deposit(
        bytes32 bookingId,
        address host,
        uint256 rentalFee,
        uint256 insuranceFee,
        uint256 depositAmount
    ) external {
        require(bookings[bookingId].status == Status.None, "RentalEscrow: already exists");
        require(host != address(0), "RentalEscrow: invalid host");

        uint256 total = rentalFee + insuranceFee + depositAmount;
        require(total > 0, "RentalEscrow: nothing to deposit");

        bookings[bookingId] = Booking({
            renter: msg.sender,
            host: host,
            rentalFee: rentalFee,
            insuranceFee: insuranceFee,
            depositAmount: depositAmount,
            status: Status.Escrowed
        });

        paymentToken.safeTransferFrom(msg.sender, address(this), total);
        emit Escrowed(bookingId, msg.sender, host, total);
    }

    /// @notice 정상 반납 확인 후 플랫폼이 호출합니다.
    ///         보증금은 렌터에게 그대로 환불, 대여료는 수수료를 뗀 나머지를 차주에게,
    ///         수수료+보험료는 플랫폼 지갑으로 즉시 정산합니다.
    function release(bytes32 bookingId) external onlyOwner {
        Booking storage b = bookings[bookingId];
        require(b.status == Status.Escrowed, "RentalEscrow: not escrowed");
        b.status = Status.Released;

        uint256 platformFee = (b.rentalFee * platformFeeBps) / 10_000;
        uint256 hostAmount = b.rentalFee - platformFee;
        uint256 platformTake = platformFee + b.insuranceFee;

        if (hostAmount > 0) paymentToken.safeTransfer(b.host, hostAmount);
        if (platformTake > 0) paymentToken.safeTransfer(platformWallet, platformTake);
        if (b.depositAmount > 0) paymentToken.safeTransfer(b.renter, b.depositAmount);

        emit Released(bookingId, hostAmount, platformFee, b.depositAmount);
    }

    /// @notice 예약 취소/거절/분쟁 시 플랫폼이 호출합니다. 예치된 전액을 렌터에게 환불합니다.
    function refund(bytes32 bookingId) external onlyOwner {
        Booking storage b = bookings[bookingId];
        require(b.status == Status.Escrowed, "RentalEscrow: not escrowed");
        b.status = Status.Refunded;

        uint256 total = b.rentalFee + b.insuranceFee + b.depositAmount;
        paymentToken.safeTransfer(b.renter, total);

        emit Refunded(bookingId, total);
    }

    function setPlatformWallet(address _platformWallet) external onlyOwner {
        require(_platformWallet != address(0), "RentalEscrow: zero address");
        platformWallet = _platformWallet;
    }

    function setPlatformFeeBps(uint16 _platformFeeBps) external onlyOwner {
        require(_platformFeeBps <= 3000, "RentalEscrow: fee too high");
        platformFeeBps = _platformFeeBps;
    }
}
