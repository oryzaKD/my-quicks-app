import React from 'react';

type Option = {
  label: string;
  value: string;
};

type DropdownProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, label }) => {
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '6px', fontSize: '16px', backgroundColor: 'white', color: 'black', borderRadius: '5px', width: '150px', cursor: 'pointer' }}
      >
        <option style={{ color: 'black', backgroundColor: 'white' }} value="" disabled hidden>
          {label}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ color: 'black', backgroundColor: 'red' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
