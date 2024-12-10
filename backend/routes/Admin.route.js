import express from 'express';
import {     getProduct,getAllProducts } from '../controllers/sharedControllers/products.controllers.js';
import upload, { handleMulterError } from '../middleware/multer.js';
import { getSeries  , getAllSeries} from '../controllers/sharedControllers/series.controllers.js';
import { getBrand , getBrands } from '../controllers/sharedControllers/brands.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { addProduct, updateProduct , updateProductStatus } from '../controllers/adminControllers/product.controllers.js';
import { addBrand , updateBrandStatus , updateBrand  } from '../controllers/adminControllers/brand.controllers.js';
import { addSeries } from '../controllers/adminControllers/series.controllers.js';
import { fetchUsers , updateUserStatus } from '../controllers/adminControllers/user.controllers.js';

const router = express.Router();
router.use(verifyToken);

// Handle multiple file uploads for logo and banner
router.post('/brands', 
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]),
    handleMulterError,
    addBrand
);
router.get('/brands', getBrands);

router.post('/products', 
    upload.fields([
        { name: 'card_image', maxCount: 1 },
        { name: 'images', maxCount: 10 }  // Allow up to 10 additional images
    ]),
    handleMulterError,
    addProduct
);
router.get('/product/:id', getProduct);
router.get('/products', getAllProducts);
router.patch('/product/:id', 
    upload.fields([
        { name: 'card_image', maxCount: 1 },
        { name: 'images', maxCount: 10 }  // Allow up to 10 additional images
    ]),
    handleMulterError,
    updateProduct
);
router.patch('/product/:id/status', updateProductStatus);


router.get('/brand/:brandId', getBrand);
router.patch('/brand/:brandId', 
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }  // Allow up to 10 additional images
    ]),
    handleMulterError,
    updateBrand
);
router.patch('/brands/:brandId/status', updateBrandStatus);

router.get('/brand/:brandId/series', getSeries);

router.get('/series', getAllSeries);
router.post('/series', addSeries);

router.get('/users',fetchUsers)
router.patch('/users/:userId/status', updateUserStatus)

export default router;