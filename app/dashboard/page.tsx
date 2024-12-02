'use client';
import('@requestnetwork/invoice-dashboard');
import { useEffect, useRef } from 'react';
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
  const dashboardRef = useRef<InvoiceDashboardProps>(null);

  const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: 'https://sepolia.gateway.request.network/',
    },
  });

  useEffect(() => {
    if (dashboardRef.current) {
      dashboardRef.current.config = config;
      if (wallet && requestNetwork) {
        dashboardRef.current.wallet = wallet;
        dashboardRef.current.requestNetwork = requestNetwork;
        dashboardRef.current.wagmiConfig = wagmiConfig;
      }
    }
  }, [wallet, requestNetwork]);

  return (
    <div className='container m-auto w-[100%] h-screen'>
      <Navbar />
      <invoice-dashboard ref={dashboardRef} />
    </div>
  );
}
