import React from 'react';

type TextareaProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
};

const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  onKeyDown,
  onBlur,
  placeholder = 'No Description',
  rows = 4,
  maxLength,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        style={{
          padding: '5px',
          fontSize: '14px',
          borderRadius: '3px',
          border: '1px solid black',
          resize: 'vertical',
          backgroundColor: 'white',
          color: 'black',
          fontFamily: 'Lato',
          width: 480,
          maxHeight: 50
        }}
      />
    </div>
  );
};

export default Textarea;
