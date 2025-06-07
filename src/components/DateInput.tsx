import React from 'react';

type DateInputProps = {
    value: string;
    onChange: (value: string) => void;
    label?: string;
};

const DateInput: React.FC<DateInputProps> = ({ value, onChange, label }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {label && <label style={{ marginBottom: '4px' }}>{label}</label>}
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        padding: '8px 36px 8px 10px',
                        fontSize: '14px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        width: '190px',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        color: 'black'
                    }}
                />
                <svg style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#888',
                        pointerEvents: 'none',
                    }} width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.3334 2.00001H11.6667V0.666672H10.3334V2.00001H3.66671V0.666672H2.33337V2.00001H1.66671C0.933374 2.00001 0.333374 2.6 0.333374 3.33334V14C0.333374 14.7333 0.933374 15.3333 1.66671 15.3333H12.3334C13.0667 15.3333 13.6667 14.7333 13.6667 14V3.33334C13.6667 2.6 13.0667 2.00001 12.3334 2.00001ZM12.3334 14H1.66671V6.66667H12.3334V14ZM1.66671 5.33334H12.3334V3.33334H1.66671V5.33334Z" fill="black" />
                </svg>
            </div>
        </div>
    );
};

export default DateInput;
