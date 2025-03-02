import { useState } from 'react';

export function ToggleButtons({ onSelect }) {
  const [selected, setSelected] = useState('Available');

  const handleSelection = (value) => {
    setSelected(value);
    if (onSelect) onSelect(value);
  };

  return (
    <div className="flex space-x-4 mt-4">
      <button 
        className={`px-4 py-2 rounded-lg ${selected === 'Available' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
        onClick={() => handleSelection('Available')}
      >
        Available
      </button>
      <button 
        className={`px-4 py-2 rounded-lg ${selected === 'History' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
        onClick={() => handleSelection('History')}
      >
        History
      </button>
    </div>
  );
}