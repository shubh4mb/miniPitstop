import React from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';

const ReviewComponent = () => {
  // Dummy reviews data
  const reviews = [
    {
      id: 1,
      user: "John Doe",
      rating: 5,
      date: "20 Jan, 2025",
      comment: "Excellent model car! The attention to detail is amazing, and the build quality is superb.",
    },
    {
      id: 2,
      user: "Sarah Smith",
      rating: 4,
      date: "15 Jan, 2025",
      comment: "Great addition to my collection. The paint finish is perfect, though the packaging could be better.",
    },
    {
      id: 3,
      user: "Mike Johnson",
      rating: 5,
      date: "10 Jan, 2025",
      comment: "One of the best scale models I've purchased. The details are incredibly accurate.",
    }
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        } inline`}
      />
    ));
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Customer Reviews</h2>
        <button 
          className="px-4 py-2 text-sm font-medium text-white rounded-full"
          style={{ backgroundColor: '#2563eb' }}
        >
          Write a Review
        </button>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaUserCircle className="text-gray-400 text-2xl" />
                <span className="font-medium text-gray-800">{review.user}</span>
              </div>
              <span className="text-sm text-gray-500">{review.date}</span>
            </div>
            
            <div className="mb-2">
              {renderStars(review.rating)}
            </div>
            
            <p className="text-gray-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewComponent;
