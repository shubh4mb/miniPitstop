
import  Series from '../../models/series_model.js';
import { HttpStatus, HttpMessage } from '../../constants/http.constants.js';


export const getSeries = async (req, res) => {
    try {
        const { brandId } = req.params;
        const series = await Series.find({ brand: brandId }).populate('brand','name');
        res.status(HttpStatus.OK).json({ 
            message: HttpMessage.OK,
            series 
        });
    } catch (error) {
        //('Error in getSeries:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: error.message 
        });
    }
};

export const getAllSeries = async (req, res) => {
    try {
        const series = await Series.find().populate('brand','name');
        res.status(HttpStatus.OK).json({ 
            message: HttpMessage.OK,
            series 
        });
    } catch (error) {
        //('Error in getAllSeries:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: error.message 
        });
    }
};

