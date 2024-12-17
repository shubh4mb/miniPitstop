import { HttpStatus, HttpMessage } from '../../constants/http.constants.js';

import  Product  from '../../models/product_model.js';


export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
        .populate('brand','name').populate('series','name');
        // console.log(product);
        
    if (!product) {
        return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            message: HttpMessage.NOT_FOUND
        });
    }

        return res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.OK,
            product
        });

    } catch (error) {
        console.error('Error in getProduct:', error);

        if (error.name === 'CastError') {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }

        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        let products
        if(req.user.role ==='admin'){
         products = await Product.find()
         .populate('brand','name').populate('series','name');

        }
        else{
             products = await Product.find({isActive:true})
        .populate('brand','name').populate('series','name');
        }
        
        
           
    res.status(HttpStatus.OK).json({ success: true, message: HttpMessage.OK, products });

    } catch (error) {
        console.error('Error in getAllProducts:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: HttpMessage.INTERNAL_SERVER_ERROR, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

