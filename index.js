const express=require('express');
const cors =require('cors')
const path=require('path')
const dotenv=require('dotenv').config();
const connectDB =require('./config/db.config.js');
const authRoutes=require('./routes/authRoutes.js');
const userRoutes=require('./routes/userRoutes.js')
const taskRoutes=require('./routes/taskRoutes.js');
const dashboardRoutes=require('./routes/dashboardRoutes.js')
const app=express()
app.use(
    cors({
        origin:process.env.CLIENT_URL || '*',
        methods:["GET","POST","PUT","DELETE"],
        allowedHeaders:[
            "Content_Type","Authorization"
        ]
    })
)
// middlewares
app.use(express.json())


// Routes
app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/tasks',taskRoutes);
app.use('/api/dashboard',dashboardRoutes)
// app.use('/api/reports',reportRoutes);

app.listen(process.env.PORT,()=>{
    connectDB();
    console.log(`server running on port ${process.env.PORT}`)
})