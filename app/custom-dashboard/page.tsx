'use client';
import { useEffect, useRef, useState } from 'react';
import { config } from '@/utils/config';
import { useAppContext } from '@/utils/context';
import { InvoiceDashboardProps } from '@/types';
import { useConnectWallet } from '@web3-onboard/react';
import { RequestNetwork, Types } from '@requestnetwork/request-client.js';
import { wagmiConfig } from '@/utils/connectWallet';
import Navbar from '@/components/Navbar';
import { ethers } from "ethers";
import { Address } from 'viem';

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
                    <button className='bg-red-500 text-white py-1 px-2 rounded'>
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
