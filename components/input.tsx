import React from 'react';

interface InputProps {
  label?: string;
  type?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  readOnly?: boolean;
  required?: boolean;
  textarea?: boolean;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value = '',
  onChange,
  readOnly = false,
  required = false,
  textarea = false,
  placeholder,
}) => {
  return (
    <div className='mb-1 w-full'>
      <label className='block text-gray-700 font-medium mb-2'>{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0bb489]'
          style={{ borderColor: '#0bb489' }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0bb489] ${
            readOnly ? 'bg-gray-100' : ''
          }`}
          style={{ borderColor: '#0bb489' }}
        />
      )}
    </div>
  );
};

export default Input;
