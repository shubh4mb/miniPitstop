import mongoose from 'mongoose';

const seriesSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    offer: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    }
}, { timestamps: true });

const Series = mongoose.model('Series', seriesSchema);
export default Series;