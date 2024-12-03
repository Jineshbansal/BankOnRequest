'use client';
import React, { useState } from 'react';
import { useConnectWallet } from '@web3-onboard/react';

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [{ wallet }] = useConnectWallet();
  console.log(wallet?.accounts[0].address);
  const submitHandler = (event: React.FormEvent) => {
    event.preventDefault();
    alert('Form is clicked');
    console.log(inputValue);
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <form onSubmit={submitHandler} className='flex flex-col gap-4'>
        <input
          type='text'
          value={inputValue}
          placeholder='Enter your name'
          onChange={(e) => setInputValue(e.target.value)}
          className='p-2 text-lg border border-gray-300 rounded'
        />
        <input
          type='text'
          value={inputValue}
          placeholder='Enter your name'
          onChange={(e) => setInputValue(e.target.value)}
          className='p-2 text-lg border border-gray-300 rounded'
        />
        <button
          type='submit'
          className='p-2 text-lg bg-blue-500 text-white rounded hover:bg-blue-700'
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default App;
