const express=require('express');
const {protectedUserMiddleware, protectAdminMiddleware}=require('../middlewares/authMiddleware');
const {exportUsersReport,exportsTasksReport}=require('../controllers/dashboardController.js')

const router=express.Router();

router.get('/export/tasks',protectedUserMiddleware, protectAdminMiddleware,exportTasksReports);

router.get('/exports/tasks',protectedUserMiddleware, protectAdminMiddleware,exportUsersReport);
module.exports=router;
