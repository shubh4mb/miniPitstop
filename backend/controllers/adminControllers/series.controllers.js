import Series from "../../models/series_model.js";
import Brand from "../../models/brand_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";

export const addSeries = async (req, res) => {
    try {
        const { brandId, name, description, isActive = true, offer = 0  } = req.body;

        // Input validation
        if (!brandId || !name || !description) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: HttpMessage.BAD_REQUEST
            });
        }

        // Check if brand exists
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }

        // Check for duplicate series name
        const seriesExists = await Series.findOne({
            brand: brandId,
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (seriesExists) {
            return res.status(HttpStatus.CONFLICT).json({
                success: false,
                message: 'A series with this name already exists for this brand'
            });
        }

        // Create new series
        const newSeries = new Series({
            name,
            description,
            isActive: Boolean(isActive),
            offer: Number(offer) || 0,
            brand: brandId
        });

        await newSeries.save()
        // Add series to brand and save
        brand.series.push(newSeries._id);
        await brand.save();

        // Return success response
        return res.status(HttpStatus.CREATED).json({ 
            success: true,
            message: HttpMessage.CREATED,
            data: newSeries
        });

    } catch (error) {
        console.error('Error in addSeries:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid series data',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        // Handle mongoose cast errors (invalid ID)
        if (error.name === 'CastError') {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid brand ID format'
            });
        }

        // Handle other errors
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const toggleSeriesStatus = async (req, res) => {
    try {
        const { seriesId } = req.params;
        const {  isActive } = req.body;
        const series = await Series.findById(seriesId);
        if (!series) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }
        series.isActive = isActive;
        await series.save();
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            series
        });
    } catch (error) {
        console.error('Error in toggleSeriesStatus:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
