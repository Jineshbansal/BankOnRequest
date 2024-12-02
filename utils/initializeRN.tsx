import { RequestNetwork } from '@requestnetwork/request-client.js';
import { Web3SignatureProvider } from '@requestnetwork/web3-signature';
import { getTheGraphClient } from '@requestnetwork/payment-detection';

export const initializeRequestNetwork = (setter: any, walletClient: any) => {
  try {
    const web3SignatureProvider = new Web3SignatureProvider(walletClient);

    const requestNetwork = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: 'https://gnosis.gateway.request.network/',
      },
      signatureProvider: web3SignatureProvider,
      httpConfig: {
        getConfirmationMaxRetry: 120,
      },
      paymentOptions: {
        getSubgraphClient: (chain: string) => {
          const paymentsSubgraphUrl =
            chain === 'mainnet'
              ? process.env.NEXT_PUBLIC_PAYMENTS_SUBGRAPH_URL_MAINNET
              : chain === 'sepolia'
              ? process.env.NEXT_PUBLIC_PAYMENTS_SUBGRAPH_URL_SEPOLIA
              : undefined;
          if (!paymentsSubgraphUrl) {
            throw new Error(
              `Cannot get subgraph client for unknown chain: ${chain}`
            );
          }
          return getTheGraphClient(chain, paymentsSubgraphUrl);
        },
      },
    });

    setter(requestNetwork);
  } catch (error) {
    console.error('Failed to initialize the Request Network:', error);
    setter(null);
  }
};
