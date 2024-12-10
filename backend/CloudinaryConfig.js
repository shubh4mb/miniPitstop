import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload files to Cloudinary
export const uploadToCloudinary = async (buffer, options = {}) => {
    try {
        // Convert buffer to base64
        const b64 = Buffer.from(buffer).toString('base64');
        const dataURI = "data:image/jpeg;base64," + b64;
        
        const result = await cloudinary.uploader.upload(dataURI, options);
        return result;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};
export const deleteFromCloudinary = async (public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};


export default cloudinary;