import { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import { WalletState } from '@web3-onboard/core/dist/types';
import { RequestNetwork, Types } from '@requestnetwork/request-client.js';
import { IRequestDataWithEvents } from '@requestnetwork/request-client.js/dist/types';

type UseRequestNetworkResult = {
  wallets: WalletState | undefined;
  getRequestFromId: (
    requestId: string | undefined
  ) => Promise<IRequestDataWithEvents> | undefined;
  fetchAllRequests: () => Promise<IRequestDataWithEvents[] | undefined>;
  isLoading: boolean;
};

export function useRequestNetwork(): UseRequestNetworkResult {
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  const [wallets, setWallets] = useState<WalletState>();
  const [{ wallet }] = useConnectWallet();

  const requestClient = useMemo(() => {
    return new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: 'https://gnosis.gateway.request.network',
      },
    });
  }, []);

  // Get a request from its ID
  const getRequestFromId = useCallback(
    async (requestId: string | undefined): Promise<IRequestDataWithEvents> => {
      if (!requestId) {
        throw new Error('Request ID is required');
      }
      const request = (await requestClient.fromRequestId(
        requestId
      )) as unknown as IRequestDataWithEvents;
      return request;
    },
    [requestClient]
  );

  // Fetch all requests
  const fetchAllRequests = useCallback(async () => {
    setIsLoading(true);

    try {
      if (!wallets?.accounts[0].address) {
        throw new Error('No wallet address found');
      }
      const fetchedRequests = await requestClient.fromIdentity({
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: wallets.accounts[0].address,
      });

      const requestData = await Promise.all(
        fetchedRequests.map(async (request) => await request.getData())
      );

      return requestData;
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [requestClient, wallets]);

  useEffect(() => {
    if (wallet?.provider) {
      setWallets(wallet);
    }
  }, [wallet]);

  return {
    wallets,
    getRequestFromId,
    fetchAllRequests,
    isLoading,
  };
}
