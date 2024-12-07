import { Types } from '@requestnetwork/request-client.js';
interface TokenOptions {
  [key: string]: string;
}

const tokenOptions: TokenOptions = {
  '0x1d87Fc9829d03a56bdb5ba816C2603757f592D82': 'TKN1',
  '0xA74b9F8a20dfACA9d7674FeE0697eE3518567248': 'TKN2',
  '0x68194a729c2450ad26072b3d33adacbcef39d574': 'USDC',
  '0x779877a7b0d9e8603169ddbd7836e478b4624789': 'USDT',
  '0x0A5e1c82E0Bc36eF4dCd5E63E440c26F30A0480f': 'DAI',
  '0x9faBbCc6E4692468E08d1e0E6346B5cD55a66D5e': 'WBTC',
  '0x6B1E4Eba4f3F6bE6e5dB5c648aB7DdbEfAaF9Fd3': 'WETH',
};
export default tokenOptions;
