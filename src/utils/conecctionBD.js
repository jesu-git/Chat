import mongoose from "mongoose";


export const connectionBD = async (link, BD) => {

    try {

        await mongoose.connect(link, { dbName: BD })

        return console.log("BD connected")

    }

    catch (error) {

        return console.log("Problemas al conectar con BD")

    }
}