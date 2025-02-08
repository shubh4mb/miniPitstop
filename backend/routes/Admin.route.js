import express from 'express';
import {     getProduct } from '../controllers/sharedControllers/products.controllers.js';
import upload, { handleMulterError } from '../middleware/multer.js';
import { getSeries  , getAllSeries} from '../controllers/sharedControllers/series.controllers.js';
import { getBrand , getBrands } from '../controllers/sharedControllers/brands.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { addProduct, updateProduct , updateProductStatus , getAllProducts} from '../controllers/adminControllers/product.controllers.js';
import { addBrand , updateBrandStatus , updateBrand  } from '../controllers/adminControllers/brand.controllers.js';
import { addSeries , toggleSeriesStatus} from '../controllers/adminControllers/series.controllers.js';
import { fetchUsers , updateUserStatus } from '../controllers/adminControllers/user.controllers.js';
import { fetchAllOrders , updateOrderStatus , getOrder} from '../controllers/adminControllers/order.controllers.js';
import { addCoupon, fetchAllCoupons , fetchCoupon , updateCoupon, updateCouponStatus} from '../controllers/adminControllers/coupon.controllers.js';
import { getSalesReport, getRevenueChartData, downloadSalesReport , downloadSalesReportExcel } from '../controllers/adminControllers/salesReport.controllers.js';
import { getBestSellingProducts, downloadBestSellingProductsPDF } from '../controllers/adminControllers/product.controllers.js';
// import { authorizeAdmin } from '../middleware/auth.middleware.js';
import { addBanner } from '../controllers/adminControllers/banner.controllers.js';

const router = express.Router();


// Handle multiple file uploads for logo and banner
router.post('/brands', 
    verifyToken,
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]),
    handleMulterError,
    addBrand
);
router.get('/brands', getBrands);

router.post('/products', 
    verifyToken,
    upload.fields([
        { name: 'card_image', maxCount: 1 },
        { name: 'images', maxCount: 5 } 
    ]),
    handleMulterError,
    addProduct
);
router.get('/product/:id', getProduct);
router.get('/products', getAllProducts);
router.get('/products/best-selling', verifyToken, getBestSellingProducts);
router.get('/products/best-selling/download', verifyToken, downloadBestSellingProductsPDF);
router.patch('/product/:id',
    verifyToken, 
    upload.fields([
        { name: 'card_image', maxCount: 1 },
        { name: 'images', maxCount: 5 }  
    ]),
    handleMulterError,
    updateProduct
);
router.patch('/product/:id/status',verifyToken, updateProductStatus);



router.patch('/brand/:brandId', 
    verifyToken,
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }  // Allow up to 10 additional images
    ]),
    handleMulterError,
    updateBrand
);
router.patch('/brands/:brandId/status', verifyToken, updateBrandStatus);

router.patch('/series/:seriesId/status', verifyToken, toggleSeriesStatus)

router.post('/series', verifyToken, addSeries);

router.get('/users',verifyToken, fetchUsers)
router.patch('/users/:userId/status',verifyToken, updateUserStatus)
router.get('/orders',verifyToken, fetchAllOrders)
router.patch('/orders/:orderId/status',verifyToken, updateOrderStatus)
router.get('/order/:orderId',verifyToken, getOrder)

// Coupon routes
router.post('/addcoupon', verifyToken, addCoupon)
router.get('/coupons', verifyToken, fetchAllCoupons)
router.get('/coupon/:id', verifyToken, fetchCoupon)
router.patch('/coupon/:couponId', verifyToken, updateCoupon)
router.patch('/coupon/:couponId/status', verifyToken, updateCouponStatus)

//SALES REPORT ROUTES
router.get('/sales-report', verifyToken, getSalesReport);
router.get('/sales-report/revenue-chart', verifyToken, getRevenueChartData);
router.get('/sales-report/download', verifyToken, downloadSalesReport);
router.get('/sales-report/download/excel', verifyToken, downloadSalesReportExcel)

//banners routes
router.post('/banners', 
    verifyToken, 
    upload.fields([
        { name: 'image', maxCount: 1 }
    ]),
    handleMulterError,
    addBanner
)

//public routes for user
router.get('/brands', getBrands);
router.get('/brand/:brandId', getBrand);
router.get('/brand/:brandId/series', getSeries);
router.get('/series', getAllSeries);



export default router;