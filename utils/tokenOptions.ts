import { Types } from '@requestnetwork/request-client.js';
interface TokenOptions {
  [key: string]: string;
}

const tokenOptions: TokenOptions = {
  '0x1d87Fc9829d03a56bdb5ba816C2603757f592D82': 'TKN1',
  '0xA74b9F8a20dfACA9d7674FeE0697eE3518567248': 'TKN2',
  '0x036CbD53842c5426634e7929541eC2318f3dCF7e': 'USDC',
  '0x863aE464D7E8e6F95b845FD3AF0f9A2B2034D6dD': 'USDT',
  '0x68194a729C2450ad26072b3D33ADaCbcef39D574': 'DAI',
  '0x92f3B59a79bFf5dc60c0d59eA13a44D082B2bdFC': 'WBTC',
};
export default tokenOptions;
