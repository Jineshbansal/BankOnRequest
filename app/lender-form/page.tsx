'use client';
import React, { useState } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import { Types, Utils } from '@requestnetwork/request-client.js';
import { providers, utils } from 'ethers';
import { Web3SignatureProvider } from '@requestnetwork/web3-signature';
import {
  RequestNetwork,
  PaymentReferenceCalculator,
} from '@requestnetwork/request-client.js';
import { ethers } from 'ethers';
import ERC20_ABI from '@/utils/erc20Abi';
import contractABI from '@/utils/contractAbi';
import Navbar from '@/components/Navbar';
import checkAndApproveToken from '@/utils/checkAndApproveToken';
import { useAppContext } from '@/utils/context';

const App = () => {
  const [expectedAmount, setExpectedAmount] = useState('1');
  const [reason, setReason] = useState('');
  const [{ wallet }] = useConnectWallet();
  const payeeIdentity = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
  const payerIdentity = wallet?.accounts[0].address;
  console.log('payeeIdentity:', payeeIdentity);
  console.log('payerIdentity:', payerIdentity);

  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('payeeIdentity:', payeeIdentity);
    console.log('payerIdentity:', payerIdentity);
    const loanAmount = ethers.utils.parseUnits(expectedAmount, 18);
    console.log('loanAmount', loanAmount);
    const requestCreateParameters = {
      requestInfo: {
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          value: '0x1d87Fc9829d03a56bdb5ba816C2603757f592D82',
          network: 'sepolia',
        },
        expectedAmount: loanAmount.toString(),
        payee: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payeeIdentity,
        },
        payer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payerIdentity,
        },
        timestamp: Utils.getCurrentTimestampInSecond(),
      },
      paymentNetwork: {
        id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
        parameters: {
          paymentNetworkName: 'sepolia',
          paymentAddress: payeeIdentity,
          feeAddress: '0xEee3f751e7A044243a407F14e43f69236e12f748',
          feeAmount: '0',
        },
      },
      contentData: {
        reason: reason,
        dueDate: '2023.06.16',
      },
      signer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payerIdentity,
      },
    };
    const provider = new providers.Web3Provider(window.ethereum);
    const accounts = await provider.send('eth_accounts', []);
    console.log('Accounts:', accounts);
    const signer = provider.getSigner();

    const web3SignatureProvider = new Web3SignatureProvider(provider.provider);
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: 'https://gnosis.gateway.request.network/',
      },
      signatureProvider: web3SignatureProvider,
    });
    const request = await requestClient.createRequest(requestCreateParameters);
    const confirmedRequestData = await request.waitForConfirmation();
    const requestID = confirmedRequestData.requestId;
    const tokenAddress = '0x1d87Fc9829d03a56bdb5ba816C2603757f592D82';
    const salt =
      confirmedRequestData.extensions['pn-erc20-fee-proxy-contract'].values
        .salt;
    const paymentReference = PaymentReferenceCalculator.calculate(
      requestID,
      salt,
      payeeIdentity
    );
    console.log('paymentReferenceCalculator', paymentReference);
    console.log('confirmed Request Data:', confirmedRequestData);
    console.log('Request Parameters:', requestCreateParameters);
    await checkAndApproveToken(
      tokenAddress,
      payerIdentity,
      provider,
      loanAmount
    );
    const payref = '0x' + paymentReference;
    const contractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
    console.log('contractAddress:', contractAddress);
    console.log('payref', payref);
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const data = await contract.depositcallTransferWithFee(
      tokenAddress,
      payeeIdentity,
      loanAmount,
      payref
    );
    await data.wait();
    console.log('payerIdentity', payerIdentity);
    console.log('payeeIdentity', payeeIdentity);
    console.log('data', data.hash);
    alert('Form submitted successfully');
  };

  return (
    <div className='w-[100vw] h-[100vh] overflow-x-hidden overflow-y-scroll no-scrollbar'>
      <Navbar />
      <div className='flex'>
        <div className='w-1/2 p-8'>
          <form
            onSubmit={submitHandler}
            className='w-full max-w-lg bg-white shadow-lg rounded-lg p-8'
          >
            <h1
              className='text-2xl font-bold mb-6 text-center'
              style={{ color: '#0bb489' }}
            >
              Create a Payment Request
            </h1>

            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Expected Amount:
              </label>
              <input
                type='text'
                value={expectedAmount}
                onChange={(e) => setExpectedAmount(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2'
                style={{
                  borderColor: '#0bb489',
                  focus: { ringColor: '#0bb489' },
                }}
                required
              />
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Reason:
              </label>
              <input
                type='text'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2'
                style={{
                  borderColor: '#0bb489',
                  focus: { ringColor: '#0bb489' },
                }}
                required
              />
            </div>

            <button
              type='submit'
              className='w-full py-2 px-4 text-white font-bold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2'
              style={{
                backgroundColor: '#0bb489',
                focus: { ringColor: '#0bb489' },
              }}
            >
              Create Request
            </button>
          </form>
        </div>
        <div className='w-1/2 p-8'>
          <div className='w-full max-w-lg bg-white shadow-lg rounded-lg p-8'>
            <h1
              className='text-2xl font-bold mb-6 text-center'
              style={{ color: '#0bb489' }}
            >
              Invoice Details
            </h1>
            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Expected Amount:
              </label>
              <p className='w-full px-3 py-2 border border-gray-300 rounded-md'>
                {expectedAmount}
              </p>
            </div>
            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Reason:
              </label>
              <p className='w-full px-3 py-2 border border-gray-300 rounded-md'>
                {reason}
              </p>
            </div>
            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Payee:
              </label>
              <p className='w-full px-3 py-2 border border-gray-300 rounded-md'>
                {payeeIdentity}
              </p>
            </div>
            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Payer:
              </label>
              <p className='w-full px-3 py-2 border border-gray-300 rounded-md'>
                {payerIdentity}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
