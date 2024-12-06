import {EthereumPrivateKeySignatureProvider} from "@requestnetwork/epk-signature";
import { Types,Utils ,RequestNetwork} from "@requestnetwork/request-client.js";
import {Wallet} from "ethers";
import { Address } from "viem";

export const createCustomRequest = async (payerIdentity:Address, reason:string,tokenAddress:Address, amount:String,dueDate:String)=>{
    const epkSignatureProvider = new EthereumPrivateKeySignatureProvider({
        method: Types.Signature.METHOD.ECDSA,
        privateKey: process.env.PAYEE_PRIVATE_KEY, // Must include 0x prefix
    });
    const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: "https://sepolia.gateway.request.network/",
        },
        signatureProvider: epkSignatureProvider,
    });
    const payeeIdentity = new Wallet(process.env.NEXT_PUBLIC_PAYEE_PRIVATE_KEY).address;
    console.log(payeeIdentity);
    const feeRecipient = "0xEee3f751e7A044243a407F14e43f69236e12f748";
    const paymentRecipient = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
    const requestCreateParameters ={
        paymentNetwork: {
          id: Types.Extension.PAYMENT_NETWORK_ID.ERC777_STREAM,
          parameters: {
            paymentAddress: paymentRecipient,
            feeAddress: "0xEee3f751e7A044243a407F14e43f69236e12f748",
            feeAmount: '0',
            network: 'sepolia',
            tokenAddress: erc777TokenAddress,
          },
        },
        requestInfo: {
          currency: {
            type: RequestLogicTypes.CURRENCY.ERC777,
            value: erc777TokenAddress,
            network: 'mainnet'
          },
          expectedAmount: '1000000000000000000', // 1 token with 18 decimals
          payee: payeeIdentity,
          payer: payerIdentity,
        },
        signer: payeeIdentity,
    };
    const request = await requestClient.createRequest(requestCreateParameters);
    const requestData = await request.waitForConfirmation();
    console.log(JSON.stringify(requestData));
};
