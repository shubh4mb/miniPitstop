import Order from "../../models/order_model.js";
import Product from "../../models/product_model.js";
import Cart from "../../models/cart_model.js";
import Coupon from "../../models/coupon_model.js";
import Transaction from "../../models/transaction_model.js";
import Wallet from "../../models/wallet_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";
import User from "../../models/user_model.js";
import PDFDocument from 'pdfkit'




export const placeOrder = async (req, res) => {
    // console.log("working");

    
    
    try {
        const { items, totalAmount, shippingAddress, paymentMethod, appliedCoupon , orderStatus} = req.body;
        const userId = req.user.userId;
        const user= await User.findById(userId)
        // console.log(req.body);

      
        
        let finalAmount = 0;
        let subTotalBeforeOffer = 0;
        let subTotalAfterOffer = 0;

        // Check stock availability for all items
        for (const item of items) {
            let maxOffer = 0;
            
            const product = await Product.findById(item.product).populate('brand','offer').populate('series','offer');
            if (!product || product.stock < item.quantity) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: `Insufficient stock for product ${product?.name || item.product}`
                });
            }
            subTotalBeforeOffer += item.quantity * item.price;
            maxOffer = Math.max(product.offer || 0, product.brand?.offer || 0, product.series?.offer || 0);
            subTotalAfterOffer += item.quantity * item.price - (item.quantity * item.price * maxOffer) / 100;
        console.log(subTotalAfterOffer);
        
        }
        
        let couponDiscount = 0;
        if (appliedCoupon) {
         
            const coupon = await Coupon.findById(appliedCoupon);
            if (!coupon) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: `Invalid coupon code`
                });
            }
            if(coupon.userLimit<=user.appliedCoupon.count){
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: `Coupon usage limit reached`
                });
            }
            
            if (coupon) {
                if(coupon.discountType === 'percentage'){
                    couponDiscount = (subTotalAfterOffer * coupon.discount) / 100;
                }else if(coupon.discountType === 'amount'){
                    couponDiscount = coupon.discount;
                    console.log(couponDiscount);
                    
                }
                if(couponDiscount > coupon.maxRedemableAmount){
                    couponDiscount = coupon.maxRedemableAmount;
                }
                finalAmount = subTotalAfterOffer - couponDiscount;
            } else {
                finalAmount = subTotalAfterOffer;
            }
        } else {
            finalAmount = subTotalAfterOffer;
        }

        // Create new order
        const order = new Order({
            user: userId,
            items,
            totalAmount: finalAmount,
            shippingAddress,
            paymentMethod,
          paymentStatus: 'pending',
            orderStatus:'pending',
            orderDate: new Date(),
            couponApplied: appliedCoupon || null,
            subTotalBeforeOffer,
            subTotalAfterOffer,
            couponDiscount
        });

        if(orderStatus === 'Payment Failed'){
            order.paymentStatus = "failed";
        }

        

        
        // const sample = undefined
        if(  orderStatus !==undefined){
            // console.log(orderStatus);
            
            const updateStockPromises = items.map(item => 
                Product.findByIdAndUpdate(
                    item.product,
    
                    { $inc: { stock: -item.quantity } }
                )
            );
            
            await Promise.all(updateStockPromises);
        }

   

        // Save order
        const savedOrder = await order.save();

   

        // If payment method is wallet, update wallet balance
        if (paymentMethod === 'wallet') {

                 // Create transaction record
        const transaction = new Transaction({
            userId: userId,
            orderId: savedOrder._id,
            amount: finalAmount,
            type: 'debit',
            
          
        
        });

        // Save transaction
        const savedTransaction = await transaction.save();

            const wallet = await Wallet.findOne({ user: userId });
            if (!wallet || wallet.amount < finalAmount) {
                order.paymentStatus = "failed";
               
                await order.save();

                transaction.status = "failed";
                await transaction.save();
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Insufficient wallet balance"
                });
            }
            transaction.status = "success";
            await transaction.save();
            order.paymentStatus = "paid";
            await order.save();

            await Wallet.findOneAndUpdate(
                { user: userId },
                { 
                    $inc: { amount: -finalAmount },
                    $push: { transactionHistory: savedTransaction._id }
                }
            );
        }

       

        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { item: [] } }
        );

        return res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Order placed successfully",
            order
        });
    } catch (error) {
        //("Error placing order:", error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .populate('items.product')
            .sort({ orderDate: -1 });

        return res.status(HttpStatus.OK).json({
            success: true,
            orders
        });
    } catch (error) {
        //("Error fetching orders:", error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;

        const order = await Order.findOne({ _id: orderId, user: userId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        if (!['pending', 'confirmed','shipped'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        if(order.paymentMethod === 'razorpay'||order.paymentMethod === 'wallet'){
            const transaction = new Transaction({
                userId: userId,
                amount: order.totalAmount,
                type: 'refund',
                status: 'success'
            });
            
            await transaction.save();
            const wallet = await Wallet.findOne({ user: userId });
            if (wallet) {

                await Wallet.findOneAndUpdate(
                    { user: userId },
                    {
                        $inc: { amount: order.totalAmount }, 
                        $push: { transactionHistory: transaction._id } 
                    }
                );
            }
            else{
                const wallet=new Wallet({
                    user: userId,
                    amount: order.totalAmount,
                    transactionHistory: [transaction._id]
                });
                await wallet.save();
            }
        }

        
        // Update product stock
        await Promise.all(
            order.items.map(async (item) => {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            })
        );

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        //('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling order'
        });
    }
};

export const returnOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;

        const order = await Order.findOne({ _id: orderId, user: userId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be returned
        if (order.orderStatus !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Only delivered orders can be returned'
            });
        }

        
        order.orderStatus = 'return_requested';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Return request submitted successfully',
            order
        });
    } catch (error) {
        //('Error returning order:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting return request'
        });
    }
};

export const getSingleOrder  = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId)
            .populate({
                path: 'items.product',
                select: 'name description  card_image card_color button_color' // Add any other product fields you want to include
            })
            // .populate('user', 'name email'); // Add user details if needed

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(HttpStatus.OK).json({
            success: true,
            order
        });
    } catch (error) {
        //('Error fetching order details:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR
        });
    }
}

export const downloadInvoice = async (req, res) => {
    const { orderId } = req.params;

    try {
        // Fetch the order details
        const order = await Order.findById(orderId)
            .populate({
                path: 'items.product',
                select: 'name price',
            })
            .populate('user', 'fullName email')
            .populate('shippingAddress');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Create a PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`);

        // Pipe the PDF document to the response
        doc.pipe(res);

        try {
            // Define consistent margins and positions
            const leftMargin = 50;
            const rightMargin = 550;
            const columnPositions = {
                item: leftMargin,
                quantity: 300,
                price: 380,
                total: 460
            };
            const columnWidths = {
                item: 230,    // Width for item name
                quantity: 60, // Width for quantity
                price: 60,    // Width for unit price
                total: 70     // Width for total price
            };

            // Header with Logo and Title
            doc.fontSize(20)
                .text('MiniPitstop - Invoice', { align: 'center' })
                .moveDown();

            // Order Information
            doc.fontSize(12)
                .text(`Invoice Date: ${new Date().toLocaleDateString()}`)
                .text(`Order ID: ${orderId}`)
                .text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`)
                .moveDown();

            // Customer Details
            doc.text('Customer Details:', { underline: true })
                .text(`Name: ${order.user.fullName}`)
                .text(`Email: ${order.user.email}`)
                .moveDown();

            // Shipping Address
            if (order.shippingAddress) {
                doc.text('Shipping Address:', { underline: true })
                    .text(`${order.shippingAddress.street}`)
                    .text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`)
                    .text(`${order.shippingAddress.pincode}`)
                    .moveDown();
            }

            // Order Details
            doc.text('Order Details:', { underline: true })
                .text(`Order Status: ${order.orderStatus}`)
                .text(`Payment Method: ${order.paymentMethod}`)
                .text(`Payment Status: ${order.paymentStatus}`)
                .moveDown();

            // Draw a line before items table
            doc.moveTo(leftMargin, doc.y)
               .lineTo(rightMargin, doc.y)
               .stroke()
               .moveDown(0.5);

            // Items Table Header
            doc.fontSize(12)
                .text('Items Purchased:', { underline: true })
                // .moveDown(0.5);

            // Table Column Headers
            doc.font('Helvetica-Bold');
            const y = doc.y;
            
            // Draw header row with consistent alignment
            doc.text('Item', columnPositions.item, y, { 
                width: columnWidths.item,
                align: 'left'
            });
            doc.text('Quantity', columnPositions.quantity, y, { 
                width: columnWidths.quantity,
                align: 'center'
            });
            doc.text('Price', columnPositions.price, y, { 
                width: columnWidths.price,
                align: 'right'
            });
            doc.text('Total', columnPositions.total, y, { 
                width: columnWidths.total,
                align: 'right'
            });

            // Draw a line after headers
            doc.moveTo(leftMargin, doc.y + 5)
               .lineTo(rightMargin, doc.y + 5)
               .stroke()
               .moveDown(0.5);

            doc.font('Helvetica');

            // Table Rows
            let totalItems = 0;
            order.items.forEach((item) => {
                const y = doc.y;
                const quantity = parseInt(item.quantity);
                const price = parseFloat(item.price);
                totalItems += quantity;
                
                doc.text(item.product.name, columnPositions.item, y, { 
                    width: columnWidths.item,
                    align: 'left'
                });
                doc.text(quantity.toString(), columnPositions.quantity, y, { 
                    width: columnWidths.quantity,
                    align: 'center'
                });
                doc.text(`Rs${price.toFixed(2)}`, columnPositions.price, y, { 
                    width: columnWidths.price,
                    align: 'right'
                });
                doc.text(`Rs${(quantity * price).toFixed(2)}`, columnPositions.total, y, { 
                    width: columnWidths.total,
                    align: 'right'
                });
                doc.moveDown(0.5);
            });

            // Draw a line after items
            doc.moveTo(leftMargin, doc.y)
               .lineTo(rightMargin, doc.y)
               .stroke()
               .moveDown();

            // Price Breakdown
            const priceBreakdownX = 350;
            const valueX = 460;
            const labelWidth = 100;
            const valueWidth = 90;
            
            // Total Items count
            doc.text(`Total Items: ${totalItems}`, priceBreakdownX, doc.y, { 
                width: labelWidth + valueWidth,
                align: 'right'
            }).moveDown(0.);
            
            // Price Breakdown section
            doc.font('Helvetica-Bold')
               .text('Price Breakdown:', leftMargin, doc.y)
               .font('Helvetica')
               .moveDown(0.5);
            
            const addPriceRow = (label, amount, bold = false, isNegative = false) => {
                const value = parseFloat(amount);
                if (bold) doc.font('Helvetica-Bold');
                
                // Align label to the right side of price breakdown section
                doc.text(label, priceBreakdownX, doc.y, { 
                    width: labelWidth,
                    align: 'left'
                });
                
                // Add negative sign for discounts if needed
                const prefix = isNegative ? '-Rs' : 'Rs';
                const formattedValue = `${prefix}${Math.abs(value).toFixed(2)}`;
                
                // Align value to the right
                doc.text(formattedValue, valueX, doc.y, { 
                    width: valueWidth,
                    align: 'right'
                });
                
                if (bold) doc.font('Helvetica');
                doc.moveDown(0.5);
            };

            // Add each price row with proper alignment
            addPriceRow('Subtotal:', order.subTotalBeforeOffer);
            
            if (order.subTotalBeforeOffer !== order.subTotalAfterOffer) {
                addPriceRow('After Offers:', order.subTotalAfterOffer);
            }
            
            if (order.couponDiscount > 0) {
                addPriceRow('Coupon Discount:', order.couponDiscount, false, true);
            }

            // Draw a line before final amount
            doc.moveTo(priceBreakdownX, doc.y)
               .lineTo(rightMargin, doc.y)
               .stroke()
               .moveDown(0.5);

            // Total Amount with bold font
            addPriceRow('Total Amount:', order.totalAmount, true);

            // Footer
            doc.moveDown(2)
                .fontSize(10)
                .text('Thank you for shopping with MiniPitstop!', { align: 'center', italic: true })
                .moveDown(0.5)
                .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

            // Finalize the PDF
            doc.end();
        } catch (pdfError) {
            //('Error generating PDF:', pdfError);
            // Only send error response if headers haven't been sent
            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: 'Error generating PDF',
                });
            }
        }
    } catch (error) {
        //('Error fetching order details:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const retryPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const paymentMethod = req.body.paymentMethod;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        //check the stock of the products
        const stockChecks = await Promise.all(
            order.items.map(async (item) => {
                const product = await Product.findById(item.product);
                if (product && product.stock < item.quantity) {
                    return false;
                }
                return true;
            })
        );

        if (stockChecks.includes(false)) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock for some products'
            });
        }
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Order is already paid'
            });
        }
        if (order.paymentMethod !== paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method'
            });
        }
  
        if (paymentMethod === 'cod') {
            order.orderStatus = 'confirmed';
            order.paymentStatus = 'pending';
        } else if (paymentMethod === 'wallet') {
          const wallet = await Wallet.findOne({ user: order.user });
          if (!wallet) {
            return res.status(400).json({
              success: false,
              message: 'Wallet not found'
            });
          }
          if (wallet.amount < order.totalAmount) {
            const transaction = new Transaction({
                userId: order.user,
                amount: order.totalAmount,
                type: 'debit',
               status: 'success',
                
              });
              await transaction.save();
            return res.status(400).json({
              success: false,
              message: 'Insufficient wallet balance'
            });
          }
          const transaction = new Transaction({
            userId: order.user,
            amount: order.totalAmount,
            type: 'debit',
           status: 'success',
            
          });
          await transaction.save();

          order.orderStatus = 'confirmed';
          order.paymentStatus = 'wallet';
          wallet.amount -= order.totalAmount;
          wallet.transactions.push(transaction._id);
          await wallet.save();
        }

        // Update coupon usage if coupon was applied
        if (order.couponApplied) {
            const user = await User.findById(order.user);
            if (user) {
                const couponIndex = user.appliedCoupon.findIndex(
                    (c) => c.coupon.toString() === order.couponApplied.toString()
                );
                if (couponIndex !== -1) {
                    user.appliedCoupon[couponIndex].count += 1;
                    await user.save();
                }
            }
        }

        // Update product stock
        await Promise.all(
            order.items.map(async (item) => {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock -= item.quantity;
                    await product.save();
                }
            })
        );

        // Save the updated order
        await order.save();

        return res.status(200).json({
            success: true,
            message: 'Payment retry successful',
        });
    } catch (error) {
        //('Error in retryPayment:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}