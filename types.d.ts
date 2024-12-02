import { IConfig } from '@requestnetwork/shared';
import { WalletState } from '@web3-onboard/core';
import type { RequestNetwork } from '@requestnetwork/request-client.js';
import { Config as WagmiConfig } from 'wagmi';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'invoice-dashboard': InvoiceDashboardElement;
      'create-invoice-form': CreateInvoiceFormElement;
    }
  }
}

interface InvoiceDashboardElement {
  ref?: React.Ref<InvoiceDashboardProps>;
}

interface CreateInvoiceFormElement {
  ref?: React.Ref<CreateInvoiceFormProps>;
}

interface InvoiceDashboardProps extends HTMLElement {
  config: IConfig;
  wallet: WalletState;
  requestNetwork: RequestNetwork;
  wagmiConfig: WagmiConfig;
}

interface CreateInvoiceFormProps extends HTMLElement {
  config: IConfig;
  signer: string;
  requestNetwork: RequestNetwork;
  wagmiConfig: WagmiConfig;
}

declare global {
  interface Window {
    ethereum: any;
  }
}
