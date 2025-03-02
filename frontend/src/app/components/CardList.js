import { useState, useEffect } from 'react';
import { Card } from './Card';

export function CardList({ category }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    async function fetchDirectories() {
      try {
        const response = await fetch("https://tn5znlmkek.execute-api.us-east-1.amazonaws.com/test/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category }),
        });

        const text = await response.text();
        const full = JSON.parse(text);
        const data = JSON.parse(full.body); // Handles AWS double JSON structure

        // Update state with properly formatted data
        setCards(data);
      } catch (error) {
        console.error('Error fetching directories:', error);
      }
    }

    if (category) {
      fetchDirectories();
    }
  }, [category]);

  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      {cards.map((card) => (
        <Card 
          key={card.directory} 
          directory={card.directory} 
          mainImage={card.mainImage} 
          allImages={card.allImages} 
        />
      ))}
    </div>
  );
}


