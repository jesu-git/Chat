
const socket = io()
const inputMensaje = document.getElementById('mensaje')
const divMensajes = document.getElementById('mensajes')

const chat = document.querySelector("#chat")
const contactos = document.querySelector("#contactos")
const perfil = document.querySelector("#perfil")
const buscar = document.querySelector("#buscar")
const logout = document.querySelector("#logout")

const container = document.querySelector(".conteiner-all")
const conteiner_Chat = document.querySelector("#chat-container")
const conteiner_conectados = document.querySelector("#conectados-container")
const conteiner_contact = document.querySelector("#contact-container")
const conteiner_Profile = document.querySelector("#profile-container")
const conteiner_solicitud = document.querySelector("#solicitud-container")
const botonesAceptar = document.querySelectorAll(".btnOK")
const buscador = document.querySelector("#searchButton")
const btn_show = document.querySelectorAll('.conectados-button')
const nombreChat = document.querySelector(".chat-header")

const usuario_buscado = document.querySelector(".contenido").value
let user_name
let id_conversacion
let contacto_enviar

const notificacion = (mensaje, icon) => {

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  Toast.fire({
    icon: icon,
    title: mensaje
  });
}


fetch("http://localhost:3000/user", {
  method: "get",
  headers: {
    "content-type": "application/json"
  }
}

).then(resultado => resultado.json())
  .then((data) => {


    socket.emit("nombre", data)
    document.title = `CHAT-${data.nombre}`
    user_name = data

    socket.on("nuevoConectado", nombre => {
      console.log("--?", nombre)
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "success",
        title: `${nombre.nombre} se ha conectado`
      });
      let newLi = document.createElement('li')
      newLi.classList.add('contact-item-chat')
      newLi.setAttribute("code", nombre.code)
      let imagen = document.createElement('img')
      let btn_new = document.createElement('button')
      let texto = document.createElement('h4')
      let contenedorDiv = document.createElement('div')
      let pTxt = document.createElement('p')

      texto.innerHTML = `${nombre.nombre} ${nombre.apellido}`
      btn_new.append(texto)
      imagen.setAttribute('src', "https://via.placeholder.com/50")

      btn_new.classList.add('conectados-button')
      btn_new.setAttribute("data-user-email", `${nombre.email}`)
      btn_new.setAttribute("nombre", `${nombre.nombre}`)
      btn_new.setAttribute("apellido", `${nombre.apellido}`)
      btn_new.setAttribute("code", `${nombre.code}`)

      contenedorDiv.classList.add('aviso-mensaje')
      contenedorDiv.classList.add('oculto')
      contenedorDiv.setAttribute("code", `${nombre.code}`)

      pTxt.innerHTML = 'Mensaje'
      pTxt.classList.add('aviso-letra')
      contenedorDiv.append(pTxt)
      btn_new.addEventListener('click', (e) => {

        const uEmail = btn_new.getAttribute('data-user-email')
        nombreChat.innerHTML = ""
        const nombres = btn_new.getAttribute('nombre')
        const apellidos = btn_new.getAttribute('apellido')
        contacto_enviar = btn_new.getAttribute('code')

        let remover = document.querySelectorAll(".aviso-mensaje")
        remover.forEach((x) => {

          let codeBurbuja = x.getAttribute('code')
          if (codeBurbuja == contacto_enviar) {

            x.classList.add("oculto")
          }



        })
        let nombre = document.createElement('p')
        nombre.innerHTML = `${nombres} ${apellidos}`
        nombreChat.append(nombre)

        fetch("http://localhost:3000/api/tools/checkTalk", {

          method: 'post',
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ dato: uEmail })
        })
          .then(respuesta => respuesta.json())
          .then((data) => {


            id_conversacion = data.id
            divMensajes.innerHTML = ""
            if (data.mensajes.length > 0) {
              data.mensajes.forEach((x) => {


                let parrafo = document.createElement('p')
                parrafo.innerHTML = `<strong> ${x.nombre}</strong> <br> <i>${x.mensaje}</i>`
                parrafo.classList.add('mensaje')
                parrafo.classList.add('message')

                if (mensaje.nombre == user_name) {

                  parrafo.classList.add('user-message')

                } else {

                  parrafo.classList.add('bot-message')

                }
                let br = document.createElement('br')
                divMensajes.append(parrafo, br)
                divMensajes.scrollTop = divMensajes.scrollHeight
              })

            }


            nombreChat.innerHTML = ""

            let nombres = btn_new.getAttribute('nombre')
            let apellidos = btn_new.getAttribute('apellido')

            let nombre = document.createElement('p')
            nombre.innerHTML = `${nombres} ${apellidos}`
            nombreChat.append(nombre)
          })


      })
      newLi.append(imagen, btn_new, contenedorDiv)
      let lista = document.querySelector('.contacts-list-chat')
      lista.append(newLi)
      
      let sinContacto = document.querySelector('.no-contactos')
      console.log("elemento---",sinContacto)

      sinContacto.remove()



    })
    inputMensaje.addEventListener('keyup', (e) => {

      if (e.code === "Enter" && e.target.value.trim().length > 0) {

        if (contacto_enviar == undefined) return notificacion('No has seleccionado un contacto', 'error')

        let parrafo = document.createElement('p')
        parrafo.innerHTML = `<strong> ${data.nombre}</strong> <br> <i>${e.target.value}</i>`
        parrafo.classList.add('mensaje')
        parrafo.classList.add('message')

        if (user_name == data.nombre) {
          parrafo.classList.add('user-message')
        } else {

          parrafo.classList.add('bot-message')
        }

        let br = document.createElement('br')
        divMensajes.append(parrafo, br)
        divMensajes.scrollTop = divMensajes.scrollHeight
        socket.emit("mensaje", { emisor: data.nombre, mensaje: e.target.value, email: data.email, conversacion: id_conversacion, code: contacto_enviar, me: user_name.code })
        e.target.value = ""
      }

    })
    socket.on("nuevoMensaje", datos => {

      let parrafo = document.createElement('p')
      console.log("contactoo env", contacto_enviar)

      if (contacto_enviar != datos.me || contacto_enviar == undefined) {

        let xConect = document.querySelectorAll(".aviso-mensaje")

        return xConect.forEach((x) => {

          let seleccionado = x.getAttribute("code")

          if (datos.me == parseInt(seleccionado)) {

            console.log("----->>>>x", x)
            x.classList.remove("oculto")
          }
        })

      }
      parrafo.innerHTML = `<strong> ${datos.emisor}</strong> <br> <i>${datos.mensaje}</i>`
      parrafo.classList.add('mensaje')
      parrafo.classList.add('message')

      if (user_name == datos.emisor) {

        parrafo.classList.add('user-message')

      } else {

        parrafo.classList.add('bot-message')
      }

      let br = document.createElement('br')
      divMensajes.append(parrafo, br)
      divMensajes.scrollTop = divMensajes.scrollHeight

    })
    socket.on("desconectado", usuario => {


      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "success",
        title: `${usuario.nombre} se ha desconectado`
      });

      let listado = document.querySelectorAll('.contact-item-chat')
      listado.forEach((x) => {

        let elemento = x.getAttribute('code')
        
        if (elemento == usuario.code) {

          x.remove()

        }
      })
      let checkLi = document.querySelectorAll('.contact-item-chat')
      console.log(checkLi)
      if(checkLi.length < 1 || checkLi == 0){

        let parrafo = document.createElement('p')
        parrafo.classList.add('no-contactos')
        parrafo.innerHTML = 'No hay contactos en linea'

        let list = document.querySelector('.contacts-list-chat') 
        list.append(parrafo)

      }
    })

  })

// Botones de nav
chat.addEventListener("click", (e) => {

  conteiner_Chat.classList.remove("oculto")
  conteiner_conectados.classList.remove("oculto")
  conteiner_contact.classList.add("oculto")
  conteiner_Profile.classList.add("oculto")
  conteiner_solicitud.classList.add("oculto")

})
contactos.addEventListener("click", (e) => {

  conteiner_contact.classList.remove("oculto")
  conteiner_conectados.classList.add("oculto")
  conteiner_Profile.classList.add("oculto")
  conteiner_Chat.classList.add("oculto")
  conteiner_solicitud.classList.add("oculto")

})
perfil.addEventListener("click", (e) => {

  conteiner_Profile.classList.remove("oculto")
  conteiner_contact.classList.add("oculto")
  conteiner_conectados.classList.add("oculto")
  conteiner_Chat.classList.add("oculto")
  conteiner_solicitud.classList.add("oculto")

})
buscar.addEventListener("click", (e => {

  conteiner_solicitud.classList.remove("oculto")
  conteiner_contact.classList.add("oculto")
  conteiner_Chat.classList.add("oculto")
  conteiner_Profile.classList.add("oculto")
  conteiner_conectados.classList.add("oculto")

}))
logout.addEventListener("click", (e) => {

  fetch("http://localhost:3000/api/acceso/logout", {
    method: "get"

  })
    .then(respuesta => respuesta.json())
    .then((data) => {

      if (!data) {

        notificacion('ERROR, no se pudo cerrar session!', 'success')

      }

      if (data == "Session cerrada") {

        window.location.href = "http://localhost:3000"
      }
    })
})

//botones

buscador.addEventListener("click", (e) => {

  const usuario_buscado = document.querySelector(".contenido").value

  fetch("http://localhost:3000/api/tools/filter", {

    method: "post",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ email: usuario_buscado })

  })
    .then(resultado => resultado.json())
    .then((data) => {

      const resultado = document.querySelector(".resultados")

      if (data == "El usuario que buscas no existe") {

        resultado.innerHTML = ""
        resultado.classList.remove("oculto")

        const parrafo = document.createElement("p")
        const divNegativo = document.createElement("div")

        parrafo.innerHTML = "Usuario no encontrado"
        divNegativo.append(parrafo)
        resultado.append(divNegativo)
      }
      if (data == 'El usuario ya esta en tus contactos') {
        notificacion('El usuario ya esta en tus contactos', 'error')
      }
      if (data == "Solicitud pendiente") {

        resultado.innerHTML = ""
        resultado.classList.remove("oculto")

        const parrafo = document.createElement("p")
        const divNegativo = document.createElement("div")

        parrafo.innerHTML = "Solicitud pendiente"
        divNegativo.append(parrafo)
        resultado.append(divNegativo)
      }
      if (typeof (data) == "object") {

        resultado.innerHTML = ""
        const divContenedor = document.createElement('div')
        divContenedor.classList.add("solicitud")

        const contenedor = document.createElement('span')
        contenedor.innerHTML = `${data.email}`
        contenedor.classList.add("solicitante-nombre")

        const divBotones = document.createElement('div')
        divBotones.classList.add("botones")


        const btn = document.createElement('button')
        btn.innerHTML = "Invitar"
        btn.classList.add('aceptar')
        btn.addEventListener("click", (e) => {

          fetch("http://localhost:3000/api/tools/createSolicitud", {

            method: "post",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({ solicitante: user_name._id, receptor: data._id })
          })
            .then(resultado => resultado.json())
            .then((data) => {

              if (data == "Solicitud enviada") {

                resultado.classList.add("oculto")
                notificacion('Solicitud enviada', 'success')

              }
              if (data == "Error en proceso de solicitud") {

                notificacion('Error en proceso de solicitud', 'error')

              }
            })

        })

        const btnRemove = document.createElement("button")
        btnRemove.classList.add("rechazar")
        btnRemove.innerHTML = "remover"
        btnRemove.addEventListener("click", (e) => {

          resultado.classList.add("oculto")
        })
        divBotones.append(btn, btnRemove)
        divContenedor.append(contenedor, divBotones)

        resultado.append(divContenedor)
        resultado.classList.remove("oculto")
      }


    })
})
botonesAceptar.forEach(boton => {

  boton.addEventListener("click", function () {

    const idSolicitud = this.getAttribute("product-id")

    fetch("http://localhost:3000/api/tools/addContact", {
      method: "post",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ idSolicitud })


    })
      .then(respuesta => respuesta.json())
      .then((data) => {

        if (data == "Solicitud aprobada") {

          const DivSolicitud = document.getElementById(idSolicitud)
          DivSolicitud.remove()
          notificacion('Solicitud aceptada', 'success')

        }
        if (data == "Ya esta en tus conctactos") {

          notificacion('Ya esta en tus conctactos', 'error')

        }
      })
  })
})
btn_show.forEach((boton) => {

  const userEmail = boton.getAttribute('data-user-email')

  boton.addEventListener("click", (e) => {


    nombreChat.innerHTML = ""
    const nombres = boton.getAttribute('nombre')
    const apellidos = boton.getAttribute('apellido')
    contacto_enviar = boton.getAttribute('code')

    let remover = document.querySelectorAll(".aviso-mensaje")
    remover.forEach((x) => {

      let codeBurbuja = x.getAttribute('code')
      if (codeBurbuja == contacto_enviar) {

        x.classList.add("oculto")
      }



    })
    let nombre = document.createElement('p')
    nombre.innerHTML = `${nombres} ${apellidos}`
    nombreChat.append(nombre)

    fetch("http://localhost:3000/api/tools/checkTalk", {

      method: 'post',
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ dato: userEmail })
    })
      .then(respuesta => respuesta.json())
      .then((data) => {


        id_conversacion = data.id
        divMensajes.innerHTML = ""
        if (data.mensajes.length > 0) {
          data.mensajes.forEach((x) => {


            let parrafo = document.createElement('p')
            parrafo.innerHTML = `<strong> ${x.nombre}</strong> <br> <i>${x.mensaje}</i>`
            parrafo.classList.add('mensaje')
            parrafo.classList.add('message')

            if (mensaje.nombre == user_name) {

              parrafo.classList.add('user-message')

            } else {

              parrafo.classList.add('bot-message')

            }
            let br = document.createElement('br')
            divMensajes.append(parrafo, br)
            divMensajes.scrollTop = divMensajes.scrollHeight
          })

        }


        nombreChat.innerHTML = ""

        const nombres = boton.getAttribute('nombre')
        const apellidos = boton.getAttribute('apellido')

        let nombre = document.createElement('p')
        nombre.innerHTML = `${nombres} ${apellidos}`
        nombreChat.append(nombre)
      })



  })
})
