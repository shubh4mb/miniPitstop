import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    default: null
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  schemaExpiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 6 * 60 * 1000); // 6 minutes from now
    }
  },
  otpExpiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 120 * 1000); // 120 seconds from now
    }
  },
  userData: {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    }
  }
}, {
  timestamps: true
});

// Add index on schemaExpiresAt for automatic cleanup
otpSchema.index({ schemaExpiresAt: 1 }, { expireAfterSeconds: 0 });

// Add method to check if schema is expired
otpSchema.methods.isSchemaExpired = function() {
  return this.schemaExpiresAt < new Date();
};

// Add method to check if OTP is expired
otpSchema.methods.isOtpExpired = function() {
  return this.otpExpiresAt < new Date();
};

// Add method to check if max attempts reached
otpSchema.methods.isMaxAttemptsReached = function() {
  return this.attempts >= 3;
};

// Add method to increment attempts
otpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Add method to nullify OTP after expiry
otpSchema.methods.nullifyOtpIfExpired = async function() {
  if (this.isOtpExpired()) {
    this.otp = null;
    await this.save();
    return true;
  }
  return false;
};

// Hash password before saving
otpSchema.pre('save', async function(next) {
  if (this.isModified('userData.password')) {
    this.userData.password = await bcrypt.hash(this.userData.password, 10);
  }
  next();
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;