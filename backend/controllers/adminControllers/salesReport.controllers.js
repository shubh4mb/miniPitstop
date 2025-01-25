import Order from '../../models/order_model.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

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
// console.log(startDate,endDate)
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
            },
        orderStatus:'delivered'}).populate('couponApplied')
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

// Download sales report as PDF
export const downloadSalesReport = async (req, res) => {
    try {
        const { timeFilter, startDate: customStartDate, endDate: customEndDate } = req.query;
        const { startDate, endDate } = getDateRange(timeFilter, customStartDate, customEndDate);

        // Get orders within the date range
        const orders = await Order.find({
            orderDate: {
                $gte: startDate,
                $lte: endDate
            },
            orderStatus: 'delivered'
        })
        .populate('couponApplied')
        .populate('items.product')
        .sort({ orderDate: 1 });

        // Create a PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="sales-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.pdf"`);

        // Pipe the PDF document to the response
        doc.pipe(res);

        try {
            // Define consistent margins and positions
            const leftMargin = 50;
            const rightMargin = 550;
            const columnPositions = {
                date: leftMargin,
                orderId: 150,
                items: 270,
                amount: 450
            };
            const columnWidths = {
                date: 90,
                orderId: 110,
                items: 170,
                amount: 80
            };

            // Header
            doc.fontSize(20)
                .text('MiniPitstop - Sales Report', { align: 'center' })
                .moveDown();

            // Report Period
            doc.fontSize(12)
                .text(`Report Period: ${format(startDate, 'dd/MM/yyyy')} to ${format(endDate, 'dd/MM/yyyy')}`)
                .moveDown();

            // Summary Statistics
            const statistics = calculateStatistics(orders);
            
            doc.font('Helvetica-Bold')
                .text('Summary Statistics:', { underline: true })
                .font('Helvetica')
                .moveDown(0.5);

            doc.text(`Total Orders: ${statistics.totalOrders}`)
                .text(`Total Revenue: Rs${statistics.totalRevenue.toFixed(2)}`)
                .text(`Average Order Value: Rs${statistics.averageOrderValue.toFixed(2)}`)
                .moveDown();

            // Payment Method Statistics
            doc.font('Helvetica-Bold')
                .text('Payment Methods:', { underline: true })
                .font('Helvetica')
                .moveDown(0.5);

            Object.entries(statistics.paymentMethodStats).forEach(([method, count]) => {
                doc.text(`${method.toUpperCase()}: ${count} orders`);
            });
            doc.moveDown();

            // Coupon Usage
            if (statistics.couponStats.totalCouponsUsed > 0) {
                doc.font('Helvetica-Bold')
                    .text('Coupon Statistics:', { underline: true })
                    .font('Helvetica')
                    .moveDown(0.5);

                doc.text(`Total Coupons Used: ${statistics.couponStats.totalCouponsUsed}`)
                    .text(`Total Discount Amount: Rs${statistics.couponStats.totalDiscount.toFixed(2)}`)
                    .moveDown();
            }

            // Orders Table
            doc.font('Helvetica-Bold')
                .text('Order Details:', { underline: true })
                .moveDown(0.5);

            // Table Headers
            const y = doc.y;
            doc.font('Helvetica-Bold');
            
            doc.text('Date', columnPositions.date, y, { width: columnWidths.date })
                .text('Order ID', columnPositions.orderId, y, { width: columnWidths.orderId })
                .text('Items', columnPositions.items, y, { width: columnWidths.items })
                .text('Amount', columnPositions.amount, y, { width: columnWidths.amount, align: 'right' });

            // Draw a line after headers
            doc.moveDown(0.5);
            doc.moveTo(leftMargin, doc.y)
               .lineTo(rightMargin, doc.y)
               .stroke()
               .moveDown(0.5);

            // Table Rows
            orders.forEach((order) => {
                const rowY = doc.y;
                const itemsList = order.items.map(item => 
                    `${item.product.name} (${item.quantity})`
                ).join(', ');

                doc.font('Helvetica')
                    .text(format(new Date(order.orderDate), 'dd/MM/yyyy'), 
                        columnPositions.date, rowY, 
                        { width: columnWidths.date })
                    .text(order._id.toString().slice(-6), 
                        columnPositions.orderId, rowY, 
                        { width: columnWidths.orderId })
                    .text(itemsList, 
                        columnPositions.items, rowY, 
                        { width: columnWidths.items })
                    .text(`Rs${order.totalAmount.toFixed(2)}`, 
                        columnPositions.amount, rowY, 
                        { width: columnWidths.amount, align: 'right' });

                doc.moveDown(0.5);
            });

            // Footer
            doc.moveDown()
                .fontSize(10)
                .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

            // Finalize the PDF
            doc.end();

        } catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: 'Error generating PDF'
                });
            }
        }
    } catch (error) {
        console.error('Error fetching sales data:', error);
        return res.status(500).json({
            success: false,
            message: 'Error generating sales report'
        });
    }
};

// Helper function to calculate statistics
const calculateStatistics = (orders) => {
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

    return statistics;
};

// Get revenue chart data
export const getRevenueChartData = async (req, res) => {
    
    console.log("Query params:", req.query);
    
    try {
        const { timeFilter, startDate: customStartDate, endDate: customEndDate } = req.query;
        const { startDate, endDate } = getDateRange(timeFilter, customStartDate, customEndDate);
        
        console.log("Date range:", { startDate, endDate });

        const orders = await Order.find({
            orderDate: {
                $gte: startDate,
                $lte: endDate
            },
            orderStatus: 'delivered'
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
