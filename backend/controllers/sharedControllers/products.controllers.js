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

export const filterProducts = async (req, res) => {
    try {
        console.log("Filter API called");
        const { priceRange, brands, scale, sortBy, page = 1, limit = 10 } = req.body;
        console.log(priceRange, brands, scale, sortBy, page, limit);

        // Build filter query
        let query = {};

        // Price range filter
        if (priceRange && (priceRange.min > 0 || priceRange.max < 10000)) {
            query.price = {
                $gte: priceRange.min || 0,
                $lte: priceRange.max || 10000,
            };
        }

        // Brands filter
        if (brands && brands.length > 0) {
            query.brand = { $in: brands };
        }

        // Scale filter
        if (scale && scale.length > 0) {
            query.scale = { $in: scale };
        }

        // Get total count of filtered products
        const totalCount = await Product.countDocuments(query);

        // Pagination and sorting
        const skip = (page - 1) * limit; // Calculate how many documents to skip
        let productsQuery = Product.find(query)
            .populate('brand', 'name')
            .populate('series', 'name')
            .skip(skip)
            .limit(Number(limit)); // Limit the number of results per page

        // Apply sorting
        if (sortBy && sortBy !== 'default') {
            switch (sortBy) {
                case 'price_low':
                    productsQuery = productsQuery.sort({ price: 1 });
                    break;
                case 'price_high':
                    productsQuery = productsQuery.sort({ price: -1 });
                    break;
                case 'newest':
                    productsQuery = productsQuery.sort({ createdAt: -1 });
                    break;
            }
        }

        const products = await productsQuery;

        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products,
            totalCount,
            totalPages: Math.ceil(totalCount / limit), // Total pages for frontend pagination
            currentPage: Number(page),
        });
    } catch (error) {
        console.error('Filter error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

 