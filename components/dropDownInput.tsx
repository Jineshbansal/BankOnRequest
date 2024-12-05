import React from 'react';

interface DropdownInputProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DropdownInput: React.FC<DropdownInputProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <div className='w-full'>
      <label className='block text-gray-700 font-medium mb-2'>
        Lending Token:
      </label>
      <select
        value={value}
        onChange={onChange}
        required
        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0bb489] mb-2'
        style={{ borderColor: '#0bb489' }}
      >
        <option value='' disabled>
          Select a token
        </option>
        {options.map((token) => (
          <option key={token.value} value={token.value}>
            {token.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownInput;
