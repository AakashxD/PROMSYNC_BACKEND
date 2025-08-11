
const Task = require("../models/Task.js");

const getDashboardData = async (req, res) => {
  try {
    

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const getUserDashboardData=async(req,res)=>{

}

module.exports = {
  getDashboardData,
  getUserDashboardData

};
