const express=require("express");

const router=express.Router();

const {protectedUserMiddleware, protectAdminMiddleware} =require('../middlewares/authMiddleware.js')
const {deleteUser,getUserByid,getUsers}=require('../controllers/userController.js')

router.get('/',protectedUserMiddleware,protectAdminMiddleware,getUsers);

router.get('/',protectedUserMiddleware,protectAdminMiddleware,getUserByid);

router.delete('/',protectedUserMiddleware,protectAdminMiddleware,deleteUser);

module.exports=router;