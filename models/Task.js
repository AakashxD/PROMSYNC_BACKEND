const mongoose=require('mongoose');
const todoSchema=new mongoose.Schema({
    text:{type:String,require:true},
    completed:{type:Boolean,default:false}
})

const taskSchema=new mongoose.Schema({
    title:{type:String,required:true},
description:{type:String,default:null},
priority:{
    type:String,enum:["Low","Medium","High"],default:"Medium"},
    status:{type:String,enum:["pending","In Progress","Complete"],default:"Pending"},
    dueDate:{type:Date,required:true},
    assignedTo:{type:mongoose.Schema.Types.ObjectId,ref:user},
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    attachments:{type:String},
    todoCheckList:{todoSchema},
    progess:{type:Number,default:0}

},{
    timestamps:true
});
module.exports=mongoose.model("Task",taskSchema);

