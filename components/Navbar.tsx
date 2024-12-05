'use client';
import React, { FC, useEffect, useState } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import { ethers } from 'ethers';
import Link from 'next/link';

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
  console.log(ethersProvider);
  return (
    <nav className='w-full bg-[#038962] p-4 flex justify-between items-center shadow-lg'>
      <div className='flex items-center'>
        <Link
          href='/'
          className='text-white text-2xl font-bold hover:text-gray-200'
        >
          BankOnRequest
        </Link>
      </div>
      <div className='flex items-center mr-5'>
        {wallet && (
          <Link
            href='/borrowing-transactions'
            className='text-white text-xl mr-4 hover:text-gray-200'
          >
            Borrowing Transactions
          </Link>
        )}
        {wallet && (
          <Link
            href='/lending-transactions'
            className='text-white text-xl mr-4 hover:text-gray-200'
          >
            Lending Transactions
          </Link>
        )}
        <button
          className='bg-white text-[#038962] px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition duration-300 ease-in-out'
          disabled={connecting}
          onClick={() => (wallet ? disconnect(wallet) : connect())}
        >
          {connecting ? 'Connecting' : wallet ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
