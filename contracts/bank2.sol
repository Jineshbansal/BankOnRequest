// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
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
    event PaymentReceived(address indexed from, uint256 amount);
    event TokensApproved(address indexed token, address indexed spender, uint256 amount);
    event TransferWithFeeExecuted(
        address indexed proxy,
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 feeAmount,
        address feeRecipient
    );
    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }
    fallback() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }
      // The ERC20 token used as collateral
   

    // The ERC20 token used as collateral
   
    uint256 feeAmount=0;
    address feeRecipient=0x8d066aA091a925Cf4B99E009c8c1033c7F227Eb7;
    address proxyAddress=0x399F5EE127ce7432E4921a61b8CF52b0af52cbfE;
    IERC20FeeProxy proxy = IERC20FeeProxy(proxyAddress);
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

    mapping(address => Loan) public loans; 
    mapping(address => Lend) public lends;
    address _collateralToken=0xA74b9F8a20dfACA9d7674FeE0697eE3518567248;
    address _loanToken=0x1d87Fc9829d03a56bdb5ba816C2603757f592D82;
    IERC20 public collateralTokenContract = IERC20(_collateralToken); // Set the token used for collateral
    IERC20 public loanTokenContract = IERC20(_loanToken);
    address public collateralTokenAddress = _collateralToken;
    address public loanTokenAddress = _loanToken;
    function payReq(address recipient,uint256 amount,bytes calldata paymentReference) public{
        proxy.transferFromWithReferenceAndFee(
            loanTokenAddress,
            recipient,
            amount,
            paymentReference,
            feeAmount,
            feeRecipient
        );
    }
    function transferToken(uint256 amount) public {
        require(loanTokenContract.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
    }
    function transferCollateralToken(uint256 amount) public {
        require(collateralTokenContract.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
    }
    function approveTokens(uint256 amount) internal {
        require( loanTokenContract.approve(proxyAddress, amount), "Token approval failed");
        emit TokensApproved(loanTokenAddress, proxyAddress, amount);
    }
    
    function depositcallTransferWithFee(uint256 amount, bytes calldata paymentReference) external {
        address tokenAddress=loanTokenAddress;
        require(tokenAddress != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");

        // Verify approval
        transferToken(amount);
        approveTokens(1e32);
        uint256 allowance = loanTokenContract.allowance(address(this), proxyAddress);
        require(allowance >= amount , "Not enough tokens approved for transfer");
        // Call the function
        payReq(address(this),amount,paymentReference);
        lends[msg.sender] = Lend({
            lendAmount: amount,
            startTime: block.timestamp,
            active: true
        });
        emit TransferWithFeeExecuted(proxyAddress, tokenAddress, address(this), amount, feeAmount, feeRecipient);
    }

    function amount_deposit() public view returns(uint256){
        if(lends[msg.sender].active == true){
            uint256 elapsedTime = block.timestamp - lends[msg.sender].startTime; // Time elapsed in seconds
            uint256 interestRatePerSecond = 2536783358; // 8% annual interest rate converted to per-second
            uint256 interest = (lends[msg.sender].lendAmount * interestRatePerSecond * elapsedTime)/1e18; // Calculate interest
            uint256 netAmount = lends[msg.sender].lendAmount + interest; // Total amount
            return netAmount+1e17;
        }
        return 0;
    }

    function withdraw(bytes calldata paymentReference) public {
        require(lends[msg.sender].active == true, "No active lend");
        // Verify approval
        approveTokens(1e25);
        uint256 netAmount = amount_deposit(); // Total amount
        uint256 allowance = loanTokenContract.allowance(address(this), proxyAddress);
        require(allowance >= netAmount, "Not enough tokens approved for transfer");
        payReq(msg.sender,netAmount,paymentReference);
        lends[msg.sender].active = false;
        emit TransferWithFeeExecuted(proxyAddress, loanTokenAddress, msg.sender, netAmount, feeAmount, feeRecipient);
    }
    function amount_borrow() public view returns(uint256){
        if(loans[msg.sender].active == true){
            uint256 elapsedTime = block.timestamp - lends[msg.sender].startTime; // Time elapsed in seconds
            uint256 interestRatePerSecond = 3805175038;// 12% annual interest rate converted to per-second
            uint256 interest = (loans[msg.sender].loanAmount * interestRatePerSecond * elapsedTime)/1e18; // Calculate interest
            uint256 netAmount = loans[msg.sender].loanAmount + interest + 1e18; 
            return netAmount+1e17;
        }
        return 0;
    }
    function borrowcallTransferWithFee(uint256 amount,uint256 collateralAmount,bytes calldata paymentReference)external{
        require(amount > 0, "Amount must be greater than 0");
        // Verify approval
        approveTokens(1e25);
        transferCollateralToken(amount);
        uint256 allowance = loanTokenContract.allowance(address(this), proxyAddress);
        require(allowance >= amount + feeAmount, "Not enough tokens approved for transfer");


        // Call the function
        payReq(msg.sender,amount,paymentReference);
        loans[msg.sender] = Loan({
            loanAmount: amount,
            collateralAmount : collateralAmount,
            startTime: block.timestamp,
            active: true
        });
        emit TransferWithFeeExecuted(proxyAddress, loanTokenAddress, msg.sender, amount, feeAmount, feeRecipient);
    }

    function repayLoan(bytes calldata paymentReference) public{
        require(loans[msg.sender].active == true, "No active loan");
        uint256 netAmount = amount_borrow(); 
        transferToken(netAmount);
        approveTokens(1e30);
        uint256 allowance = loanTokenContract.allowance(address(this), proxyAddress);
        require(allowance >= netAmount , "Not enough tokens approved for transfer");
        payReq(address(this),netAmount,paymentReference);
        loans[msg.sender].active=false;
        require(collateralTokenContract.transfer(msg.sender, loans[msg.sender].collateralAmount), "Token transfer failed");
        emit TransferWithFeeExecuted(proxyAddress, loanTokenAddress, address(this), netAmount, feeAmount, feeRecipient);
    }

}
