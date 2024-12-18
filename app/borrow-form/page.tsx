'use client';
import React, { useState, useEffect } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import { Types, Utils } from '@requestnetwork/request-client.js';
import { providers } from 'ethers';
import { Web3SignatureProvider } from '@requestnetwork/web3-signature';
import { CurrencyTypes } from '@requestnetwork/types';
import {
  RequestNetwork,
  PaymentReferenceCalculator,
} from '@requestnetwork/request-client.js';
import { ethers } from 'ethers';
import contractABI from '@/utils/contractAbi';
import Navbar from '@/components/Navbar';
import Input from '@/components/input';
import checkAndApproveToken from '@/utils/checkAndApproveToken';
import DropdownInput from '@/components/dropDownInput';
import tokenOptions from '@/utils/tokenOptions';
import Spinner from '@/components/spinner';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceDocument from '@/components/InvoiceDocumentBorrower';

const App = () => {
  const [borrowingToken, setBorrowingToken] = useState(
    '0x1d87Fc9829d03a56bdb5ba816C2603757f592D82'
  );
  const [borrowingAmount, setBorrowingAmount] = useState('1');
  const [collateralToken, setCollateralToken] = useState(
    '0xA74b9F8a20dfACA9d7674FeE0697eE3518567248'
  );
  const [collateralAmount, setCollateralAmount] = useState('1');
  const [description, setDescription] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [issuedDate, setIssuedDate] = useState('');
  const [duration, setDuration] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [totalInterest, setTotalInterest] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const durationOptions = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
  ];

  const [{ wallet }] = useConnectWallet();
  const payerIdentity = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
  const payeeIdentity = wallet?.accounts[0].address;
  console.log('payeeIdentity:', payeeIdentity);
  console.log('payerIdentity:', payerIdentity);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);
  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    setIssuedDate(new Date().toLocaleDateString(undefined, options));
  }, []);
  const durInSecond = (duration: string) => {
    switch (duration) {
      case 'minutes':
        return 60;
      case 'hours':
        return 60 * 60;
      case 'days':
        return 60 * 60 * 24;
      case 'weeks':
        return 60 * 60 * 24 * 7;
      case 'months':
        return 60 * 60 * 24 * 30;
      default:
        return 60 * 60 * 24;
    }
  };
  const calculateInterest = (
    amount: string,
    duration: string,
    installments: string
  ) => {
    const principal = parseFloat(amount);
    const interestRate = 0.12;
    let durationInYears = 0;

    switch (duration) {
      case 'minutes':
        durationInYears = 1 / (60 * 24 * 365);
        break;
      case 'hours':
        durationInYears = 1 / (24 * 365);
        break;
      case 'days':
        durationInYears = 1 / 365;
        break;
      case 'weeks':
        durationInYears = 1 / 52;
        break;
      case 'months':
        durationInYears = 1 / 12;
        break;
      default:
        durationInYears = 1;
    }

    const totalInterest =
      principal * interestRate * durationInYears * parseInt(installments);
    const totalAmount = principal + totalInterest;
    return { totalInterest, totalAmount };
  };

  useEffect(() => {
    if (borrowingAmount && duration && totalInstallments) {
      const { totalInterest, totalAmount } = calculateInterest(
        borrowingAmount,
        duration,
        totalInstallments
      );
      setTotalInterest(totalInterest.toString());
      setTotalAmount(totalAmount.toString());
    } else {
      setTotalInterest('');
      setTotalAmount('');
    }
  }, [borrowingAmount, duration, totalInstallments]);

  const calculateTotalPayment = (
    amount: string,
    duration: string,
    installments: string
  ) => {
    const { totalAmount } = calculateInterest(amount, duration, installments);
    if (totalInstallments === '') return totalAmount;
    return totalAmount / parseInt(installments);
  };

  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setLoadingMessage('Creating borrow request...');
    const loanAmount = ethers.utils.parseUnits(borrowingAmount, 18);
    const giveAmount = ethers.utils.parseUnits(collateralAmount, 18);
    const requestCreateParameters: Types.ICreateRequestParameters = {
      requestInfo: {
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          value: borrowingToken,
          network: 'sepolia' as CurrencyTypes.ChainName,
        },
        expectedAmount: loanAmount.toString(),
        payee: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payeeIdentity ?? '',
        },
        payer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payerIdentity ?? '',
        },
        timestamp: Utils.getCurrentTimestampInSecond(),
      },
      paymentNetwork: {
        id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
        parameters: {
          paymentNetworkName: 'sepolia' as CurrencyTypes.ChainName,
          paymentAddress: payeeIdentity ?? '',
          feeAddress: '0xEee3f751e7A044243a407F14e43f69236e12f748',
          feeAmount: '0',
        },
      },
      contentData: {
        creationDate: Utils.getCurrentTimestampInSecond(),
        reason: description ?? '',
        requestType: 'borrow',
        dueDate: '2025.06.16',
        collateralAmount: giveAmount.toString(),
        collateralToken: collateralToken,
        borrowerInfo: {
          firstName: firstName,
          lastName: lastName,
          address: {
            country: country,
            postalCode: postalCode,
            city: city,
            address: address,
          },
          email: email,
        },
      },
      signer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payeeIdentity ?? '',
      },
    };
    const provider = new providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log('Signer:', signer);
    const web3SignatureProvider = new Web3SignatureProvider(provider.provider);
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: 'https://gnosis.gateway.request.network/',
      },
      signatureProvider: web3SignatureProvider,
    });

    console.log('collateraladdress', collateralToken);
    console.log('borrowingaddress', borrowingToken);
    setLoadingMessage('Approve collateral token...');
    await checkAndApproveToken(
      collateralToken,
      payeeIdentity ?? '',
      provider,
      giveAmount.toString() + '0'
    );
    setLoadingMessage('Creating request on the network...');
    const request = await requestClient.createRequest(requestCreateParameters);
    setLoadingMessage('Waiting for request confirmation...');
    const confirmedRequestData = await request.waitForConfirmation();
    console.log('confirmedRequestData', confirmedRequestData);
    const requestID = confirmedRequestData.requestId;
    const salt =
      confirmedRequestData.extensions['pn-erc20-fee-proxy-contract'].values
        .salt;

    const paymentReference = PaymentReferenceCalculator.calculate(
      requestID,
      salt,
      payeeIdentity ?? ''
    );
    const payref = '0x' + paymentReference;
    console.log('payref', payref);
    const contractAddress =
      process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS || '';
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log('contractABI', contractABI);
    console.log('giveamount', giveAmount.toString());
    setLoadingMessage('transferring collateral tokens and borrowing tokens...');
    console.log('borrowingToken', borrowingToken);
    console.log('collateralToken', collateralToken);
    await contract.borrowcallTransferWithFee(
      loanAmount,
      giveAmount,
      payref,
      borrowingToken,
      collateralToken,
      durInSecond(duration),
      totalInstallments
    );
    // await data.wait();
    // console.log('payerIdentity', payerIdentity);
    // console.log('payeeIdentity', payeeIdentity);
    // console.log('data', data.hash);
    // alert('Form submitted successfully');
    setLoadingMessage('successfully borrowed tokens');
    setLoading(false);
  };

  return (
    <div className='w-[100vw] h-[100vh] overflow-x-hidden overflow-y-scroll no-scrollbar'>
      <Navbar />
      {loading && (
        <div className='fixed inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75 z-50'>
          <Spinner />
          <div className='text-white text-xl mt-4'>{loadingMessage}</div>
        </div>
      )}
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
              Create a Borrow Request
            </h1>

            <Input
              label="Borrower's Wallet Address:"
              value={payeeIdentity}
              readOnly
            />

            <div className='w-full justify-between flex space-x-4'>
              <DropdownInput
                options={Object.entries(tokenOptions).map(([value, label]) => ({
                  value,
                  label,
                }))}
                value={borrowingToken}
                onChange={(e) => setBorrowingToken(e.target.value)}
                labelName='Borrowing Token:'
              />
              <Input
                label='Borrowing Amount:'
                type='number'
                value={borrowingAmount}
                onChange={(e) => setBorrowingAmount(e.target.value)}
                required
              />
            </div>

            <div className='w-full justify-between flex space-x-4'>
              <DropdownInput
                options={Object.entries(tokenOptions).map(([value, label]) => ({
                  value,
                  label,
                }))}
                value={collateralToken}
                onChange={(e) => setCollateralToken(e.target.value)}
                labelName='Collateral Token:'
              />
              <Input
                label='Collateral Amount:'
                type='number'
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                required
              />
            </div>

            <div className='flex justify-between mb-4 gap-4'>
              <DropdownInput
                options={durationOptions}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                labelName='Duration:'
                fieldName='Select a duration'
              />
              <Input
                label='Total Installments:'
                type='number'
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
                required
              />
            </div>

            <Input
              label='Description:'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              textarea
            />

            <h2 className='text-xl font mb-4' style={{ color: '#0bb489' }}>
              Borrower Details
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
        <div className='md:w-1/2 p-4 pl-2 h-content relative'>
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
                  To:
                </h2>
                <p>{payeeIdentity}</p>
              </div>
              <div className='mb-6'>
                <h2 className='text-lg font mb-2' style={{ color: '#0bb489' }}>
                  Borrower Details:
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
                <div className='flex justify-between'>
                  <div>
                    <p className='mb-2'>Borrowed Token: {borrowingToken}</p>
                    <p className='mb-2'>Collateral Token: {collateralToken}</p>
                    <p className='mb-2'>Description: {description}</p>
                    <p className='mb-2'>Payment Frequency: {duration}</p>
                    {totalInstallments && (
                      <p className='mb-2'>
                        Total Installments: {totalInstallments}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className='mb-2'>Borrowed Amount: {borrowingAmount}</p>
                    <p className='mb-2'>
                      Collateral Amount: {collateralAmount}
                    </p>
                  </div>
                </div>
                {totalInterest && totalAmount && (
                  <div className='mt-4'>
                    <h3
                      className='text-lg font mb-2'
                      style={{ color: '#0bb489' }}
                    >
                      Calculation Breakdown:
                    </h3>
                    <div className='flex justify-between'>
                      <div className='w-1/2'>
                        <p className='mb-2'>
                          Principal Amount: {borrowingAmount}
                        </p>
                        <p className='mb-2'>Interest Rate: 12% per annum</p>
                        <p className='mb-2'>
                          Total Amount per installment:{' '}
                          {calculateTotalPayment(
                            borrowingAmount,
                            duration,
                            totalInstallments
                          )}
                        </p>
                      </div>
                      <div className='w-1/2'>
                        <p className='mb-2'>Total Interest: {totalInterest}</p>
                        <p className='mb-2'>Total Amount: {totalAmount}</p>
                      </div>
                    </div>
                  </div>
                )}
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
                Contact us at jinesh4249@gmail.com
              </p>
            </div>
          </div>
          {isBrowser && (
            <PDFDownloadLink
              document={
                <InvoiceDocument
                  issuedDate={issuedDate}
                  payeeIdentity={payeeIdentity}
                  firstName={firstName}
                  lastName={lastName}
                  email={email}
                  address={address}
                  city={city}
                  postalCode={postalCode}
                  country={country}
                  borrowingToken={borrowingToken}
                  borrowingAmount={borrowingAmount}
                  description={description}
                  tokenOptions={tokenOptions}
                />
              }
              fileName='invoice_borrow.pdf'
              className='absolute bottom-10 right-10 py-2 px-4 text-white rounded'
              style={{ backgroundColor: '#0bb489' }}
            >
              Download Invoice
            </PDFDownloadLink>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
