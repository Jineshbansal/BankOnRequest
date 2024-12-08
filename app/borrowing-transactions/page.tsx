'use client';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/utils/context';
import { useConnectWallet } from '@web3-onboard/react';
import { RequestNetwork } from '@requestnetwork/request-client.js';
import Navbar from '@/components/Navbar';
import { ethers } from 'ethers';
import contractABI from '@/utils/contractAbi';
import { providers } from 'ethers';
import {
  Types,
  Utils,
  PaymentReferenceCalculator,
} from '@requestnetwork/request-client.js';
import { Web3SignatureProvider } from '@requestnetwork/web3-signature';
import checkAndApproveToken from '@/utils/checkAndApproveToken';
import tokenOptions2 from '@/utils/tokenOptions2';
import Spinner from '@/components/spinner';

export default function InvoiceDashboard() {
  const [{ wallet }] = useConnectWallet();
  const { requestNetwork } = useAppContext();
  const [activeTab, setActiveTab] = useState('active');
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [previousRequests, setPreviousRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [count, setCount] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [selectedCollateralToken, setSelectedCollateralToken] = useState<
    string | null
  >(null);

  const contractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS || '';

  const handleDeposit = async (
    borrowingToken: string,
    collateralToken: string
  ) => {
    console.log('deposit');
    setLoading(true);
    setLoadingMessage('checking details of loan...');
    try
    {

      const provider = new providers.Web3Provider(window.ethereum);
      const payerIdentity = wallet?.accounts[0].address;
      const payeeIdentity = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const loanAmount = await contract.principal_amount_borrow(
        borrowingToken,
        collateralToken
      );
      const loan = await contract.getLoan(
        payerIdentity,
        borrowingToken,
        collateralToken
      );
      console.log('borrowing', borrowingToken);
      console.log('collateral', collateralToken);
      if (loanAmount == 0) {
        alert('you donot loan any money from us');
        return;
      }
      setLoadingMessage('Creating repay loan request...');
      
      console.log('loanAmount', loan);
      const requestCreateParameters = {
        requestInfo: {
          currency: {
            type: Types.RequestLogic.CURRENCY.ERC20,
            value: borrowingToken,
            network: 'sepolia',
          },
          expectedAmount: loanAmount.toString(),
          payee: {
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: payeeIdentity ?? '',
          },
          payer: {
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: payerIdentity ?? '',
          },
          timestamp: Utils.getCurrentTimestampInSecond(),
        },
        paymentNetwork: {
          id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
          parameters: {
            paymentNetworkName: 'sepolia',
            paymentAddress: payeeIdentity ?? '',
            feeAddress: '0xEee3f751e7A044243a407F14e43f69236e12f748',
            feeAmount: '0',
          },
        },
        contentData: {
          creationDate: Utils.getCurrentTimestampInSecond(),
          requestType: 'borrow',
          reason: 'deposit',
          dueDate: '2025.06.16',
          collateralToken: collateralToken,
          collateralAmount: loan.collateralAmount.toString(),
        },
        signer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payerIdentity ?? '',
        },
      };
      console.log('requestCreateParameters', requestCreateParameters);
      const web3SignatureProvider = new Web3SignatureProvider(provider.provider);
      const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: 'https://sepolia.gateway.request.network/',
        },
        signatureProvider: web3SignatureProvider,
      });

      const request = await requestClient.createRequest(requestCreateParameters);
      setLoadingMessage('Waiting for Confirmation...');
      console.log('request', request);
      const confirmedRequestData = await request.waitForConfirmation();
      const requestID = confirmedRequestData.requestId;
      console.log('requestID', requestID);
      const salt =
        confirmedRequestData.extensions['pn-erc20-fee-proxy-contract'].values
          .salt;
      const paymentReference = PaymentReferenceCalculator.calculate(
        requestID,
        salt,
        payeeIdentity ?? ''
      );
      console.log('paymentReferenceCalculator', paymentReference);
      console.log('confirmed Request Data:', confirmedRequestData);
      console.log('Request Parameters:', requestCreateParameters);
      setLoadingMessage('Checking and Approving Token...');
      await checkAndApproveToken(
        borrowingToken,
        payerIdentity ?? '',
        provider,
        loanAmount.toString() + '0'
      );
      const payref = '0x' + paymentReference;
      console.log('payref', payref);
      if(borrowingToken == '0x0000000000000000000000000000000000000000'){
        const data = await contract.repayLoanWithEthereum(
          payref,
          borrowingToken,
          collateralToken,
          {
            value: (loanAmount/10).toString(),
          }

        );
        await data.wait();

        setLoadingMessage('Deposit Successful');
        setLoading(false);
        setCount(count + 1);
        return;
      }

      if(borrowingToken == '0x0000000000000000000000000000000000000001'){

      }
      const data = await contract.repayLoan(
        payref,
        borrowingToken,
        collateralToken
      );
      await data.wait();
      console.log('payerIdentity', payerIdentity);
      console.log('payeeIdentity', payeeIdentity);
      console.log('data', data.hash);
    
      setLoadingMessage('Deposit Successful');
    }
    catch (error) {
    console.error('Error during withdrawal:', error);
    alert('An error occurred during withdrawal.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
    

    console.log('count', count);
    setCount((prevCount) => prevCount + 1);
    console.log('count', count);
  };

  
  const handleDropdownSelect = (token: string) => {
    setSelectedToken(token);
    setShowDropdown(false);
    if (selectedCollateralToken) {
      handleDeposit(token, selectedCollateralToken);
    } else {
      console.error('Collateral token is null');
    }
  };

  const handleActionClick = (collateralToken: string) => {
    setSelectedCollateralToken(collateralToken);
    setShowDropdown(true);
  };

  const handleCancelDropdown = () => {
    setShowDropdown(false);
  };

  useEffect(() => {
    if (wallet) {
      setLoading(true);
      setLoadingMessage('Fetching requests...');
      console.log()
      requestNetwork
        ?.fromIdentity({
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: wallet?.accounts[0].address.toLowerCase() as string,
        })
        .then((requests) => {
          const requestDatas = requests.map((request) => request.getData());
          console.log('requestDatas', requestDatas);
          console.log('wallet address', wallet?.accounts[0].address.toLowerCase());
          const filteredRequests = requestDatas.filter(
            (request) =>
              request.contentData.requestType === 'borrow' &&
              ( 
                request.payee?.value.toLowerCase()===(process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS || '').toLowerCase()
                ||
                request.payer?.value.toLowerCase() ===(process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS || '').toLowerCase()
              )
          );
          console.log('filteredRequests', filteredRequests);

          const active = filteredRequests.filter(
            (invoice) =>
              invoice.payee?.value.toLowerCase() ===
              wallet.accounts[0].address.toLowerCase()
          );

          const previous = filteredRequests.filter(
            (invoice) =>
              invoice.payer?.value.toLowerCase() ===
              wallet.accounts[0].address.toLowerCase()
          );
          console.log('size:', previous.length);
          const map = previous.reduce((acc, current) => {
            const key = `${current.currencyInfo.value}-${current.contentData.collateralToken}`;
            const creationDate = current.contentData.creationDate;
          
            // If the key doesn't exist in the map, or the new creationDate is larger, update the map
            if (!acc.has(key) || creationDate > acc.get(key)) {
              acc.set(key, creationDate);
            }
          
            return acc;
          }, new Map());
          
          const result = Array.from(map.entries());
          console.log("Result:", result);
          

          const updatedActive = active.filter((activeRequest) => {
            const key = `${activeRequest.currencyInfo.value}-${activeRequest.contentData.collateralToken}`;
            const maxCreationDateForPair = map.get(key);
          
            // Check if maxCreationDateForPair exists in the map and compare the creationDate
            return maxCreationDateForPair ? activeRequest.contentData.creationDate > maxCreationDateForPair : true;
          });
          
          console.log('active', active);
          console.log('previous', previous);
          console.log('updatedActive', updatedActive);

          setActiveRequests(updatedActive);
          setPreviousRequests(previous);
        });
      setLoading(false);
    }
  }, [wallet, requestNetwork, count]);

  const dataSource = (
    activeTab === 'active' ? activeRequests : previousRequests
  ).map((invoice, index) => ({
    key: index,
    created: new Date(invoice.timestamp * 1000).toLocaleDateString(),
    paymentNetwork: invoice.currencyInfo.network,
    token: invoice.currencyInfo.value,
    amount: (invoice.expectedAmount / 1e18).toString(),
    collateralToken: invoice.contentData.collateralToken,
    collateralAmount: (invoice.contentData.collateralAmount / 1e18).toString(),
    actionType: activeTab === 'active' ? 'Deposit' : 'Completed',
    requestId: `${invoice.requestId.slice(0, 4)}...${invoice.requestId.slice(
      -3
    )}`,
    orgrequestId: invoice.requestId,
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
                <th className='py-2 pr-32 border-b text-left'>Amount</th>
                <th className='py-2 pr-32 border-b text-left'>CollateralTkn</th>
                <th className='py-2 px-4 border-b text-left'>CollateralAmt</th>
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
                  collateralToken: string;
                  collateralAmount: string;
                  actionType: string;
                  requestId: string;
                  orgrequestId: string;
                }) => (
                  <tr
                    key={invoice.key}
                    className='hover:bg-gray-100 transition duration-300 ease-in-out'
                  >
                    <td className='py-2 px-4 border-b text-left'>
                      {invoice.created}
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      <a href={`https://scan.request.network/request/${invoice.orgrequestId}`}>
                        {invoice.requestId}
                      </a>
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      {invoice.paymentNetwork}
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      {tokenOptions2[invoice.token as keyof typeof tokenOptions2]}
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      {invoice.amount}
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      {
                        tokenOptions2[
                          invoice.collateralToken as keyof typeof tokenOptions2
                        ]
                      }
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      {invoice.collateralAmount}
                    </td>
                    <td className='py-2 px-4 border-b text-left'>
                      {activeTab === 'active' ? (
                        <button
                          className='px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105'
                          onClick={() =>
                            handleActionClick(invoice.collateralToken)
                          }
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
        {showDropdown && (
          <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50'>
            <div className='w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'>
              <div
                className='py-1'
                role='menu'
                aria-orientation='vertical'
                aria-labelledby='options-menu'
              >
                {Object.keys(tokenOptions2).map((token) => (
                  <button
                    key={token}
                    className='w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    role='menuitem'
                    onClick={() => handleDropdownSelect(token)}
                  >
                    {tokenOptions2[token as keyof typeof tokenOptions2]}
                  </button>
                ))}
                <button
                  className='w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  role='menuitem'
                  onClick={handleCancelDropdown}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
