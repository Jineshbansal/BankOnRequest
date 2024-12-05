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
    const requestCreateParameters = {
        requestInfo: {
          currency: {
            type: Types.RequestLogic.CURRENCY.ERC20,
            value: tokenAddress,
            network: "sepolia",
          },
          expectedAmount: amount,
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
            paymentNetworkName: "sepolia",
            paymentAddress: paymentRecipient,
            feeAddress: feeRecipient,
            feeAmount: "0",
          },
        },
        contentData: {
          reason: reason,
          dueDate: dueDate,
        },
        signer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payeeIdentity,
        },
    };
    const request = await requestClient.createRequest(requestCreateParameters);
    const requestData = await request.waitForConfirmation();
    console.log(JSON.stringify(requestData));
};
