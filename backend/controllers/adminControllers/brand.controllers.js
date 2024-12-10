import { uploadToCloudinary , deleteFromCloudinary } from '../../CloudinaryConfig.js';
import  Brand  from '../../models/brand_model.js';
import { HttpStatus, HttpMessage } from '../../constants/http.constants.js';
import dotenv from 'dotenv';

dotenv.config();

export const addBrand = async (req, res) => {
    try {
        const { name, description,isActive, offer } = req.body;
        
        // Validate required fields
        if (!name || !description ) {
            return res.status(HttpStatus.BAD_REQUEST).json({ 
                message: HttpMessage.BAD_REQUEST
            });
        }

        // Check if brand name already exists
        const existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingBrand) {
            return res.status(HttpStatus.CONFLICT).json({ 
                message: 'A brand with this name already exists' 
            });
        }

        // Validate required files
        if (!req.files?.logo || !req.files?.banner) {
            return res.status(HttpStatus.BAD_REQUEST).json({ 
                message: 'Both logo and banner images are required' 
            });
        }

        try {
            // Upload to Cloudinary
            const logoFile = req.files.logo[0];
            const bannerFile = req.files.banner[0];

            // Upload to Cloudinary using buffer
            const logoResult = await uploadToCloudinary(logoFile.buffer, {
                folder: 'brands/logos',
                resource_type: 'auto'
            });

            const bannerResult = await uploadToCloudinary(bannerFile.buffer, {
                folder: 'brands/banners',
                resource_type: 'auto'
            });

            // Create new brand with Cloudinary data
            const newBrand = new Brand({
                name,
                description,
                offer,
                isActive,
                logo: {
                    public_id: logoResult.public_id,
                    url: logoResult.secure_url
                },
                banner: {
                    public_id: bannerResult.public_id,
                    url: bannerResult.secure_url
                }
            });

            await newBrand.save();

            res.status(HttpStatus.CREATED).json({ 
                message: HttpMessage.CREATED,
                brand: newBrand
            });
        } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
                message: 'Error uploading images',
                error: uploadError.message 
            });
        }
    } catch (error) {
        console.error('Error in addBrand:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: error.message 
        });
    }
};

export const updateBrand = async (req, res) => {
    try {
        const { brandId } = req.params;
        const { name, description, offer, isActive } = req.body;

        // Find existing brand
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }

        // Prepare update data - only include fields that are provided
        const updateData = {};
        
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (offer !== undefined) updateData.offer = Number(offer);
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        // Handle logo update if provided
        if (req.files?.logo?.[0]) {
            const logoResult = await uploadToCloudinary(
                req.files.logo[0].buffer,
                {
                    folder: 'brands/logos',
                    resource_type: 'auto'
                }
            );
              // Delete old logo image if exists
              if (brand.logo?.public_id) {
                await deleteFromCloudinary(brand.logo.public_id);
            }
            updateData.logo = {
                url: logoResult.secure_url,
                public_id: logoResult.public_id
            };
        }

        // Handle banner update if provided
        if (req.files?.banner?.[0]) {
            const bannerResult = await uploadToCloudinary(
                req.files.banner[0].buffer,
                {
                    folder: 'brands/banners',
                    resource_type: 'auto'
                }
            );
             // Delete old banner image if exists
             if (brand.banner?.public_id) {
                await deleteFromCloudinary(brand.banner.public_id);
            }
            updateData.banner = {
                url: bannerResult.secure_url,
                public_id: bannerResult.public_id
            };
        }

        // Update brand with only the provided fields
        const updatedBrand = await Brand.findByIdAndUpdate(
            brandId,
            updateData,
            { new: true }
        );      

        return res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            brand: updatedBrand
        });

    } catch (error) {
        console.error('Error in updateBrand:', error);

        if (error.name === 'ValidationError') {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid brand data',
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

export const updateBrandStatus = async (req, res) => {
    try {
        const { brandId } = req.params;
        const {isActive} = req.body;        

        // Find existing brand
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }

        //  update data
        const updatedBrand = await Brand.findByIdAndUpdate(
            brandId,
            { isActive: Boolean(isActive) },
            { new: true }
        );

    

        return res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            brand: updatedBrand
        });

    } catch (error) {
        console.error('Error in updateBrand:', error);

        if (error.name === 'ValidationError') {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid brand data',
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