import express from 'express'
import { Server } from 'socket.io'
import { engine } from 'express-handlebars'
import __dirname from './utils.js'
import path from 'path'



const PORT = 3000
const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, './views'))

app.use('/public', express.static(__dirname + '/public'))

app.get("/", (req, res) => {
    res.status(200).send("SERVER OK")
})
app.get("/chat", (req, res) => {

    res.status(200).render("chat", { titulo: "CHAT" })
})



const server = app.listen(PORT, () => {
    console.log("Server in service")
})

const io = new Server(server)
let usuarios = []
let mensajes = []

io.on("connection", socket => {
    console.log(`Se ha conectado ${socket.id}`)

    socket.on("nombre", nombre => {
        usuarios.push({ nombre, id: socket.id })
        console.log("acaaaaaaaa", usuarios)
        socket.broadcast.emit("nuevoConectado", nombre)
        socket.emit("comienzo", mensajes)
    })

    socket.on("mensaje", datos => {
        mensajes.push(datos)
        io.emit("nuevoMensaje", datos)
    })
    socket.on("disconnect", () => {
        let name = usuarios.find(x =>  x.id === socket.id )
        if (name) {
            io.emit("desconectado", name.nombre)
        }
    })


})
