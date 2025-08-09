const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config();
const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI); 
        console.log("DB is connected")
    } catch (error) {
        console.log(error,"error");
    }
}
module.exports=connectDB;