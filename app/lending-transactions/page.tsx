'use client';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/utils/context';
import { useConnectWallet } from '@web3-onboard/react';
import { RequestNetwork } from '@requestnetwork/request-client.js';
import Navbar from '@/components/Navbar';
import { ethers } from 'ethers';
import contractABI from '@/utils/contractAbi';
import { providers, utils } from 'ethers';
import {
  Types,
  Utils,
  PaymentReferenceCalculator,
} from '@requestnetwork/request-client.js';
import { Web3SignatureProvider } from '@requestnetwork/web3-signature';
import tokenOptions from '@/utils/tokenOptions';
import Spinner from '@/components/spinner';

export default function InvoiceDashboard() {
  const [{ wallet }] = useConnectWallet();
  const { requestNetwork } = useAppContext();
  const [activeTab, setActiveTab] = useState('active');
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [previousRequests, setPreviousRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const contractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS || '';

  const handleWithdraw = async () => {
    setLoading(true);
    setLoadingMessage('Processing withdrawal...');
    try {
      console.log('withdraw');
      const provider = new providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_accounts', []);
      console.log('Accounts:', accounts);
      const payerIdentity = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
      const payeeIdentity = wallet?.accounts[0].address || '';

      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const lendAmount = await contract.amount_deposit();
      console.log('lendAmount', lendAmount);
      if (lendAmount == 0) {
        alert('you donot lend any money to us');
        setLoading(false);
        setLoadingMessage('');
        return;
      }

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
          creationDate: Utils.getCurrentTimestampInSecond(),
          requestType: 'lend',
          reason: 'withdraw',
          dueDate: '2023.06.16',
        },
        signer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payeeIdentity,
        },
      };

      const web3SignatureProvider = new Web3SignatureProvider(
        provider.provider
      );
      const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: 'https://gnosis.gateway.request.network/',
        },
        signatureProvider: web3SignatureProvider,
      });
      const request = await requestClient.createRequest(
        requestCreateParameters
      );
      setLoadingMessage('Waiting for request confirmation...');
      const confirmedRequestData = await request.waitForConfirmation();
      const requestID = confirmedRequestData.requestId;
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
      setLoadingMessage('Withdrawal successful.');
    } catch (error) {
      console.error('Error during withdrawal:', error);
      alert('An error occurred during withdrawal.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  useEffect(() => {
    if (wallet) {
      setLoading(true);
      setLoadingMessage('Fetching requests...');
      requestNetwork
        ?.fromIdentity({
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: wallet?.accounts[0].address.toLowerCase() as string,
        })
        .then((requests) => {
          const requestDatas = requests.map((request) => request.getData());
          const filteredRequests = requestDatas.filter(
            (request) =>
              request.contentData.requestType === 'lend' &&
              (request.payer?.value.toLowerCase() ===
                wallet.accounts[0].address.toLowerCase() ||
                request.payee?.value.toLowerCase() ===
                  wallet.accounts[0].address.toLowerCase())
          );
          console.log('karan', requestDatas);
          console.log('filteredRequests', filteredRequests);

          const active = filteredRequests.filter(
            (invoice) =>
              invoice.payer?.value.toLowerCase() ===
              wallet.accounts[0].address.toLowerCase()
          );

          const previous = filteredRequests.filter(
            (invoice) =>
              invoice.payee?.value.toLowerCase() ===
              wallet.accounts[0].address.toLowerCase()
          );

          console.log('active', active);
          console.log('previous', previous);

          const updatedActive = active.filter(
            (activeRequest) =>
              previous.length === 0 ||
              previous.some(
                (previousRequest) =>
                  !(
                    activeRequest.contentData.creationDate <
                      previousRequest.contentData.creationDate &&
                    activeRequest.currencyInfo.value ===
                      previousRequest.currencyInfo.value
                  )
              )
          );

          console.log('updatedActive', updatedActive);

          setActiveRequests(updatedActive);
          setPreviousRequests(previous);
        })
        .finally(() => {
          setLoading(false);
          setLoadingMessage('');
        });
    }
  }, [wallet, requestNetwork]);

  const dataSource = (
    activeTab === 'active' ? activeRequests : previousRequests
  ).map((invoice, index) => ({
    key: index,
    created: new Date(invoice.timestamp * 1000).toLocaleDateString(),
    paymentNetwork: invoice.currencyInfo.network,
    token: invoice.currencyInfo.value,
    amount: (invoice.expectedAmount / 1e18).toString(),
    actionType: activeTab === 'active' ? 'Withdraw' : 'Completed',
    requestId: `${invoice.requestId.slice(0, 4)}...${invoice.requestId.slice(
      -3
    )}`,
  }));

  return (
    <div className='w-[100vw] h-[100vh] overflow-x-hidden overflow-y-scroll no-scrollbar bg-[f3f4f6]'>
      <Navbar />
      {loading && (
        <div className='fixed inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75 z-50'>
          <Spinner />
          <div className='text-white text-xl mt-4'>{loadingMessage}</div>
        </div>
      )}
      <div className='container mx-auto p-4'>
        <div className='flex justify-center mb-4'>
          <button
            className={`px-4 py-2 mx-2 rounded-full ${
              activeTab === 'active'
                ? 'bg-[#0bb489] text-white'
                : 'bg-white text-[#0bb489]'
            } transition duration-300 ease-in-out transform hover:scale-105`}
            onClick={() => setActiveTab('active')}
          >
            Active Transactions
          </button>
          <button
            className={`px-4 py-2 mx-2 rounded-full ${
              activeTab === 'previous'
                ? 'bg-[#0bb489] text-white'
                : 'bg-white text-[#0bb489]'
            } transition duration-300 ease-in-out transform hover:scale-105`}
            onClick={() => setActiveTab('previous')}
          >
            Previous Transactions
          </button>
        </div>
        <div className='overflow-x-auto shadow-lg rounded-lg bg-white'>
          <table className='min-w-full'>
            <thead className='bg-[#0bb489] text-white'>
              <tr>
                <th className='py-2 px-4 border-b text-left'>Created</th>
                <th className='py-2 px-4 border-b text-left'>Request ID</th>
                <th className='py-2 px-2 border-b text-left'>
                  Payment Network
                </th>
                <th className='py-2 pr-32 border-b text-left'>Token</th>
                <th className='py-2 px-4 border-b text-left'>Amount</th>
                <th className='py-2 px-4 border-b text-left'>Action</th>
              </tr>
            </thead>
            <tbody>
              {dataSource.map(
                (invoice: {
                  key: number;
                  created: string;
                  paymentNetwork: string;
                  token: string;
                  amount: string;
                  actionType: string;
                  requestId: string;
                }) => (
                  <tr
                    key={invoice.key}
                    className='hover:bg-gray-100 transition duration-300 ease-in-out'
                  >
                    <td className='py-2 px-4 border-b text-left'>
                      {invoice.created}
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      {invoice.requestId}
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      {invoice.paymentNetwork}
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      {tokenOptions[invoice.token as keyof typeof tokenOptions]}
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      {invoice.amount}
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      {activeTab === 'active' ? (
                        <button
                          className='px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105'
                          onClick={() => handleWithdraw()}
                        >
                          {invoice.actionType}
                        </button>
                      ) : (
                        <span className='px-4 py-2 bg-gray-300 text-gray-700 rounded-full'>
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
