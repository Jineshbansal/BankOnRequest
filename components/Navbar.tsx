'use client';
import React, { FC, useEffect, useState } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import { ethers } from 'ethers';

const Navbar: FC = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [ethersProvider, setEthersProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    console.log(wallet);
    if (wallet) {
      setEthersProvider(
        new ethers.providers.Web3Provider(wallet.provider, 'any')
      );
    } else {
      setEthersProvider(null);
    }
  }, [wallet]);

  return (
    <nav className='w-full bg-[#038962] p-4 flex justify-between items-center'>
      <div className='text-white text-2xl font-bold'>BankOnRequest</div>
      <button
        className='bg-white text-[#038962] px-4 py-2 rounded-lg shadow-md hover:bg-gray-200'
        disabled={connecting}
        onClick={() => (wallet ? disconnect(wallet) : connect())}
      >
        {connecting ? 'Connecting' : wallet ? 'Disconnect' : 'Connect'}
      </button>
    </nav>
  );
};

export default Navbar;
