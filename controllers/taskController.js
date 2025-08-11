const Task = require("../models/Task.js");

// For admin: get all tasks
// For normal user: get only their assigned tasks


const getTasks = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    // If a status query is provided, filter by it
    if (status) {
      filter.status = status;
    }

    let tasks;
    if (req.user.role === "admin") {
      tasks = await Task.find(filter).populate("assignedTo", "name email profileImageUrl");
    } else {
      tasks = await Task.find({ ...filter, assignedTo: req.user._id })
        .populate("assignedTo", "name email profileImageUrl");
    }

    // Add completeTodoCount to each task
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completeCount = task.todoCheckList.filter((item) => item.completed).length;
        return { ...task._doc, completeTodoCount: completeCount };
      })
    );

    // Count total tasks
    const alltasks = await Task.countDocuments(
      req.user.role === "admin" ? {} : { assignedTo: req.user._id }
    );

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "Pending",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id })
    });

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: "In progress",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id })
    });

    const completeTasks = await Task.countDocuments({
      ...filter,
      status: "Completed",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id })
    });

    // Send response
    res.status(200).json({
      tasks,
      totalTasks: alltasks,
      pendingTasks,
      inProgressTasks,
      completeTasks
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const getTaskById = async (req, res) => {
  try {
        const task=await Task.findById(req.params.id).populate(
          "assignedTo","name email profileImageUrl"
        );

        if(!task) return res.status(404).json({message:"Task not found"});
        res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const deleteTask = async (req, res) => {
  try {
     const task=await Task.findById(req.params.id);
     if(!task) {
      res.status(400).json({message:"invalid req"});
     }
     const deleteTask=await Task.deleteOne(task._id);
     return res.status(200).json({message:"delete successfully"})
   
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const createTask = async (req, res) => {
  try {

    const {
        title,description,priority,dueDate,assignedTo,attachments,todoChecklist
    }=req.body;

    if(!Array.isArray(assignedTo)){
        return res.status(400).json({message:" AssignedTo must be an array of userId"})
    }

    const task=await Task.create({
          title,description,priority,dueDate,assignedTo,attachments,todoChecklist,
          createdBy:req.user._id
    });
    await task.save();

    res.status(201).json({
        message:"Task Created successfully",task
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const updateTask = async (req, res) => {
  try {

     const task=await Task.findById(req.params.id);
    if(!task) return res.status(404).json({message:"Task Not Found"});
    task.title=req.body.title || taks.title;
    task.description=req.body.description || task.description
    task.priority=req.body.priority || req.priority;
    task.dueDate=req.body.dueDate || task.dueDate
    task.todoCheckList=req.body.todoCheckList || task.todoCheckList
    task.attachments=req.body.attachments || task.attachments
    if(req.body.assignedTo){
       if(!Array.isArray(req.body.assignedTo)){
        return res.status(400).json({message:"AssisgnedTo must be an array of Id"});
       }
       task.assignedTo=req.body.assignedTo;

    const updatedTask=await task.save();
    res.json({message:"Update task successully",updatedTask});
    }

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const updateTaskStatus = async (req, res) => {
  try {
    // 1. Find task by ID from request params
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2. Check if the user is assigned to the task OR is an admin
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 3. Update task status (keep old status if not provided)
    task.status = req.body.status || task.status;

    // 4. If marked as "Completed", update checklist & progress
    if (task.status === "Completed") {
      task.todoCheckList.forEach((item) => (item.completed = true)); // fixed 'complete' → 'completed'
      task.progress = 100; // fixed typo 'progess' → 'progress'
    }

    // 5. Save updated task
    await task.save();

    // 6. Send response
    res.json({ message: "Task status updated", task });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// @ route PUT/ api/task/tasks/:id/todo (private) 

const updateTaskChecklist = async (req, res) => {
  try {
      const {todoCheckList}=req.body;
      const task=await Task.findById(req.params.id);
      if(!task) return res.json(404).json({message:"Task not found"});
     // not is assigned or not an admin then denied

      if(!task.assignedTo.includes(req.user._id) && req.user.role!=="admin"){
        return res.status(403).json({message:"Not Authorized to update checklist"});
      }

      task.todoCheckList=todoCheckList;


      // Auto -update progess bassed on checklist completion


      const completeCount=task.todoCheckList.filter((item)=>{
        item.completed
      }).length;
      const totalItems=task.todoCheckList.length;
      task.progress=totalItems>0?Math.round((completeCount/totalItems)*100):0;
     // Auto-marks tasks as complete if all items are checked

     if(task.progress===100){
      task.status=="Complete"
     }
     else if (task.progress>0){
       task.status="In Progress"
     }
     else{
        task.status="Pending"
     }
  await task.save();
  const updatedTask=await Task.findById(req.params.id).populate("assignedTo","name email profileImageUrl");
   
     res.json({message:"Task CheckList updated",task:updatedTask});

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};  
// GET /dashboard (Admin/Global)
const getDashboardData = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "Pending" });
    const completeTasks = await Task.countDocuments({ status: "Completed" });
    const overDueTasks = await Task.countDocuments({
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() }
    });

    // ==== TASK DISTRIBUTION BY STATUS ====
    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, ""); // remove spaces for keys
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks;

    // ==== TASK PRIORITIES ====
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityRaw = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // ==== RECENT 10 TASKS ====
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completeTasks,
        overDueTasks
      },
      charts: {
        taskDistribution,
        taskPriorityLevels
      },
      recentTasks
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// GET /dashboard/user (Private)
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // ==== BASIC STATISTICS ====
    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: "Pending" });
    const completeTasks = await Task.countDocuments({ assignedTo: userId, status: "Complete" });
    const overDueTasks = await Task.countDocuments({
      assignedTo: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: "Complete" }
    });

    // ==== TASK DISTRIBUTION BY STATUS ====
    const taskStatuses = ["Pending", "In Progress", "Complete"];
    const taskDistributionRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks;

    // ==== TASK PRIORITIES ====
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // ==== RECENT 10 TASKS ====
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completeTasks,
        overDueTasks
      },
      charts: {
        taskDistribution,
        taskPriorityLevels
      },
      recentTasks
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server error while fetching dashboard data" });
  }
};

module.exports = {
  getDashboardData,
  updateTaskChecklist,
  updateTaskStatus,
  updateTask,
  createTask,
  getTaskById,
  deleteTask,
  getTasks,
  getUserDashboardData

};
