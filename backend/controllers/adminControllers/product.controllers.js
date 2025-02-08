import Brand from "../../models/brand_model.js";
import Product from "../../models/product_model.js";
import Series from "../../models/series_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../CloudinaryConfig.js";
import dotenv from "dotenv";
import PDFDocument from 'pdfkit-table';
import Order from "../../models/order_model.js";
dotenv.config();

export const addProduct = async (req, res) => {
    try {
        const { 
            name, description, price, brand, series, 
            offer, stock, buttonColor, cardColor, 
            isActive = true,isFeatured = false, scale, type 
        } = req.body;

        // Input validation
        if (!name?.trim() || !description?.trim() || !brand || !price) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: HttpMessage.BAD_REQUEST
            });
        }

        // Validate brand exists
        const existingBrand = await Brand.findById(brand);
        if (!existingBrand) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }

        // Validate files
        if (!req.files?.card_image?.[0]) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Card image is required'
            });
        }

        try {
            // Upload card image to Cloudinary
            const cardImageResult = await uploadToCloudinary(
                req.files.card_image[0].buffer,
                {
                    folder: 'products/card_images',
                    resource_type: 'auto'
                }
            );

            // Upload additional images if any
            let additionalImages = [];
            if (req.files.images?.length > 0) {
                const uploadPromises = req.files.images.map(file =>
                    uploadToCloudinary(file.buffer, {
                        folder: 'products/additional',
                        resource_type: 'auto'
                    })
                );
                const results = await Promise.all(uploadPromises);
                additionalImages = results.map(result => ({
                    public_id: result.public_id,
                    url: result.secure_url
                }));
            }

            // Create new product
            const newProduct = new Product({
                name: name.trim(),
                description: description.trim(),
                price: Number(price),
                brand,
                series: series || null,
                offer: Number(offer) || 0,
                stock: Number(stock) || 0,
                scale: scale?.trim(),
                type: type?.trim(),
                buttonColor: buttonColor || '#000000',
                cardColor: cardColor || '#ffffff',
                isActive: Boolean(isActive),
                isFeatured: Boolean(isFeatured),
                card_image: {
                    public_id: cardImageResult.public_id,
                    url: cardImageResult.secure_url
                },
                images: additionalImages
            });

            await newProduct.save();

            return res.status(HttpStatus.CREATED).json({
                success: true,
                message: HttpMessage.CREATED,
                data: newProduct
            });

        } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error uploading images',
                error: uploadError.message
            });
        }

    } catch (error) {
        console.error('Error in addProduct:', error);

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid product data',
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

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

     
        const product = await Product.findById(id);
        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }

        // Initialize update data with only provided fields
        const updateData = {};
        
        // List of possible text fields
        const textFields = {
            name: String,
            description: String,
            price: Number,
            brand: String,
            series: String,
            offer: Number,
            stock: Number,
            scale: String,
            type: String,
            buttonColor: String,
            cardColor: String,
            isActive: Boolean,
            isFeatured: Boolean
        };

        // Only include fields that are present in the request
        Object.entries(textFields).forEach(([field, type]) => {
            if (field in req.body) {
                let value = req.body[field];
                
                // Type conversion based on field type
                switch(type) {
                    case String:
                        value = value?.trim() || null;
                        break;
                    case Number:
                        value = value !== undefined ? Number(value) : undefined;
                        break;
                    case Boolean:
                        // Convert string 'true'/'false' to actual boolean
                        value = value === 'true' || value === true;
                        break;
                }

                if (value !== undefined && value !== null) {
                    updateData[field] = value;
                }
            }
        });

        
        if (updateData.brand) {
            const existingBrand = await Brand.findById(updateData.brand);
            if (!existingBrand) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: HttpMessage.NOT_FOUND
                });
            }
        }

        if(updateData.series) {
            const existingSeries = await Series.findById(updateData.series);
            if (!existingSeries) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: HttpMessage.NOT_FOUND
                });
            }
        }

        // Handle card image update if provided
        if (req.files?.card_image?.[0]) {
            const cardImageResult = await uploadToCloudinary(
                req.files.card_image[0].buffer,
                {
                    folder: 'products/card_images',
                    resource_type: 'auto'
                }
            );
            
            // Delete old card image if exists
            if (product.card_image?.public_id) {
                await deleteFromCloudinary(product.card_image.public_id);
            }

            updateData.card_image = {
                public_id: cardImageResult.public_id,
                url: cardImageResult.secure_url
            };
        }

        // Handle images update
        let currentImages = [...(product.images || [])];

        // Handle removed images
        if (req.body.removedImageIndexes) {
            const removedIndexes = JSON.parse(req.body.removedImageIndexes);
            
            // Delete removed images from Cloudinary
            await Promise.all(
                removedIndexes.map(async (index) => {
                    if (currentImages[index]?.public_id) {
                        await deleteFromCloudinary(currentImages[index].public_id);
                    }
                })
            );

            // Remove the images from the array
            currentImages = currentImages.filter((_, index) => !removedIndexes.includes(index));
        }

        // Add new images if provided
        if (req.files?.images?.length > 0) {
            const uploadPromises = req.files.images.map(file =>
                uploadToCloudinary(file.buffer, {
                    folder: 'products/additional',
                    resource_type: 'auto'
                })
            );
            const results = await Promise.all(uploadPromises);
            const newImages = results.map(result => ({
                public_id: result.public_id,
                url: result.secure_url
            }));

            
            currentImages = [...currentImages, ...newImages];
        }

        
        updateData.images = currentImages;

      
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('brand', 'name').populate('series', 'name');



        return res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            product: updatedProduct
        });

    } catch (error) {
        console.error('Error in updateProduct:', error);

        if (error.name === 'ValidationError') {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid product data',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        if (error.name === 'CastError') {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Find existing product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }

        // Update product status
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { isActive: Boolean(isActive) },
            { new: true }
        );

        return res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            product: updatedProduct
        });

    } catch (error) {
        console.error('Error in updateProductStatus:', error);        
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// const PDFDocument = require('pdfkit-table');

// Add this function to get best-selling products
 export const getBestSellingProducts = async (req, res) => {
  console.log("Getting best selling products...");
  
  try {
    // First check if we have any delivered orders
    const orderCount = await Order.countDocuments({ orderStatus: 'delivered' });
    console.log(`Found ${orderCount} delivered orders`);

    const topProducts = await Order.aggregate([
      { 
        $match: { 
          orderStatus: 'delivered'
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { 
            $sum: { $multiply: ['$items.quantity', '$items.price'] }
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'brands',
          localField: 'productDetails.brand',
          foreignField: '_id',
          as: 'brandDetails'
        }
      },
      {
        $unwind: {
          path: '$brandDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: '$productDetails._id',
          name: '$productDetails.name',
          brand: {
            _id: '$brandDetails._id',
            name: '$brandDetails.name'
          },
          // series: '$productDetails.series',
          scale: '$productDetails.scale',
          type: '$productDetails.type',
          price: '$productDetails.price',
          offer: '$productDetails.offer',
          stock: '$productDetails.stock',
          isActive: '$productDetails.isActive',
          card_image: '$productDetails.card_image',
          totalSold: 1,  

          totalRevenue: 1
        }
      },
      { $sort: { totalSold: -1 } }
    ]);

    // console.log(`Found ${topProducts.length} best selling products`);
    // if (topProducts.length === 0) {
    //   console.log('No products found in the aggregation pipeline');
    // } else {
    //   // console.log('Sample product:', topProducts[0]);
    // }

    res.status(200).json({
      success: true,
      products: topProducts
    });
  } catch (error) {
    console.error('Error in getBestSellingProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch best selling products',
      error: error.message
    });
  }
};

// Add this function to generate PDF report
export const downloadBestSellingProductsPDF = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { 
            $sum: { $multiply: ['$items.quantity', '$items.price'] }
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'brands',
          localField: 'productDetails.brand',
          foreignField: '_id',
          as: 'brandDetails'
        }
      },
      {
        $unwind: {
          path: '$brandDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          name: '$productDetails.name',
          brand: '$brandDetails.name',
          totalSold: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=best-selling-products.pdf');

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('Top 10 Best Selling Products Report', {
      align: 'center'
    });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'right'
    });
    doc.moveDown();

    // Create table
    const table = {
      title: "Product Sales Data",
      headers: ["Rank", "Product Name", "Brand", "Units Sold", "Revenue (₹)"],
      rows: topProducts.map((product, index) => [
        (index + 1).toString(),
        product.name,
        product.brand || 'N/A',
        product.totalSold.toString(),
        `₹${product.totalRevenue.toFixed(2)}`
      ])
    };

    // Add table to PDF
    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: () => doc.font('Helvetica').fontSize(10)
    });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
};

export const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments();
        const products = await Product.find()
            .populate('brand', 'name')
            .populate('series', 'name')
            .skip(skip)
            .limit(limit);

        res.status(HttpStatus.OK).json({ 
            success: true, 
            message: HttpMessage.OK, 
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalItems: totalProducts,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: HttpMessage.INTERNAL_SERVER_ERROR, 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
};
