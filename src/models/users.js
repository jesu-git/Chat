
import mongoose from "mongoose";




const userSchema = mongoose.Schema({

    nombre: { type: String, require: true },
    apellido: { type: String },
    email: { type: String, unique: true, required: true },
    contactos: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    conversaciones: [{ type: mongoose.Schema.Types.ObjectId, ref: "conversaciones" }],
    solicitudes: [{ type: mongoose.Schema.Types.ObjectId, ref: "solicitudes", required: true }],
    peticiones: [{

        idSolicitud: { type: mongoose.Schema.Types.ObjectId, ref: "solicitudes", required: true },
        emailReceptor: { type: String, required: true }

    }],
    password: { type: String, require: true },
    code: { type: Number, require: true, unique: true },
    photo: { type: String },
    last_connection: { type: String },
    status: { type: String, default: "Desconectado" }
}, {
    timestamps: true
})

export const modelUser = mongoose.model("users", userSchema)