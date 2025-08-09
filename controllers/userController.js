const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Task=require('../models/Task')


const getUsers=async(req,res)=>{
    try {
        const users=await User.find({role:'member'}).select("-password");
      

        const usersWithTaskCounts=await Promise.all(users.map(async(user)=>{
            const pendingTasks=await Task.countDocuments({assignedTo:user._id,status:"pending"});
            const inProgressTasks=await Task.countDocuments({assignedTo:user._id,status:"In Progress"});
            const completedTasks=await Task.countDocuments({assignedTo:user._id,status:"Complete"});
             return {
            ...user._doc,
            pendingTasks,
            inProgressTasks,
             completedTasks
        }

        }));
        res.json(usersWithTaskCounts)
       
        


    } catch (error) {
        res.status(500).json({message:"Server error",error:error.message});
    }
}
const getUserByid = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }
        await User.findByIdAndDelete(user._id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Invalid User" });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.profileImageUrl = req.body.profileImageUrl || user.profileImageUrl;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            user.password = hashedPassword;
        }

        const updatedUser = await user.save();
        const safeUser = updatedUser.toObject();
        delete safeUser.password;

        res.status(200).json(safeUser);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,deleteUser,getUserByid,getUsers
};
