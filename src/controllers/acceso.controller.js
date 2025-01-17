
import jwt from "jsonwebtoken"
import { modelUser } from "../models/users.js"



export class AccesoController {


    static async registroCreate(req, res) {

        const { email } = req.user
        return res.redirect(`/?mensaje=Usuario ${email} creado con exito`)

    }
    static async registro(req, res) {

        let noNav = true
        let registro = true


        return res.status(200).render("registro", { titulo: "Registrete", registro, noNav })
    }
    static async login(req, res) {

        const user = req.user
        if (!user) return res.redirect("/?error=Problemas en el proceso de login")
        const CStatus = await modelUser.findOneAndUpdate({ _id: user._id.valueOf() }, { $set: { status: "En linea" } })
        console.log("EN linea", CStatus)
        const tk = jwt.sign({ ...user }, "chat", { expiresIn: "1h" })
        res.cookie("user", tk, { httpOnly: true, maxAge: 1000 * 60 * 60 })

        return res.redirect("/chat")
    }
    static async error(req, res) {

        return res.redirect("/api/acceso/registro")

    }
    static async logout(req, res) {

        const user = req.user._doc
        console.log(user)
        try {

            const desconectar = await modelUser.findOneAndUpdate({ _id: user._id }, { $set: { status: "Desconectado" } })
            console.log("desconectar", desconectar)
            req.user = null
            res.clearCookie("user")

            return res.status(200).json("Session cerrada")
        } catch (error) {

            return res.status(400).json("error")
        }
    }
}