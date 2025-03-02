import { useState } from 'react';

export function Card({ directory, mainImage, allImages }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className="card relative cursor-pointer" onClick={() => setFlipped(!flipped)}>
            <div className={`transform transition-transform duration-500 ${flipped ? 'rotate-y-180' : ''}`}>
                {!flipped ? (
                    <div className="front">
                        {mainImage ? (
                            <img src={mainImage} alt={directory} className="rounded-md shadow-sm" />
                        ) : (
                            <p>Loading...</p>
                        )}
                        <p className="card-title">{directory}</p>
                    </div>
                ) : (
                    <div className="back absolute inset-0 flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-md rotate-y-180">
                        <div className="grid grid-cols-2 gap-2">
                            {/* Always include the main image first */}
                            <img src={mainImage} alt={`${directory}-main`} className="w-16 h-16 rounded-md shadow-sm" />

                            {/* Display additional images if available */}
                            {allImages.length > 0 ? (
                                allImages.map((img, index) => (
                                    <img key={index} src={img} alt={`${directory}-${index}`} className="w-16 h-16 rounded-md shadow-sm" />
                                ))
                            ) : null}
                        </div>
                        <a href={`/contact?product=${directory}`} className="button-primary mt-4 px-4 py-2 rounded-lg text-white">Contact to Order</a>
                    </div>
                )}
            </div>
        </div>
    );
}

