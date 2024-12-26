import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cod', 'card', 'upi']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderNumber: {
    type: String,
    unique: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // Get the count of all orders and add 1
    const count = await mongoose.model('Order').countDocuments();
    // Generate order number (e.g., ORD-20231223-001)
    this.orderNumber = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${(count + 1).toString().padStart(3, '0')}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;