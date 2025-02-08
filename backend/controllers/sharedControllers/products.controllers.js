import { HttpStatus, HttpMessage } from '../../constants/http.constants.js';
import mongoose from 'mongoose';
import  Product  from '../../models/product_model.js';


export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate('brand', 'name logo offer')
            .populate('series', 'name offer');
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
     
         products = await Product.find({isActive: true})
         .populate('brand','name').populate('series','name');

        
      
        
        
      
    res.status(HttpStatus.OK).json({ success: true, message: HttpMessage.OK, products });
    }
    
     catch (error) {
        console.error('Error in getAllProducts:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: HttpMessage.INTERNAL_SERVER_ERROR, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

export const filterProducts = async (req, res) => {
    try {
       const { priceRange, brands, scale, sortBy, page = 1, limit = 10, search } = req.body;
    //    console.log(brands);
       

    // Validate inputs
    const validPage = Math.max(1, parseInt(page, 10) || 1);
    const validLimit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (validPage - 1) * validLimit;

    // Build aggregation pipeline
    const pipeline = [];

    // Search filter
    if (search) {
        pipeline.push({
            $match: {
                name: { $regex: search, $options: 'i' }, // Case-insensitive search
            },
        });
    }

    // Price range filter
    if (priceRange && (priceRange.min > 0 || priceRange.max < 10000)) {
        pipeline.push({
            $match: {
                price: {
                    $gte: priceRange.min || 0,
                    $lte: priceRange.max || 10000,
                },
            },
        });
    }

  
if (brands && brands.length > 0) {
    const brandIds = brands.map((id) =>new mongoose.Types.ObjectId(id));
    pipeline.push({
        $match: {
            brand: { $in: brandIds },
        },
    });
}

    
    if (scale && scale.length > 0) {
        pipeline.push({
            $match: {
                scale: { $in: scale },
            },
        });
    }

    pipeline.push({
        $facet: {
            totalCount: [{ $count: 'count' }], 
            products: [
                { $skip: skip }, 
                { $limit: validLimit }, 
                {$match: {isActive: true}},                
                ...(sortBy && sortBy !== 'default'
                    ? [
                          {
                              $sort: (() => {
                                  switch (sortBy) {
                                      case 'price_low':
                                          return { price: 1 };
                                      case 'price_high':
                                          return { price: -1 };
                                      case 'newest':
                                          return { createdAt: -1 };
                                      default:
                                          return {};
                                  }
                              })(),
                          },
                      ]
                    : []),
          
                {
                    $lookup: {
                        from: 'brands',
                        localField: 'brand',
                        foreignField: '_id',
                        as: 'brand',
                    },
                },
                {
                    $lookup: {
                        from: 'series',
                        localField: 'series',
                        foreignField: '_id',
                        as: 'series',
                    },
                },
                { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } }, // Optional unwind
                { $unwind: { path: '$series', preserveNullAndEmptyArrays: true } },
                { $project: { name: 1,scale:1, price: 1, brand: '$brand.name', series: '$series.name',card_image:1,offer:1,cardColor:1,buttonColor:1 } }, // Projection
            ],
        },
    });

    // Execute aggregation pipeline
    const results = await Product.aggregate(pipeline);

    const totalCount = results[0]?.totalCount?.[0]?.count || 0;
    const products = results[0]?.products || [];
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

export const searchedProducts = async (req, res) => {
    try {
        const searchTerm = req.query.searchTerm?.trim();
        
        if (!searchTerm) {
            return res.status(HttpStatus.BAD_REQUEST).json({ 
                success: false, 
                message: 'Search term is required' 
            });
        }

        const products = await Product.find(
            { name: { $regex: searchTerm, $options: 'i' } }
        )
        .limit(5)
        .select('name card_image price'); 
        // console.log(products);
        

        res.status(HttpStatus.OK).json({ 
            success: true, 
            message: HttpMessage.OK, 
            products 
        });

    } catch (error) {
        console.error('Error in searchProducts:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: HttpMessage.INTERNAL_SERVER_ERROR 
        });
    }
};

export const relatedProducts = async (req, res) => {
    try {
        // console.log("hi");
        
        const filterTerm = req.body;
//    console.log(req.body);
   
        
        
        // if (!filterTerm) {
        //     return res.status(HttpStatus.BAD_REQUEST).json({ 
        //         success: false, 
        //         message: 'Filter term is required' 
        //     });
        // }

 // Fetch products where the brand and series are active
const sameScale = await Product.find(
    { 
        scale: filterTerm.scale, 
        isActive: true // Filter for active products
    }
)
.populate({
    path: 'brand',
    match: { isActive: true }, 
    select: 'name isActive'
})
.populate({
    path: 'series',
    match: { isActive: true }, 
    select: 'name isActive'
})
.limit(5)
.select('name card_image price scale card_logo cardColor buttonColor ');

// console.log(sameScale);



const filteredSameScale = sameScale.filter(product => product.brand && product.series);

const sameBrand = await Product.find(
    { 
        brand: new mongoose.Types.ObjectId(filterTerm.brand),
        isActive: true // Filter for active products
    }
)
.populate({
    path: 'brand',
    match: { isActive: true }, 
    select: 'name isActive'
})
.populate({
    path: 'series',
    match: { isActive: true },
    select: 'name isActive'
})
.limit(5)
.select('name card_image price scale card_logo cardColor buttonColor ');

// console.log(sameBrand);


const filteredSameBrand = sameBrand.filter(product => product.brand && product.series);
        

        res.status(HttpStatus.OK).json({ 
            success: true, 
            message: HttpMessage.OK, 
            filteredSameScale,
            filteredSameBrand
        });

    } catch (error) {
        console.error('Error in relatedProducts:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: HttpMessage.INTERNAL_SERVER_ERROR 
        });
    }
};

export const featuredProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true })
        .populate('brand', 'name logo offer')
        .populate('series', 'name offer');
        // console.log(products);
        
        res.status(HttpStatus.OK).json({ 
            success: true, 
            message: HttpMessage.OK, 
            products
            
        });
    } catch (error) {
        console.error('Error in featuredProducts:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: HttpMessage.INTERNAL_SERVER_ERROR 
        });
    }
}
