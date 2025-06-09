import React, { useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type DateInputProps = {
    value: string;
    onChange: (value: string) => void;
};

const DateInput: React.FC<DateInputProps> = ({ value, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <DatePicker
                selected={value ? new Date(value) : null}
                onChange={date => onChange(date ? (date as Date).toISOString().slice(0, 10) : '')}
                customInput={
                    <input
                        ref={inputRef}
                        style={{
                            padding: '8px 36px 8px 10px',
                            fontSize: '14px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '190px',
                            backgroundColor: 'white',
                            color: 'black',
                        }}
                    />
                }
                popperPlacement="right-start"
                dateFormat="yyyy-MM-dd"
                placeholderText="Set Date"
                calendarClassName="custom-datepicker"
            />
            <span
                style={{
                    position: 'absolute',
                    right: '10px',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    zIndex: 2,
                }}
            >
                <svg
                    width="14"
                    height="16"
                    viewBox="0 0 14 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ cursor: 'pointer' }}
                    onClick={() => inputRef.current?.focus()}
                >
                    <path fillRule="evenodd" clipRule="evenodd" d="M12.333 1.99996H11.6663V0.666626H10.333V1.99996H3.66634V0.666626H2.33301V1.99996H1.66634C0.933008 1.99996 0.333008 2.59996 0.333008 3.33329V14C0.333008 14.7333 0.933008 15.3333 1.66634 15.3333H12.333C13.0663 15.3333 13.6663 14.7333 13.6663 14V3.33329C13.6663 2.59996 13.0663 1.99996 12.333 1.99996ZM12.333 14H1.66634V6.66663H12.333V14ZM1.66634 5.33329H12.333V3.33329H1.66634V5.33329Z" fill="black" />
                </svg>
            </span>
        </div>
    );
};

export default DateInput;
