import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const dropdownOptions = [
    { label: 'Important ASAP', color: '#EAF1FB', textColor: '#3B82F6' },
    { label: 'Offline Meeting', color: '#FDE9D9', textColor: '#F59E42' },
    { label: 'Virtual Meeting', color: '#FDF6E3', textColor: '#F7C873' },
    { label: 'ASAP', color: '#D6F5F5', textColor: '#3BC6B6' },
    { label: 'Client Related', color: '#E6F4EA', textColor: '#4CAF50' },
    { label: 'Self Task', color: '#EDEBFB', textColor: '#7C3AED' },
    { label: 'Appointments', color: '#F6E6FA', textColor: '#A78BFA' },
    { label: 'Court Related', color: '#EAF1FB', textColor: '#3B82F6' },
];

interface CustomDropdownProps {
    value: string | null;
    onChange: (value: string | null) => void;
}

function CustomDropdown({ onChange }: CustomDropdownProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<typeof dropdownOptions>([]);
    const ref = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate dropdown position when open
    useEffect(() => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: 'absolute',
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                minWidth: rect.width,
                zIndex: 1000,
            });
        }
    }, [open]);

    // Add or remove badge
    const handleSelect = (option: typeof dropdownOptions[number]) => {
        if (!selected.some(sel => sel.label === option.label)) {
            setSelected([...selected, option]);
        }
        setOpen(false);
        onChange(option.label);
    };

    // Remove badge
    const handleRemove = (label: string) => {
        const newSelected = selected.filter(sel => sel.label !== label);
        setSelected(newSelected);
        if (newSelected.length === 0) {
            onChange(null); // No values left
        } else {
            onChange(newSelected[0].label); // Still have values
        }
    };

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%', display: 'flex' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                {selected.map(option => (
                    <span
                        key={option.label}
                        style={{
                            background: option.color,
                            color: option.textColor,
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12
                        }}
                    >
                        {option.label}
                        <span
                            style={{
                                marginLeft: 4,
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                color: '#888',
                                fontSize: 12,
                            }}
                            onClick={() => handleRemove(option.label)}
                        >
                            ×
                        </span>
                    </span>
                ))}
                <div
                    ref={triggerRef}
                    onClick={() => setOpen(!open)}
                    style={{
                        background: '#f3f4f6',
                        color: '#888',
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                        fontWeight: 500,
                        minWidth: 40,
                        minHeight: 36,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    +
                </div>
            </div>
            {open && createPortal(
                <div
                    style={{
                        ...dropdownStyle,
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px #0002',
                        padding: 8,
                        zIndex: 2000,
                        minWidth: 300,
                        maxHeight: 160,
                        overflowY: 'auto',
                    }}
                >
                    {dropdownOptions
                        .filter(option => !selected.some(sel => sel.label === option.label))
                        .map(option => (
                            <div
                                key={option.label}
                                onClick={() => handleSelect(option)}
                                style={{
                                    background: option.color,
                                    color: option.textColor,
                                    padding: '8px 16px',
                                    borderRadius: 6,
                                    marginBottom: 6,
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: 12,
                                }}
                            >
                                {option.label}
                            </div>
                        ))}
                </div>,
                document.body
            )}
        </div>
    );
}

export default CustomDropdown;