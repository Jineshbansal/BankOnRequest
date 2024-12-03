'use client';
import { useEffect, useRef, useState } from 'react';
import { config } from '@/utils/config';
import { useAppContext } from '@/utils/context';
import { InvoiceDashboardProps } from '@/types';
import { useConnectWallet } from '@web3-onboard/react';
import { RequestNetwork, Types } from '@requestnetwork/request-client.js';
import { wagmiConfig } from '@/utils/connectWallet';
import Navbar from '@/components/Navbar';
import Web3 from "web3";
import { ethers } from "ethers";
import { Address } from 'viem';

export default function InvoiceDashboard() {
  const [{ wallet }] = useConnectWallet();
  const { requestNetwork } = useAppContext();
  const [invoices, setInvoices] = useState<any[]>([]);
  const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: 'https://sepolia.gateway.request.network/',
    },
  });
  const contractABI=[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "paymentReference",
          "type": "bytes"
        }
      ],
      "name": "callTransferWithFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "PaymentReceived",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokensApproved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "proxy",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "feeAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "feeRecipient",
          "type": "address"
        }
      ],
      "name": "TransferWithFeeExecuted",
      "type": "event"
    },
    {
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    },
    {
      "inputs": [],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  const contractAddress=process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;


  useEffect(() => {
    if (wallet) {
      requestNetwork
        ?.fromIdentity({
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: wallet?.accounts[0].address as string,
        })
        .then((requests) => {
          const requestDatas = requests.map((request) => request.getData());
          setInvoices(requestDatas);
            console.log('requestDatas', requestDatas);
        });
    }
  }, [wallet, requestNetwork]);
  const payIt = async (expectedAmount:String,payerIdentity:Address,payeeIdentity:Address) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const tokenAddress="0x1d87Fc9829d03a56bdb5ba816C2603757f592D82"
    const data = await contract.callTransferWithFee(tokenAddress, contractAddress, expectedAmount, "0x00"); 
    await data.wait();
    console.log('payerIdentity', payerIdentity);
    console.log('payeeIdentity', payeeIdentity);
    console.log('data', data.hash);
  };
  return (
    <div className='container m-auto w-[100%] h-screen'>
      <Navbar />
      <div className='mt-8'>
        <table className='min-w-full bg-white'>
          <thead>
            <tr>
              <th className='py-2 px-4 border-b'>Created</th>
              <th className='py-2 px-4 border-b'>Invoice #</th>
              <th className='py-2 px-4 border-b'>Payee</th>
              <th className='py-2 px-4 border-b'>Payer</th>
              <th className='py-2 px-4 border-b'>Expected Amount</th>
              <th className='py-2 px-4 border-b'>Payment Network</th>
              <th className='py-2 px-4 border-b'>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={index}>
                <td className='py-2 px-4 border-b'>
                  {invoice.contentData.creationDate}
                </td>
                <td className='py-2 px-4 border-b'>
                  {invoice.contentData.invoiceNumber}
                </td>
                <td className='py-2 px-4 border-b'>{invoice.payee.value}</td>
                <td className='py-2 px-4 border-b'>{invoice.payer.value}</td>
                <td className='py-2 px-4 border-b'>{invoice.expectedAmount}</td>
                <td className='py-2 px-4 border-b'>{invoice.cuurrency}</td>
                <button onClick={()=>payIt(invoice.expectedAmount,invoice.payer.value,invoice.payee.value)}>

                  <td className='py-2 px-4 border-b'>{invoice.state}</td>
                </button>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
