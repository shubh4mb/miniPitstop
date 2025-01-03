import Brand from "../../models/brand_model.js";
import Product from "../../models/product_model.js";
import Series from "../../models/series_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../CloudinaryConfig.js";
import dotenv from "dotenv";

dotenv.config();

export const addProduct = async (req, res) => {
    try {
        const { 
            name, description, price, brand, series, 
            offer, stock, buttonColor, cardColor, 
            isActive = true, scale, type 
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

        // Find existing product
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
            isActive: Boolean
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
                        value = Boolean(value);
                        break;
                }

                if (value !== undefined && value !== null) {
                    updateData[field] = value;
                }
            }
        });

        // If brand is being updated, validate it exists
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

            // Add new images to the current images array
            currentImages = [...currentImages, ...newImages];
        }

        // Update the images in updateData
        updateData.images = currentImages;

        // Update product with only changed fields
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



