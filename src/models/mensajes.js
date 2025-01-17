import mongoose from "mongoose";
import { Schema } from "mongoose";

export const messageModelo =  mongoose.model('mesaage', new Schema({

         
    nombre:{ type: String, require:true},
    mensaje:{type: String,require:true},
    email:{type: String, requerire: true}
    
},{
    timestamps:true
}))