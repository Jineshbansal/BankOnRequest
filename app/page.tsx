import Navbar from '@/components/Navbar';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'BankOnRequest',
  description: 'BankOnRequest is a decentralized invoicing platform.',
  icons: {
    icon: '/peer-to-peer.png',
  },
};

const Home: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center'>
      <Navbar />
      <header className='text-center mb-8 mt-8'>
        <h1 className='text-4xl font-bold text-[#038962]'>
          Welcome to BankOnRequest
        </h1>
        <p className='text-lg text-gray-700'>
          Your decentralized solution for lending and borrowing
        </p>
      </header>
      <section className='w-full max-w-4xl flex flex-col md:flex-row justify-around items-center'>
        <Link
          href='/lender-form'
          className='feature bg-white p-6 rounded-lg shadow-md m-4 cursor-pointer'
        >
          <h2 className='text-2xl font-semibold text-[#038962]'>Lend Money</h2>
          <p className='text-gray-600'>
            Earn interest by lending your assets to our secure pool.
          </p>
        </Link>
        <Link
          href='/borrow-form'
          className='feature bg-white p-6 rounded-lg shadow-md m-4 curson-pointer'
        >
          <h2 className='text-2xl font-semibold text-[#038962]'>
            Borrow Money
          </h2>
          <p className='text-gray-600'>
            Access funds quickly and easily from our decentralized pool.
          </p>
        </Link>
      </section>
      <footer className='mt-8 text-gray-600'>
        <p>Powered by Request Network</p>
      </footer>
    </div>
  );
};

export default Home;
