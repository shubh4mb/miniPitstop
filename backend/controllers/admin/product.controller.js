const Order = require('../../models/order_model');
const Product = require('../../models/product_model');
const PDFDocument = require('pdfkit-table');

// Add this function to get best-selling products
const getBestSellingProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { 
            $sum: { $multiply: ['$items.quantity', '$items.price'] }
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'brands',
          localField: 'productDetails.brand',
          foreignField: '_id',
          as: 'brandDetails'
        }
      },
      {
        $unwind: {
          path: '$brandDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: '$productDetails._id',
          name: '$productDetails.name',
          brand: {
            _id: '$brandDetails._id',
            name: '$brandDetails.name'
          },
          series: '$productDetails.series',
          scale: '$productDetails.scale',
          type: '$productDetails.type',
          price: '$productDetails.price',
          offer: '$productDetails.offer',
          stock: '$productDetails.stock',
          isActive: '$productDetails.isActive',
          card_image: '$productDetails.card_image',
          totalSold: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalSold: -1 } }
    ]);

    res.status(200).json({
      success: true,
      products: topProducts
    });
  } catch (error) {
    console.error('Error in getBestSellingProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch best selling products'
    });
  }
};

// Add this function to generate PDF report
const downloadBestSellingProductsPDF = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { 
            $sum: { $multiply: ['$items.quantity', '$items.price'] }
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'brands',
          localField: 'productDetails.brand',
          foreignField: '_id',
          as: 'brandDetails'
        }
      },
      {
        $unwind: {
          path: '$brandDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          name: '$productDetails.name',
          brand: '$brandDetails.name',
          totalSold: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=best-selling-products.pdf');

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('Top 10 Best Selling Products Report', {
      align: 'center'
    });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'right'
    });
    doc.moveDown();

    // Create table
    const table = {
      title: "Product Sales Data",
      headers: ["Rank", "Product Name", "Brand", "Units Sold", "Revenue (₹)"],
      rows: topProducts.map((product, index) => [
        (index + 1).toString(),
        product.name,
        product.brand || 'N/A',
        product.totalSold.toString(),
        `₹${product.totalRevenue.toFixed(2)}`
      ])
    };

    // Add table to PDF
    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: () => doc.font('Helvetica').fontSize(10)
    });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
};

module.exports = {
  getBestSellingProducts,
  downloadBestSellingProductsPDF
};
