
import mongoose from "mongoose";

const solicitudCollection = "solicitudes"

const solicitudSchema = mongoose.Schema({

    usuario_solicitante: {type: String, require: true},
    usuario_receptor:{ type: String, require:true},
    estado: {type: String, default:"pendiente"}

},
{
    timestamps: true
})

export const solicitudModel = mongoose.model(solicitudCollection,solicitudSchema)