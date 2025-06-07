import React from 'react';

type CheckboxProps = {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginRight: 10 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <span
        style={{
          width: 18,
          height: 18,
          border: '2px solid black',
          borderRadius: 2,
          background: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 14 14">
            <polyline
              points="3,7 6,10 11,4"
              style={{ fill: 'none', stroke: '#000', strokeWidth: 2 }}
            />
          </svg>
        )}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
};

export default Checkbox;
