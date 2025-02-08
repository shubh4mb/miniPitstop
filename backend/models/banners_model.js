import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({

    image: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    type: {
        type: String,
        enum: ['carousel', 'deals', 'featured'],
        required: [true, 'Banner type is required']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;