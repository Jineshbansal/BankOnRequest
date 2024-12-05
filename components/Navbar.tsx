'use client';
import React, { FC, useEffect, useState } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';

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
          <Menu as='div' className='relative inline-block text-left z-50'>
            <div>
              <Menu.Button className='bg-white text-[#038962] px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition duration-300 ease-in-out'>
                Transactions
              </Menu.Button>
            </div>
            <Transition
              as={React.Fragment}
              enter='transition ease-out duration-100'
              enterFrom='transform opacity-0 scale-95'
              enterTo='transform opacity-100 scale-100'
              leave='transition ease-in duration-75'
              leaveFrom='transform opacity-100 scale-100'
              leaveTo='transform opacity-0 scale-95'
            >
              <Menu.Items className='absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                <div className='py-1'>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href='/borrowing-transactions'
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } block px-4 py-2 text-sm`}
                      >
                        Borrowing Transactions
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href='/lending-transactions'
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } block px-4 py-2 text-sm`}
                      >
                        Lending Transactions
                      </Link>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
        <button
          className='bg-white text-[#038962] px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition duration-300 ease-in-out ml-4'
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
