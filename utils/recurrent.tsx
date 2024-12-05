import { EthereumPrivateKeySignatureProvider } from '@requestnetwork/epk-signature';
import { Types, Utils } from '@requestnetwork/request-client.js';
import { RequestNetwork } from '@requestnetwork/request-client.js';
import { useConnectWallet } from '@web3-onboard/react';
import { ethers } from 'ethers';
import { providers } from 'ethers';
import contractABI from '@/utils/contractAbi';
import { create } from 'domain';
import { createCustomRequest } from './createCustomRequest';
export const recurrent = async () => {
  const [{ wallet }] = useConnectWallet();
  const user = wallet?.accounts[0].address;

  const contractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
  console.log('contractAddress:', contractAddress);
  const provider = new providers.Web3Provider(window.ethereum);
  // Create a wallet instance
  const signer = new ethers.Wallet(
    process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS,
    provider
  );
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  const collateral = '0x0';
  const tokenAddress = '0x0';
  const data = await contract.shouldCreateRequest(
    user,
    collateral,
    tokenAddress
  );
  console.log(data);
  const amount = await contract.amount_borrow(user, collateral, tokenAddress);
  const reason = 'hello';
  if (data.istrue) {
    createCustomRequest(user, reason, tokenAddress, amount, '2022-12-12');
  }
};
