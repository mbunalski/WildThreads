import { useState } from 'react';
import {ToggleButtons} from './ToggleButtons.js';
import { Card } from './Card.js';
import { CardList } from './CardList.js';

export function Display() {
  const [selectedValue, setSelectedValue] = useState('Available');
  const directories = ["hat_25", "shirt_15", "jacket_65", "sweater_45"]; // Example array

  return (
    <div className="flex flex-col items-center mt-4">
      <ToggleButtons onSelect={setSelectedValue} />
      <div className="mt-6 p-4 border rounded-lg bg-white shadow-md">
        
        <CardList category={selectedValue}/>
      </div>
    </div>
  );
}
