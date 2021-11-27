const express = require('express');
const { route } = require('../app');

const router = express.Router();

const { getProducts, newProduct,getSingleProduct, updateProduct,deletProduct } = require('../controllers/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/products').get( isAuthenticatedUser,  authorizeRoles('admin'), getProducts);

router.route('/product/:id').get(getSingleProduct);

router.route('/admin/product/:id').put( isAuthenticatedUser, updateProduct);

router.route('/admin/product/:id').delete(isAuthenticatedUser, deletProduct);

router.route('/admin/product/new').post(isAuthenticatedUser,newProduct);

module.exports = router;