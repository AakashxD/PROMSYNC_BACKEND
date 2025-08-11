const express=require('express');
const router =express.Router();
const {getDashboardData,
  getUserDashboardData
} =require('../controllers/dashboardController.js')
const {protectedUserMiddleware} =require('../middlewares/authMiddleware.js')
router.get("/dashboard-data",protectedUserMiddleware,getDashboardData);
router.get('/user-dashboard-data',protectedUserMiddleware,getUserDashboardData);

module.exports=router;