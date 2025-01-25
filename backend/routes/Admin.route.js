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
import { fetchAllOrders , updateOrderStatus , getOrder} from '../controllers/adminControllers/order.controllers.js';
import { addCoupon, fetchAllCoupons , fetchCoupon , updateCoupon} from '../controllers/adminControllers/coupon.controllers.js';
import { getSalesReport, getRevenueChartData, downloadSalesReport } from '../controllers/adminControllers/salesReport.controllers.js';
import { getBestSellingProducts, downloadBestSellingProductsPDF } from '../controllers/adminControllers/product.controllers.js';
// import { authorizeAdmin } from '../middleware/auth.middleware.js';
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
router.get('/products/best-selling', verifyToken, getBestSellingProducts);
router.get('/products/best-selling/download', verifyToken, downloadBestSellingProductsPDF);
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
router.get('/orders',fetchAllOrders)
router.patch('/orders/:orderId/status',updateOrderStatus)
router.get('/order/:orderId',getOrder)

// Coupon routes
router.post('/addcoupon', addCoupon)
router.get('/coupons', fetchAllCoupons)
router.get('/coupon/:id', fetchCoupon)
router.patch('/coupon/:couponId', updateCoupon)

//SALES REPORT ROUTES
router.get('/sales-report', getSalesReport);
router.get('/sales-report/revenue-chart', getRevenueChartData);
router.get('/sales-report/download', downloadSalesReport);

export default router;