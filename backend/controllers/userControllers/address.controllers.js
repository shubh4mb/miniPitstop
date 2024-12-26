import User from "../../models/user_model.js";
import Address from "../../models/address_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";

export const addAddress = async (req, res) => {
    try {
        const { fullName, address, city, state, pincode , phone } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) {    
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }
        
        const newAddress = new Address({
            fullName,
            address,
            city,
            state,
            pincode,
            userId:req.user.userId,
            phone:phone,
            default:false

        });
        await newAddress.save();
        
      
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            user
        });
    }
    catch(error){
        console.error("Error in addAddress:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
 }

 export const getAddresses = async (req, res) => {
    try {
       
        const addresses = await Address.find({ userId: req.user.userId });
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.OK,
            addresses
        });
    } catch (error) {
        console.error("Error in getAddresses:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { fullName, address, city, state, pincode , phone } = req.body;
        const addressToUpdate = await Address.findById(addressId);
        if (!addressToUpdate) {    
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }
        addressToUpdate.fullName = fullName;
        addressToUpdate.address = address;
        addressToUpdate.city = city;
        addressToUpdate.state = state;
        addressToUpdate.pincode = pincode;
        addressToUpdate.phone = phone;
        await addressToUpdate.save();
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            address: addressToUpdate
        });
    } catch (error) {
        console.error("Error in updateAddress:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,            
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const addressToDelete = await Address.findByIdAndDelete(addressId);
        if (!addressToDelete) {    
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }
        
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.DELETED
        });
    } catch (error) {
        console.error("Error in deleteAddress:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR, 
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}