import express from 'express'
import { Server } from 'socket.io'
import { engine } from 'express-handlebars'
import __dirname from './utils.js'
import path from 'path'
import { config } from './config/config.js'
import { connectionBD } from './utils/conecctionBD.js'
import { messageModelo } from './models/mensajes.js'
import passport from 'passport'
import { initPassport } from './config/config.passport.js'
import cookieParser from 'cookie-parser'
import { router as accesoRouter } from './routers/acceso.js'
import { router as toolsRouter } from './routers/toolsChat.js'
import cors from "cors"
import { modelUser } from './models/users.js'
import { conversacionModel } from './models/conversaciones.js'
import { Socket } from 'dgram'



const PORT = config.PORT
const app = express()


app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, './views'))

app.use(cookieParser())

app.use(express.static(__dirname + '/public'))

app.use(passport.initialize())
initPassport()


app.get("/", (req, res) => {

  let noNav = true
  let login = true
  let { mensaje } = req.query
  let { error } = req.query


  res.status(200).render("login", { titulo: "Login", login, noNav, error, mensaje })

})
app.get("/chat", passport.authenticate("JWT", { failureRedirect: "/?error=Session expirada", session: false }), async (req, res) => {

  const chat = true
  let user = req.user._doc
  let userSolicitudes = await modelUser.findOne({ _id: user._id }).populate({ path: "solicitudes" }).populate({ path: "solicitudes.usuario_solicitante", select: "email" }).lean()
  let solicitudes = userSolicitudes.solicitudes
  let solicitudPendientes = solicitudes.filter(x => x.estado == "pendiente")


  let userContact = await modelUser.findOne({ _id: user._id }).populate({ path: "contactos", select: "nombre apellido status email code" }).lean()
  let contactos = userContact.contactos
  let conectados = contactos.filter(x => x.status == "En linea")

  return res.status(200).render("chat2", { titulo: "Chat", chat, user, solicitudPendientes, contactos, conectados })

})
app.get("/user", passport.authenticate("JWT", { failureRedirect: "/api/acceso/error", session: false }), (req, res) => {

  const user = req.user._doc

  return res.status(200).json(user)
})

app.use("/api/acceso", accesoRouter)
app.use("/api/tools", toolsRouter)

const server = app.listen(PORT, () => {
  console.log("Server in service")
})
connectionBD(config.link_DB, config.name_BD)



//Servidor oi 


const io = new Server(server)
let usuarios = [];
let usuarioInfo = []

io.on("connection", (socket) => {


  socket.on("nombre", async (nombre) => {

    usuarios[nombre.code] = socket.id
    

    usuarioInfo.push({ email: nombre.email, id: socket.id, nombre: nombre.nombre })
    let codigos = await modelUser.findOne({ _id: nombre._id }).populate({ path: 'contactos', select: 'nombre apellido code status' })

    if (codigos) {

      let filtrado = codigos.contactos.filter(x => x.status == "En linea")

      if (filtrado.length > 0) {

        filtrado.forEach(x => {
          
          socket.to(usuarios[x.code]).emit("nuevoConectado", nombre);

        });
      }
      console.log(`Se ha conectado ${nombre.email}`);
    }


  });

  socket.on("mensaje", async (datos) => {

    await conversacionModel.findOneAndUpdate({ _id: datos.conversacion }, { $push: { mensajes: { nombre: datos.emisor, mensaje: datos.mensaje, email: datos.email } } });
    io.to(usuarios[parseInt(datos.code)]).emit("nuevoMensaje", datos);
  });

  socket.on("disconnect", async () => {

    let desconectado = socket.id
    let indice = usuarios.indexOf(desconectado)
    let codigo

    if (indice !== -1) {

      codigo = await modelUser.findOne({ code: indice }).populate({ path: 'contactos', select: 'nombre code status' })

      if (codigo) {

        let filt = codigo.contactos.filter(x => x.status == "En linea")


        if (filt.length > 0) {

          filt.forEach(x => {
            
            socket.to(usuarios[x.code]).emit("desconectado", codigo);

          });
        }
      }

    }


  });
});
