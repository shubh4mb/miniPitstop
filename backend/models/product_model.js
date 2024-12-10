import mongoose from 'mongoose';

const productSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    scale: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    offer: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true 
    },
    isFeatured:{
      type:Boolean,
      default:false
    },
    brand:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Brand',
        required:true
    },
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Series',
      required: true
  },
    images: [
        {
          public_id: {
            type: String,
            required: true
          },
          url: {
            type: String,
            required: true
          }
        }
      ],
      card_image:{
        public_id: {
            type: String,
            required: true
          },
          url: {
            type: String,
            required: true
          }
      },
      buttonColor: {
        type: String,
        required: true
      },
      cardColor: {
        type: String,
        required: true
      }    
},{timestamps: true})

const Product = mongoose.model('Product', productSchema);
export default Product