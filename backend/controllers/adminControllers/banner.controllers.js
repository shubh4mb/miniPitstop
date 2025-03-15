import Banner from "../../models/banners_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";
import { uploadToCloudinary , deleteFromCloudinary } from '../../CloudinaryConfig.js';


 export const addBanner = async (req, res) => {
  
    
    try {
        const { type, isActive } = req.body;   
        
        if (!req.files?.image) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Image is required"
            });
        }

        if (!type) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Banner type is required"
            });
        }
        
        const image = req.files.image[0];

        const result = await uploadToCloudinary(
            image.buffer,
            {
                folder: 'banners',
                resource_type: 'auto'
            }
        )

        const newBanner = new Banner({
            image: {
                public_id: result.public_id,
                url: result.secure_url
            },
            type,
            isActive: isActive === 'true'
        })

        const savedBanner = await newBanner.save();
        
        return res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Banner added successfully",
            data: savedBanner
        });
    } catch (error) {
        //('Error in addBanner:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Failed to add banner"
        });
    }
}

export const toggleBannerStatus = async (req, res) => {
    try {
        const { bannerId } = req.params;
        const { isActive } = req.body;
        
        const banner = await Banner.findById(bannerId);
        if(!banner){
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            })
        }
        
        const updatedBanner = await Banner.findByIdAndUpdate(
            bannerId,
            { isActive },
            { new: true }
        )
        
        res.status(200).json({
            success: true,
            message: HttpMessage.UPDATED,
            banner: updatedBanner
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}