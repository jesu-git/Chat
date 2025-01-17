import { Router } from "express"
import { AccesoController } from "../controllers/acceso.controller.js"
import passport from "passport"
import { modelUser } from "../models/users.js"

export const router = Router()


router.get("/registro", AccesoController.registro)
router.post("/registro/create", passport.authenticate("registro", { failureRedirect: "/api/acceso/error", session: false }), AccesoController.registroCreate)
router.get("/error", AccesoController.error)
router.post("/login", passport.authenticate("login", { failureRedirect: "/?error= Usuario o password incorrecto", session: false }), AccesoController.login)
router.get("/logout", passport.authenticate("JWT", { failureRedirect:"/?error=Problemas al cerrar su cuenta" , session: false}),AccesoController.logout )