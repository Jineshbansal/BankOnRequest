'use client';
import('@requestnetwork/create-invoice-form');
import { useEffect, useRef } from 'react';
import { config } from '@/utils/config';
import { useAppContext } from '@/utils/context';
import { CreateInvoiceFormProps } from '@/types';
import Navbar from '@/components/Navbar';
import { wagmiConfig } from '@/utils/connectWallet';

export default function CreateInvoice() {
  const formRef = useRef<CreateInvoiceFormProps>(null);
  const { wallet, requestNetwork } = useAppContext();

  useEffect(() => {
    if (formRef.current) {
      formRef.current.config = config;

      if (wallet && requestNetwork) {
        formRef.current.signer = wallet.accounts[0].address;
        formRef.current.requestNetwork = requestNetwork;
        formRef.current.wagmiConfig = wagmiConfig;
        // console.log(formRef.current.signer);
      }
    }
  }, [wallet, requestNetwork]);

  return (
    <>
      <Navbar />
      <div className='container m-auto  w-[100%] py-5'>
        {/* <CreateInvoiceForm
          config={config}
          currencies={currencies}
          wagmiConfig={wconfig}
          requestNetwork={requestNetwork}
        /> */}
        <create-invoice-form ref={formRef} />
      </div>
    </>
  );
}
