import { useState, useEffect } from 'react';

const Banner = ({ 
  title, 
  description, 
  backgroundImages = [], // Now accepts an array of images
  primaryButtonText, 
  primaryButtonLink, 
  secondaryButtonText, 
  secondaryButtonLink 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (backgroundImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Manual navigation functions
  const goToNextSlide = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevSlide = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? backgroundImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32 rounded-xl">
      {/* Background images carousel */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Banner background ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/75" />
      </div>

      {/* Carousel navigation buttons */}
      {backgroundImages.length > 1 && (
        <>
          <button
            onClick={goToPrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10 transition-all"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10 transition-all"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}
      
      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl tracking-tight text-red-600 sm:text-6xl">{title}</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            {description}
          </p>
          {(primaryButtonText || secondaryButtonText) && (
            <div className="mt-10 flex items-center gap-x-6">
              {primaryButtonText && (
                <a
                  href={primaryButtonLink}
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {primaryButtonText}
                </a>
              )}
              {secondaryButtonText && (
                <a href={secondaryButtonLink} className="text-sm font-semibold leading-6 text-white">
                  {secondaryButtonText} <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Carousel indicators */}
      {backgroundImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Banner;
