'use client';
import React, { useState } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import { Types, Utils } from '@requestnetwork/request-client.js';
import { BigNumber, providers,utils } from "ethers";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { RequestNetwork,PaymentReferenceCalculator } from "@requestnetwork/request-client.js"
import { ethers } from "ethers";

const App = () => {
  const [currency, setCurrency] = useState("0x1d87Fc9829d03a56bdb5ba816C2603757f592D82");
  const [network, setNetwork] = useState("sepolia");
  const [expectedAmount, setExpectedAmount] = useState("1");
  const [paymentNetworkName, setPaymentNetworkName] = useState("sepolia");
  const [feeRecipient, setFeeRecipient] = useState("");
  const [feeAmount, setFeeAmount] = useState("0");
  const [reason, setReason] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [{ wallet }] = useConnectWallet();
  const payerIdentity = "0xEee3f751e7A044243a407F14e43f69236e12f748";
  const payeeIdentity = wallet?.accounts[0].address;
  console.log("payeeIdentity:",payeeIdentity);
  console.log("payerIdentity:",payerIdentity);

  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("payeeIdentity:",payeeIdentity);
    console.log("payerIdentity:",payerIdentity);
    const loanAmount = ethers.utils.parseUnits(expectedAmount, 18);
    const requestCreateParameters = {
      requestInfo: {
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          value: '0x1d87Fc9829d03a56bdb5ba816C2603757f592D82',
          network: 'sepolia',
        },
        expectedAmount: loanAmount,
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
        reason: reason,
        dueDate: '2023.06.16',
      },
      signer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payeeIdentity,
      },
    };
    const provider = new providers.Web3Provider(window.ethereum);
    console.log("provider", provider);
    const accounts = await provider.send("eth_accounts", []);
    console.log("Accounts:", accounts);

    const signer = provider.getSigner();
    console.log('Signer:', signer);
  
    const web3SignatureProvider = new Web3SignatureProvider(provider.provider);
    console.log("Web3SignatureProvider initialized:", web3SignatureProvider);
    
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: { 
        baseURL: "https://gnosis.gateway.request.network/",
      },
      signatureProvider: web3SignatureProvider,
    });
    console.log("request Client:", requestClient);
    console.log("request create parameters", requestCreateParameters);
    const request = await requestClient.createRequest(requestCreateParameters);

    const confirmedRequestData = await request.waitForConfirmation();
    const requestID = confirmedRequestData.requestId;
    const salt = confirmedRequestData.extensions["pn-erc20-fee-proxy-contract"].values.salt;

    const paymentReference = PaymentReferenceCalculator.calculate(requestID,salt,payeeIdentity);
    console.log("paymentReferenceCalculator", paymentReference);
    console.log("confirmed Request Data:", confirmedRequestData);
    alert('Wallet connected successfully!');
    console.log("Request Parameters:", requestCreateParameters);
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
    const payref="0x"+paymentReference;
    console.log("payref", payref);
    const contractAddress=process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tokenAddress="0x1d87Fc9829d03a56bdb5ba816C2603757f592D82"
    const data = await contract.callTransferWithFee(tokenAddress, payeeIdentity, loanAmount, payref); 
    await data.wait();
    console.log('payerIdentity', payerIdentity);
    console.log('payeeIdentity', payeeIdentity);
    console.log('data', data.hash);
    alert('Form submitted successfully');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={submitHandler}
        className="w-full max-w-lg bg-white shadow-lg rounded-lg p-8"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Take a loan</h1>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Expected Amount:</label>
          <input
            type="text"
            value={expectedAmount}
            onChange={(e) => setExpectedAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Reason:</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Request
        </button>
      </form>
    </div>
  );
};

export default App;
