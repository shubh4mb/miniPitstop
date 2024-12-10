import mongoose from 'mongoose';



const brandSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique:true,
        trim:true
    },
    description: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    logo: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    banner: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    offer: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    series:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Series',
}]

    
},{timestamps: true})

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;