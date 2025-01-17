import mongoose, { SchemaTypes, Types } from "mongoose";

const colletionConv = "conversaciones"
const schemaConversacion = mongoose.Schema({


    participantes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    mensajes:{   

    type:[{

        email: { type: String },
        nombre: { type: String },
        mensaje: { type: String }

    }]

}     
})


export const conversacionModel = mongoose.model(colletionConv, schemaConversacion)
