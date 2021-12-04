const express = require('express');
const { route } = require('../app');

const router = express.Router();

const { getProducts, newProduct,getSingleProduct, updateProduct,deletProduct } = require('../controllers/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/products').get( isAuthenticatedUser,   getProducts);

router.route('/product/:id').get(getSingleProduct);

router.route('/admin/product/:id').put( isAuthenticatedUser, authorizeRoles('admin'), updateProduct);

router.route('/admin/product/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deletProduct);

router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

module.exports = router;