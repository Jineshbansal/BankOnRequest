'use client';
import React, { useState, useEffect } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import { Types, Utils } from '@requestnetwork/request-client.js';
import { providers } from 'ethers';
import { Web3SignatureProvider } from '@requestnetwork/web3-signature';
import {
  RequestNetwork,
  PaymentReferenceCalculator,
} from '@requestnetwork/request-client.js';
import { ethers } from 'ethers';
import contractABI from '@/utils/contractAbi';
import Navbar from '@/components/Navbar';
import checkAndApproveToken from '@/utils/checkAndApproveToken';
import Input from '@/components/input';
import DropdownInput from '@/components/dropDownInput';
import tokenOptions from '@/utils/tokenOptions';

const App = () => {
  const [lendingToken, setLendingToken] = useState('');
  const [lendingAmount, setLendingAmount] = useState('');
  const [description, setDescription] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [issuedDate, setIssuedDate] = useState('');
  const [{ wallet }] = useConnectWallet();
  const payeeIdentity = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS || '';
  const payerIdentity = wallet?.accounts[0].address;
  console.log('payeeIdentity:', payeeIdentity);
  console.log('payerIdentity:', payerIdentity);

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    setIssuedDate(new Date().toLocaleDateString(undefined, options));
    console.log(Utils.getCurrentTimestampInSecond());
  }, []);

  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('payeeIdentity:', payeeIdentity);
    console.log('payerIdentity:', payerIdentity);
    const loanAmount = ethers.utils.parseUnits(lendingAmount, 18);
    console.log('loanAmount', loanAmount);
    const requestCreateParameters = {
      requestInfo: {
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          value: lendingToken,
          token: tokenOptions[lendingToken],
          network: 'sepolia' as Types.RequestLogic.ICurrency['network'],
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
        creationDate: Utils.getCurrentTimestampInSecond(),
        reason: description,
        requestType: 'lend',
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
    const tokenAddress = lendingToken;
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
      payerIdentity ?? '',
      provider,
      loanAmount.toString() + '0'
    );
    const payref = '0x' + paymentReference;
    const contractAddress =
      process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS || '';
    console.log('contractAddress:', contractAddress);
    console.log('payref', payref);
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const data = await contract.depositcallTransferWithFee(loanAmount, payref);
    await data.wait();
    console.log('payerIdentity', payerIdentity);
    console.log('payeeIdentity', payeeIdentity);
    console.log('data', data.hash);
    alert('Form submitted successfully');
  };

  const downloadInvoice = () => {
    const element = document.createElement('a');
    const invoiceContent = document.querySelector('.invoice')?.innerHTML;
    const blob = new Blob([invoiceContent || ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    element.href = url;
    element.download = 'invoice.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className='w-[100vw] h-[100vh] overflow-x-hidden overflow-y-scroll no-scrollbar'>
      <Navbar />
      <div className='flex flex-wrap md:flex-nowrap'>
        <div className='md:w-1/2 p-4 pr-2 h-cover'>
          <form
            onSubmit={submitHandler}
            className='w-full bg-white shadow-lg rounded-lg p-8 h-full'
          >
            <h1
              className='text-2xl font-bold mb-6 text-center'
              style={{ color: '#0bb489' }}
            >
              Create a Payment Request
            </h1>
            <Input
              label="Lender's Wallet Address:"
              value={payerIdentity}
              readOnly
            />

            <DropdownInput
              options={Object.entries(tokenOptions).map(([value, label]) => ({
                value,
                label,
              }))}
              value={lendingToken}
              onChange={(e) => setLendingToken(e.target.value)}
              labelName='Lending Token:'
            />

            <Input
              label='Lending Amount:'
              type='number'
              value={lendingAmount}
              onChange={(e) => setLendingAmount(e.target.value)}
              required
            />

            <Input
              label='Description:'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              textarea
            />

            <h2 className='text-xl font mb-4' style={{ color: '#0bb489' }}>
              Lender Details
            </h2>

            <div className='flex space-x-4'>
              <div className='w-1/2'>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder='Enter your first name'
                />
              </div>
              <div className='w-1/2'>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder='Enter your last name'
                />
              </div>
            </div>

            <div className='flex space-x-4'>
              <div className='w-1/2'>
                <Input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Enter your email address'
                />
              </div>
              <div className='w-1/2'>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder='Enter your country'
                />
              </div>
            </div>

            <div className='flex space-x-4'>
              <div className='w-1/2'>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder='Enter your city'
                />
              </div>
              <div className='w-1/2'>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder='Enter your postal code'
                />
              </div>
            </div>

            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder='Enter your address'
            />

            <button
              type='submit'
              className='w-full py-2 px-4 text-white font-bold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#0bb489]'
              style={{
                backgroundColor: '#0bb489',
              }}
            >
              Create Request
            </button>
          </form>
        </div>
        <div className='md:w-1/2 p-4 pl-2 h-screen relative'>
          <div className='w-full bg-white shadow-md rounded-lg p-8 h-full flex flex-col justify-between invoice'>
            <div>
              <div className='flex justify-between mb-6'>
                <h1 className='text-2xl font-bold' style={{ color: '#0bb489' }}>
                  Invoice
                </h1>
                <div className='text-right'>
                  <p className='text-gray-600'>Issued Date:</p>
                  <p className='font-bold'>{issuedDate}</p>
                </div>
              </div>
              <div className='mb-6'>
                <h2 className='text-lg font mb-2' style={{ color: '#0bb489' }}>
                  From:
                </h2>
                <p>{payerIdentity}</p>
              </div>
              <div className='mb-6'>
                <h2 className='text-lg font mb-2' style={{ color: '#0bb489' }}>
                  Lender Details:
                </h2>
                <p>
                  {firstName} {lastName}
                </p>
                <p>{email}</p>
                <p>{address}</p>
                <p>
                  {city} {postalCode} {country}
                </p>
              </div>
              <div className='mb-6'>
                <h2 className='text-lg font mb-2' style={{ color: '#0bb489' }}>
                  Payment Details:
                </h2>
                <p className='mb-2'>
                  Token: {tokenOptions[lendingToken]} - {lendingToken}
                </p>
                <p className='mb-2'>Amount: {lendingAmount}</p>
                <p className='mb-2'>Description: {description}</p>
              </div>
            </div>
            <div className='mt-6'>
              <img
                src='/peer-to-peer.png'
                alt='Company Logo'
                className='w-14 mb-4'
                style={{ filter: 'invert(0)' }}
              />
              <p className='text-gray-600'>
                Thank you for using BankOnRequest!
              </p>
              <p className='text-gray-600'>
                Contact us at mkaran4249@gmail.com
              </p>
            </div>
          </div>
          <button
            onClick={downloadInvoice}
            className='absolute bottom-10 right-10 py-2 px-4 text-white rounded'
            style={{
              backgroundColor: '#0bb489',
            }}
          >
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
