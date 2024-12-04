'use client';
import { useEffect, useRef, useState } from 'react';
import { config } from '@/utils/config';
import { useAppContext } from '@/utils/context';
import { InvoiceDashboardProps } from '@/types';
import { useConnectWallet } from '@web3-onboard/react';
import { RequestNetwork } from '@requestnetwork/request-client.js';
import { wagmiConfig } from '@/utils/connectWallet';
import Navbar from '@/components/Navbar';
import { ethers } from "ethers";
import { Address } from 'viem';
import contractABI from '@/utils/contractAbi';
import { providers, utils } from 'ethers';
import { Types, Utils , PaymentReferenceCalculator} from '@requestnetwork/request-client.js';
import { Web3SignatureProvider } from '@requestnetwork/web3-signature';

export default function InvoiceDashboard() {
  const [{ wallet }] = useConnectWallet();
  const { requestNetwork } = useAppContext();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesByCurrency, setInvoicesByCurrency] = useState<{
    [key: string]: any[];
  }>({});
  const [borrowedMoney, setBorrowedMoney] = useState<{ [key: string]: number }>(
    {}
  );
  const [depositedMoney, setDepositedMoney] = useState<{ [key: string]: number }>(
    {}
  );
  const handleWithdraw = async() => {
    console.log('withdraw');
    const contractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
    console.log('contractAddress:', contractAddress);

    const provider = new providers.Web3Provider(window.ethereum);
    const accounts = await provider.send('eth_accounts', []);
    console.log('Accounts:', accounts);
    const payerIdentity = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
    const payeeIdentity = wallet?.accounts[0].address;

    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const lendAmount=await contract.amount_deposit()
    console.log('lendAmount', lendAmount);
    if(lendAmount==0){alert("you donot lend any money to us");return;}

    const requestCreateParameters = {
      requestInfo: {
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          value: '0x1d87Fc9829d03a56bdb5ba816C2603757f592D82',
          network: 'sepolia',
        },
        expectedAmount: lendAmount.toString(),
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
        reason: "withdraw",
        dueDate: '2023.06.16',
      },
      signer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payeeIdentity,
      },
    };
    

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
    
    const payref = '0x' + paymentReference;
    console.log('payref', payref);
    const data = await contract.withdraw(payref);
    await data.wait();
    console.log('payerIdentity', payerIdentity);
    console.log('payeeIdentity', payeeIdentity);
    console.log('data', data.hash);
    alert('Form submitted successfully');

  };

  useEffect(() => {
    if (wallet) {
      requestNetwork
        ?.fromIdentity({
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: wallet?.accounts[0].address.toLowerCase() as string,
        })
        .then((requests) => {
          const requestDatas = requests.map((request) => request.getData());
          setInvoices(requestDatas);

          const groupedByCurrency = requestDatas.reduce((acc, invoice) => {
            const currency = invoice.currencyInfo.type;
            if (!acc[currency]) {
              acc[currency] = [];
            }
            acc[currency].push(invoice);
            return acc;
          }, {} as { [key: string]: any[] });

          setInvoicesByCurrency(groupedByCurrency);
          console.log('groupedByCurrency', groupedByCurrency);

          const borrowedMoneyTemp = requestDatas.reduce((acc, invoice) => {
            const currency = invoice.currencyInfo.type;
            if (
              invoice.payee?.value.toLowerCase() === wallet?.accounts[0].address.toLowerCase()
            ) {
              console.log('amount', invoice.expectedAmount);
              if (!acc[currency]) {
                acc[currency] = 0;
              }
              acc[currency] += Number(invoice.expectedAmount);
            }
            return acc;
          }, {} as { [key: string]: number });

          setBorrowedMoney(borrowedMoneyTemp);
          console.log('borrowedMoney', borrowedMoneyTemp);

          const depositedMoneyTemp = requestDatas.reduce((acc, invoice) => {
            const currency = invoice.currencyInfo.type;
            if (
              invoice.payer?.value.toLowerCase() === wallet?.accounts[0].address.toLowerCase()
            ) {
              console.log('amount', invoice.expectedAmount);
              if (!acc[currency]) {
                acc[currency] = 0;
              }
              acc[currency] += Number(invoice.expectedAmount);
            }
            return acc;
          }, {} as { [key: string]: number });

          setDepositedMoney(depositedMoneyTemp);
          console.log('depositedMoney', depositedMoneyTemp);
            console.log('requestDatas', requestDatas);
        });
    }
  }, [wallet, requestNetwork]);
  
  return (
    <div className='container m-auto w-[100%] h-screen'>
      <Navbar />
      <div className='mt-8 flex justify-center'>
        <table className='min-w-full bg-white text-center'>
          <thead>
            <tr>
              <th className='py-2 px-4 border-b'>Currency</th>
              <th className='py-2 px-4 border-b'>Amount</th>
              <th className='py-2 px-4 border-b'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(invoicesByCurrency).map((currency, index) => (
              <tr key={index}>
                <td className='py-2 px-4 border-b'>{currency}</td>
                <td className='py-2 px-4 border-b'>
                  {Math.abs((depositedMoney[currency] || 0) - (borrowedMoney[currency] || 0))}
                </td>
                <td className='py-2 px-4 border-b'>
                  {(depositedMoney[currency] || 0) > (borrowedMoney[currency] || 0) ? (
                    <button className='bg-red-500 text-white py-1 px-2 rounded' 
                    onClick={handleWithdraw}>
                      Withdraw
                    </button>
                  ) : (
                    <button className='bg-blue-500 text-white py-1 px-2 rounded'>
                      Deposit
                    </button>
                  )}
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
