import React from 'react';

const CouponCard = ({ coupon, onApply, isApplied }) => {
  
  return (
    <div className="border rounded-lg p-3 mb-2 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">{coupon.code}</h3>
          <p className="text-sm text-gray-600">{coupon.description}</p>
          {coupon.minAmount && (
            <p className="text-xs text-gray-500">
              Min. Purchase: Rs. {coupon.minAmount}
            </p>
          )}
        </div>
        <button
          onClick={() => onApply(coupon)}
          className={`px-4 py-1 rounded ${
            isApplied
              ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          disabled={isApplied}
        >
          {isApplied ? 'Applied' : 'Apply'}
        </button>
      </div>
    </div>
  );
};

export default CouponCard;
