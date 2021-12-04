const Product = require('../models/Product');

const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors  = require('../middlewares/catchAsyncError');

const APIFeatures = require('../utils/APIFeatures');

//with async error
exports.newProduct =   catchAsyncErrors(async (req, res, next) => {

    req.body.user = req.user.id;
    const product = await Product.create(req.body);
  
    res.status(201).json({ 
         success: true,
         product
      })
  
  })



// without async errors
// exports.newProduct =  async (req, res, next) => {

//   const product = await Product.create(req.body);

//   res.status(201).json({ 
//        success: true,
//        product
//     })

// }


// Get all products  =>  /api/v1/products 
//filter with all products  => /api/v1/products?keyword=apple

exports.getProducts = catchAsyncErrors(async (req,res, next) => {

    const resPerPage = 4;
    const ProductCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(),req.query)
                        .search()
                        .filter()
                        .pagination(resPerPage);
                        


    const products = await apiFeatures.query
    // const products = await Product.find()


    res.status(200).json({
        success:true,
        count: products.length,
        ProductCount,
        products
    })
})

// get single products details  =>  /api/v1/product/:id 

exports.getSingleProduct  =  catchAsyncErrors( async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    // with error hanlder midleware

        if(!product){
            return next(new ErrorHandler("Product not found", 404));
        }
  

    return res.status(200).json({
        success: true,
        product
    })
})

//update the single product => /api/v1/admin/product/:findById


exports.updateProduct = catchAsyncErrors( async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    return res.status(200).json({
        success: true,
        product
    })
})

//delete the single product => /api/v1/admin/product/:findById


exports.deletProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }


    product = await Product.deleteOne();

    return res.status(200).json({
        success: true,
        message : "product deleted successfully"
    })

})