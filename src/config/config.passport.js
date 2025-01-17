import passport from "passport";
import local from "passport-local"
import { modelUser } from "../models/users.js";
import { createHash, verificador } from "../utils/hash.js";
import passportJWT from "passport-jwt"
import jwt from "jsonwebtoken"

const tkExtractor = (req) => {

    let token = null

    if (req.cookies.user) {

        token = req.cookies.user
        const checkToken = jwt.verify(token, "chat")
        if (checkToken) return token

    }

    return token
}

export const initPassport = () => {

    passport.use("registro", new local.Strategy({

        passReqToCallback: true,
        usernameField: "email"

    },
        async (req, username, password, done) => {

            const { nombre, apellido, email } = req.body

            const checkEmail = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/

            if (email == "" || password == "" || nombre == "") return done(null, false, { mensaje: "ERROR, faltante de datos requeridos" })
            if (!checkEmail.test(username)) return done(null, false, { mensaje: "ERROR, el email no tiene la estructura aceptada" })

            const queryEmail = await modelUser.findOne({ email: username })
            if (queryEmail) return done(null, false, { mensaje: "El email ya esta asociado a una cuenta" })

            const passwordhash = createHash(password)
            password = passwordhash
            const contactos = []
            const conversaciones = []
            const status = "Desconectado"

            try {

                let code
                const usuarioCode = await modelUser.find()
                if (usuarioCode.length == 0) {
                    code = 1
                }
                if (usuarioCode.length > 0) {
                    const hola = Math.max(...usuarioCode.map(x => x.code)) + 1
                    console.log("hola---------->", hola)
                    code = Math.max(...usuarioCode.map(x => x.code)) + 1
                }
                const usuario = await modelUser.create({ nombre, apellido, email, password, contactos, conversaciones, status, code })
                console.log("Usuario creado con exitos")

                done(null, usuario)

            } catch (error) {

                done(error)

            }



        })),
        passport.use("login", new local.Strategy({

            passReqToCallback: true

        },

            async (req, username, password, done) => {

                if (password == "" || username == "") return done(null, false)

                const checkEmail = await modelUser.findOne({ email: username })

                if (!checkEmail || checkEmail == undefined) return done(null, false)

                const checkPassword = await verificador(password, checkEmail.password)

                if (!checkPassword) return done(null, false)

                delete checkEmail.password
                checkEmail.status = "En linea"
                done(null, checkEmail)

            }))
    passport.use("JWT", new passportJWT.Strategy({

        secretOrKey: "chat",
        jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([tkExtractor])

    },

        async (contentToken, done) => {

            delete contentToken._doc.password
            try {

                return done(null, contentToken)

            } catch (error) {

                return done(error)

            }
        }


    ))
}