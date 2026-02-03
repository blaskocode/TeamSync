import React from 'react';

interface StatusIndicatorProps {
  status: 'red' | 'yellow' | 'green';
  onChange?: (status: 'red' | 'yellow' | 'green') => void;
  disabled?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, onChange, disabled = false }) => {
  const colors = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-400',
    green: 'bg-green-500',
  };

  const handleClick = (newStatus: 'red' | 'yellow' | 'green') => {
    if (!disabled && onChange) {
      onChange(newStatus);
    }
  };

  return (
    <div className="flex space-x-2">
      {(['red', 'yellow', 'green'] as const).map((color) => (
        <button
          key={color}
          onClick={() => handleClick(color)}
          disabled={disabled}
          className={`w-6 h-6 rounded-full ${colors[color]} ${
            status === color ? 'ring-2 ring-offset-2 ring-gray-400' : 'opacity-40'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'} transition-all`}
          aria-label={`Set status to ${color}`}
        />
      ))}
    </div>
  );
};

export default StatusIndicator;
