const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logout, forgotPassword,
     resetpassword, getUserProfile, updatePassword,updateProfile, allUsers , getuser, updateUser,deleteUser} = require('../controllers/authController');

     const { isAuthenticatedUser , authorizeRoles} = require('../middlewares/auth');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/password/forget').post(forgotPassword);
router.route('/password/reset/:token').put(resetpassword);

router.route('/me').get(isAuthenticatedUser,getUserProfile);
router.route('/password/update').put(isAuthenticatedUser,updatePassword);
router.route('/me/updateprofile').put(isAuthenticatedUser,updateProfile);

//admin route

router.route('/admin/allUsers').get(isAuthenticatedUser, authorizeRoles('admin'),allUsers);
router.route('/admin/getuser/:id').get(isAuthenticatedUser, authorizeRoles('admin'),getuser);
router.route('/admin/user/:id').put(isAuthenticatedUser, authorizeRoles('admin'),updateUser);
router.route('/admin/user/:id').delete(isAuthenticatedUser, authorizeRoles('admin'),deleteUser);







router.route('/logout').get(logout);



module.exports = router;