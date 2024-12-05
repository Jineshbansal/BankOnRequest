
import React from 'react';

const DropdownInput = ({ options, value, onChange, labelName }) => {
  return (
    <div className='mb-4'>
      <label className='block text-gray-700 text-sm font-bold mb-2'>
        {labelName}
      </label>
      <select
        value={value}
        onChange={onChange}
        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
      >
        {Object.entries(options).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownInput;