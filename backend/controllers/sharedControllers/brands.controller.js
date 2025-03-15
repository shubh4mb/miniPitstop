import  Brand  from "../../models/brand_model.js";
import { HttpStatus, HttpMessage } from '../../constants/http.constants.js';

export const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(HttpStatus.OK).json({ 
            message: HttpMessage.OK,
            brands 
        });
    } catch (error) {
        //('Error in getBrands:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: error.message 
        });
    }
};

export const getBrand = async (req, res) => {
    try {
        const { brandId } = req.params;
        const brand = await Brand.findById(brandId);
        res.status(HttpStatus.OK).json({ 
            message: HttpMessage.OK,
            brand 
        });
    } catch (error) {
        //('Error in getBrand:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: error.message 
        });
    }
};