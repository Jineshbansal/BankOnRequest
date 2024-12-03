'use client';
import React, { useState } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import { Types, Utils } from '@requestnetwork/request-client.js';
import { providers,utils } from "ethers";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { RequestNetwork,PaymentReferenceCalculator } from "@requestnetwork/request-client.js"
import { ethers } from "ethers";
//949000
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
  const payeeIdentity = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
  const payerIdentity = wallet?.accounts[0].address;
  console.log("payeeIdentity:",payeeIdentity);
  console.log("payerIdentity:",payerIdentity);
  async function checkAndApproveToken(TOKEN_ADDRESS:string,userAddress: string, provider: ethers.providers.Web3Provider,loanAmount: string) {
    const signer = provider.getSigner();
    const ERC20_ABI=[
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "allowance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
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
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
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
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_addr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_addr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "transferTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
  
    try {
      // Step 1: Check current allowance
      const allowance = await tokenContract.allowance(userAddress, process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS);
      console.log(`Current Allowance: ${ethers.utils.formatUnits(allowance, 18)} tokens`);
  
      // Step 2: If allowance is insufficient, request approval
      if (allowance.lt(loanAmount)) {
        console.log("Insufficient allowance. Requesting approval...");
        
        // Request approval
        const approveTx = await tokenContract.approve(process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS, loanAmount);
        console.log(`Approval transaction sent. Hash: ${approveTx.hash}`);
  
        // Wait for the transaction to be mined
        await approveTx.wait();
        console.log("Approval successful!");
      } else {
        console.log("Sufficient allowance already granted.");
      }
    } catch (error) {
      console.error("Error checking or approving token:", error);
    }
  }
  
  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("payeeIdentity:",payeeIdentity);
    console.log("payerIdentity:",payerIdentity);
    const loanAmount = ethers.utils.parseUnits(expectedAmount, 18);
    console.log("loanAmount",loanAmount);
    const requestCreateParameters = {
      requestInfo: {
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          value: '0x1d87Fc9829d03a56bdb5ba816C2603757f592D82',
          network: 'sepolia',
        },
        expectedAmount: loanAmount.toString(),
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
    const accounts = await provider.send("eth_accounts", []);
    console.log("Accounts:", accounts);
    const signer = provider.getSigner();
  
    const web3SignatureProvider = new Web3SignatureProvider(provider.provider);
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: { 
        baseURL: "https://gnosis.gateway.request.network/",
      },
      signatureProvider: web3SignatureProvider,
    });
    const request = await requestClient.createRequest(requestCreateParameters);
    const confirmedRequestData = await request.waitForConfirmation();
    const requestID = confirmedRequestData.requestId;
    const tokenAddress="0x1d87Fc9829d03a56bdb5ba816C2603757f592D82"
    const salt = confirmedRequestData.extensions["pn-erc20-fee-proxy-contract"].values.salt;
    const paymentReference = PaymentReferenceCalculator.calculate(requestID,salt,payeeIdentity);
    console.log("paymentReferenceCalculator", paymentReference);
    console.log("confirmed Request Data:", confirmedRequestData);
    console.log("Request Parameters:", requestCreateParameters);
    await checkAndApproveToken(tokenAddress,payerIdentity,provider,loanAmount);
    const contractABI=[
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
        "name": "depositcallTransferWithFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
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
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          }
        ],
        "name": "getTokenBalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "transferToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "stateMutability": "payable",
        "type": "receive"
      }
    ];
    const payref="0x"+paymentReference;
    const contractAddress=process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
    console.log("contractAddress:",contractAddress);
    console.log("payref",payref);
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const data = await contract.depositcallTransferWithFee(tokenAddress, payeeIdentity, loanAmount, payref); 
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
