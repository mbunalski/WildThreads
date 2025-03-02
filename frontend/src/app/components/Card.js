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

                    <div className="back">
                        <div className="image-grid">
                            {/* Always include the main image first */}
                            <img src={mainImage} alt={`${directory}-main`} />

                            {/* Display additional images if available */}
                            {allImages.length > 0
                                ? allImages.map((img, index) => (
                                    <img key={index} src={img} alt={`${directory}-${index}`} />
                                ))
                                : null}
                        </div>
                        <a href={`/contact?product=${directory}`} className="button-primary">
                            Contact to Order
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

