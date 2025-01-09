import Order from '../../models/order_model.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// Helper function to get date range based on filter
const getDateRange = (timeFilter, customStartDate, customEndDate) => {
    const today = new Date();
    let startDate, endDate;

    switch (timeFilter) {
        case 'today':
            startDate = startOfDay(today);
            endDate = endOfDay(today);
            break;
        case 'week':
            startDate = startOfWeek(today);
            endDate = endOfWeek(today);
            break;
        case 'month':
            startDate = startOfMonth(today);
            endDate = endOfMonth(today);
            break;
        case 'year':
            startDate = startOfYear(today);
            endDate = endOfYear(today);
            break;
        case 'custom':
            startDate = startOfDay(new Date(customStartDate));
            endDate = endOfDay(new Date(customEndDate));
            break;
        default:
            startDate = startOfDay(today);
            endDate = endOfDay(today);
    }

    return { startDate, endDate };
};

// Get sales report data
export const getSalesReport = async (req, res) => {
    // console.log("Sales Report API hit");
    // console.log("Query params:", req.query);
    
    try {
        const { timeFilter, startDate: customStartDate, endDate: customEndDate } = req.query;
        const { startDate, endDate } = getDateRange(timeFilter, customStartDate, customEndDate);
        
        // console.log("Date range:", { startDate, endDate });

        // Get orders within the date range
        const orders = await Order.find({
            orderDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('couponApplied')
          .populate('items.product')
          .sort({ orderDate: 1 });

        // console.log(`Found ${orders.length} orders`);

        // Calculate statistics
        const statistics = orders.reduce((stats, order) => {
            // Total revenue and orders
            stats.totalOrders++;
            stats.totalRevenue += order.totalAmount;

            // Payment method stats
            stats.paymentMethodStats[order.paymentMethod] = 
                (stats.paymentMethodStats[order.paymentMethod] || 0) + 1;

            // Coupon stats
            if (order.couponApplied) {
                stats.couponStats.totalCouponsUsed++;
                stats.couponStats.totalDiscount += (order.couponDiscount || 0);
                
                const couponCode = order.couponApplied.code;
                stats.couponStats.couponUsage[couponCode] = 
                    (stats.couponStats.couponUsage[couponCode] || 0) + 1;
            }

            return stats;
        }, {
            totalOrders: 0,
            totalRevenue: 0,
            paymentMethodStats: {},
            couponStats: {
                totalCouponsUsed: 0,
                totalDiscount: 0,
                couponUsage: {}
            }
        });

        // Calculate average order value
        statistics.averageOrderValue = 
            statistics.totalOrders > 0 ? statistics.totalRevenue / statistics.totalOrders : 0;

        // console.log("Statistics calculated:", statistics);

        // Format orders for response
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            orderDate: order.orderDate,
            totalAmount: order.totalAmount,
            totalBeforeDiscount: order.subTotalBeforeOffer || order.totalAmount,
            couponApplied: order.couponApplied ? {
                code: order.couponApplied.code,
                discount: order.couponApplied.discount,
                discountType: order.couponApplied.discountType
            } : null,
            couponDiscount: order.couponDiscount || 0,
            paymentMethod: order.paymentMethod,
            orderStatus: order.orderStatus,
            items: order.items.map(item => ({
                product: {
                    name: item.product.name,
                    price: item.price
                },
                quantity: item.quantity
            }))
        }));

        res.status(200).json({
            success: true,
            data: {
                orders: formattedOrders,
                statistics
            }
        });

    } catch (error) {
        console.error('Error in getSalesReport:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sales report data',
            error: error.message
        });
    }
};

// Get revenue chart data
export const getRevenueChartData = async (req, res) => {
    console.log("Revenue Chart API hit");
    console.log("Query params:", req.query);
    
    try {
        const { timeFilter, startDate: customStartDate, endDate: customEndDate } = req.query;
        const { startDate, endDate } = getDateRange(timeFilter, customStartDate, customEndDate);
        
        console.log("Date range:", { startDate, endDate });

        const orders = await Order.find({
            orderDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).select('orderDate totalAmount').sort({ orderDate: 1 });

        console.log(`Found ${orders.length} orders for chart`);

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Error in getRevenueChartData:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue chart data',
            error: error.message
        });
    }
};
