const express=require("express");

const {protectedUserMiddleware,protectAdminMiddleware } =require('../middlewares/authMiddleware')
const {getDashboardData,updateTaskChecklist,updateTaskStatus,updateTask,createTask,getTaskById,deleteTask,getTasks,getUserDashboardData
} =require('../controllers/taskController.js')

const router =express.Router();

router.get("/dashboard-data",protectedUserMiddleware,getDashboardData);
router.get('/user-dashboard-data',protectedUserMiddleware,getUserDashboardData);
router.get('/',protectedUserMiddleware,getTasks);
router.get('/:id',protectedUserMiddleware,getTaskById);

router.post('/',protectedUserMiddleware,protectAdminMiddleware ,createTask);
router.put('/:id',protectedUserMiddleware,updateTask)
router.delete('/:id',protectedUserMiddleware,protectAdminMiddleware,deleteTask);
router.put('/:id/status',protectedUserMiddleware,updateTaskStatus);
router.put('/:id/todo',protectedUserMiddleware,updateTaskChecklist);

module.exports=router;
