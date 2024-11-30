'use client';

import Navbar from '@/components/Navbar';
import React from 'react';

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
        <div className='feature bg-white p-6 rounded-lg shadow-md m-4 cursor-pointer'>
          <h2 className='text-2xl font-semibold text-[#038962]'>
            Create Request
          </h2>
          <p className='text-gray-600'>
            Earn interest by lending your assets to our secure pool.
          </p>
        </div>
        <div className='feature bg-white p-6 rounded-lg shadow-md m-4'>
          <h2 className='text-2xl font-semibold text-[#038962]'>
            Borrow Money
          </h2>
          <p className='text-gray-600'>
            Access funds quickly and easily from our decentralized pool.
          </p>
        </div>
      </section>
      <footer className='mt-8 text-gray-600'>
        <p>Powered by Request Network</p>
      </footer>
    </div>
  );
};

export default Home;
