const express=require('express')
const router=express.Router();
const {registerUser,loginUser }=require('../controllers/authController');
const {getUserProfile,updateUserProfile}=require('../controllers/userController');
const {protectedUserMiddleware} =require('../middlewares/authMiddleware.js')
//Auth Routes
const upload =require('../middlewares/uploadMiddleware.js')
router.post('/register',registerUser);

router.post('/login',loginUser);

router.get('/profile',protectedUserMiddleware,getUserProfile);


router.put('/profile',protectedUserMiddleware,updateUserProfile);

router.post('/upload-image',upload.single("image"),(req,res)=>{
    if(!req.file){
        return res.status(400).json({message:"No filel upload"});
    }
    const imageUrl=`${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({imageUrl});
})

module.exports=router;
