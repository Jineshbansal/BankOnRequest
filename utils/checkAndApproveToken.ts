
import { ethers } from 'ethers';
import ERC20_ABI from '@/utils/erc20Abi';

const checkAndApproveToken = async (
  TOKEN_ADDRESS: string,
  userAddress: string,
  provider: ethers.providers.Web3Provider,
  loanAmount: string
) => {
  const signer = provider.getSigner();
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);

  try {
    // Step 1: Check current allowance
    const allowance = await tokenContract.allowance(
      userAddress,
      process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS
    );
    console.log(
      `Current Allowance: ${ethers.utils.formatUnits(allowance, 18)} tokens`
    );

    // Step 2: If allowance is insufficient, request approval
    if (allowance.lt(loanAmount)) {
      console.log('Insufficient allowance. Requesting approval...');

      // Request approval
      const approveTx = await tokenContract.approve(
        process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS,
        loanAmount
      );
      console.log(`Approval transaction sent. Hash: ${approveTx.hash}`);

      // Wait for the transaction to be mined
      await approveTx.wait();
      console.log('Approval successful!');
    } else {
      console.log('Sufficient allowance already granted.');
    }
  } catch (error) {
    console.error('Error checking or approving token:', error);
  }
};

export default checkAndApproveToken;