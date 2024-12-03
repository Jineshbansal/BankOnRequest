'use client';
import { useEffect, useRef, useState } from 'react';
import { config } from '@/utils/config';
import { useAppContext } from '@/utils/context';
import { InvoiceDashboardProps } from '@/types';
import { useConnectWallet } from '@web3-onboard/react';
import { RequestNetwork, Types } from '@requestnetwork/request-client.js';
import { wagmiConfig } from '@/utils/connectWallet';
import Navbar from '@/components/Navbar';

export default function InvoiceDashboard() {
  const [{ wallet }] = useConnectWallet();
  const { requestNetwork } = useAppContext();
  const [invoices, setInvoices] = useState<any[]>([]);

  const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: 'https://sepolia.gateway.request.network/',
    },
  });

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
          //   console.log('requestDatas', requestDatas);
        });
    }
  }, [wallet, requestNetwork]);

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
                <td className='py-2 px-4 border-b'>{invoice.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
