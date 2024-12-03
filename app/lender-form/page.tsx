'use client';
import React, { useState } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import { Types, Utils } from '@requestnetwork/request-client.js';
import { providers,utils } from "ethers";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { RequestNetwork,PaymentReferenceCalculator } from "@requestnetwork/request-client.js"

const App = () => {
  const [currency, setCurrency] = useState("0x1d87Fc9829d03a56bdb5ba816C2603757f592D82");
  const [network, setNetwork] = useState("sepolia");
  const [expectedAmount, setExpectedAmount] = useState("1011");
  const [paymentNetworkName, setPaymentNetworkName] = useState("sepolia");
  const [feeRecipient, setFeeRecipient] = useState("");
  const [feeAmount, setFeeAmount] = useState("0");
  const [reason, setReason] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [{ wallet }] = useConnectWallet();
  const payeeIdentity = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
  const payerIdentity = wallet?.accounts[0].address;
  console.log("payeeIdentity:",payeeIdentity);
  console.log("payerIdentity:",payerIdentity);

  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("payeeIdentity:",payeeIdentity);
    console.log("payerIdentity:",payerIdentity);
    const requestCreateParameters = {
      requestInfo: {
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          value: '0x1d87Fc9829d03a56bdb5ba816C2603757f592D82',
          network: 'sepolia',
        },
        expectedAmount: expectedAmount,
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
        value: payerIdentity,
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
    console.log("confirmed Request Data:", confirmedRequestData);
    alert('Wallet connected successfully!');
    console.log("Request Parameters:", requestCreateParameters);
    alert('Form submitted successfully');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={submitHandler}
        className="w-full max-w-lg bg-white shadow-lg rounded-lg p-8"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Create a Payment Request</h1>

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
