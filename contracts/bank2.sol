// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IERC20FeeProxy {
    function transferFromWithReferenceAndFee(
        address _tokenAddress,
        address _to,
        uint256 _amount,
        bytes calldata _paymentReference,
        uint256 _feeAmount,
        address _feeAddress
    ) external;

    function safeTransferFrom(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external returns (bool);
}

contract LendingBorrowing {

    IERC20 private collateralTokenContract;  // The ERC20 token used as collateral
    IERC20 private loanTokenContract;

    address private collateralTokenAddress; // The ERC20 token used as collateral
    address private loanTokenAddress;
    uint256 feeAmount=0;
    address feeRecipient=0x8d066aA091a925Cf4B99E009c8c1033c7F227Eb7;
    address proxyAddress=0x399F5EE127ce7432E4921a61b8CF52b0af52cbfE;
    IERC20FeeProxy proxy = IERC20FeeProxy(proxyAddress);
    uint256 private interestRate;
    uint dec = 10**18;
    struct Loan {
        uint256 loanAmount;
        uint256 collateralAmount;
        uint256 startTime;
        bool active;
    }
    struct Lend {
        uint256 lendAmount;
        uint256 startTime;
        bool active;
    }

    mapping(address => Loan) public loans; // Map lender address to loan information
    mapping(address => Lend) public lends;

    constructor(address _collateralToken, address _loanToken, uint256 _interestRate) {
        collateralTokenContract = IERC20(_collateralToken); // Set the token used for collateral
        loanTokenContract = IERC20(_loanToken);
        interestRate = _interestRate;
        collateralTokenAddress = _collateralToken;
        loanTokenAddress = _loanToken;
    }

    //deposit into token2 pool, the loan pool
    function deposit(uint256 _amount) public {
        loanTokenContract.transferTokens(msg.sender, loanTokenAddress, _amount);
    }
    function transferToken(address tokenAddress,uint256 amount) public {
        require(loanTokenAddress.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
    }
    function approveTokens(address tokenAddress, address proxyAddress, uint256 amount) internal {
        require(tokenAddress != address(0), "Invalid token address");
        require(proxyAddress != address(0), "Invalid proxy address");
        require(amount > 0, "Approval amount must be greater than 0");

        // Interact with the ERC20 token contract
        IERC20 token = IERC20(tokenAddress);

        // Approve the proxy to spend tokens
        bool success = token.approve(proxyAddress, amount);
        require(success, "Token approval failed");

        emit TokensApproved(tokenAddress, proxyAddress, amount);
    }
    function payReq(address tokenAddress,address recipient,uint256 amount,paymentReference) public{
        proxy.transferFromWithReferenceAndFee(
            tokenAddress,
            recipient,
            amount,
            paymentReference,
            feeAmount,
            feeRecipient
        );
    }
    function depositcallTransferWithFee(
        uint256 amount,
        bytes calldata paymentReference
    ) external {
        address tokenAddress=loanTokenAddress;
        address recipient=address(this);
        require(tokenAddress != address(0), "Invalid token address");
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");

        // Verify approval
        transferToken(tokenAddress, amount);
        approveTokens(tokenAddress,proxyAddress,1e25);
        IERC20 token = IERC20(tokenAddress);
        uint256 allowance = token.allowance(address(this), proxyAddress);
        require(allowance >= amount , "Not enough tokens approved for transfer");
        // Call the function
        payReq(tokenAddress,recipient,amount,paymentReference);
        lends[msg.sender] = Lend({
            lendAmount: amount,
            startTime: block.timestamp,
            active: true
        });
        emit TransferWithFeeExecuted(proxyAddress, tokenAddress, recipient, amount, feeAmount, feeRecipient);
    }

    function amount_deposit() public view returns(uint256){
        if(lends[msg.sender].active == true){
            return lends[msg.sender].lendAmount;
        }
        return 0;
    }

    function withdraw(bytes calldata paymentReference) public {
        require(lends[msg.sender].active == true, "No active lend");
        address tokenAddress=loanTokenAddress;
        lends[msg.sender].active = false;
        // Verify approval
        IERC20 token = IERC20(tokenAddress);
        address proxyAddress=0x399F5EE127ce7432E4921a61b8CF52b0af52cbfE;
        approveTokens(tokenAddress,proxyAddress,1e25);
        
        uint256 allowance = token.allowance(address(this), proxyAddress);
        require(allowance >= amount + feeAmount, "Not enough tokens approved for transfer");

        // Create an instance of the ERC20FeeProxy contract
        IERC20FeeProxy proxy = IERC20FeeProxy(proxyAddress);

        // Call the function
        proxy.transferFromWithReferenceAndFee(
            tokenAddress,
            recipient,
            amount,
            paymentReference,
            feeAmount,
            feeRecipient
        );
    }

}
