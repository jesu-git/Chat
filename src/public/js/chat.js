console.log("Desde el javascript")
const socket = io()
const inputMensaje = document.getElementById('mensaje')
const divMensajes = document.getElementById('mensajes')

Swal.fire({
  title: "Identificate",
  input: "text",
  inputLabel: "Ingresa tu nick-name",
  allowOutsideClick: false


}).then(resultado => {

  socket.emit("nombre", resultado.value)
  inputMensaje.focus()
  document.title = `CHAT-${resultado.value}`

  socket.on("nuevoConectado", nombre => {
    //en momentos

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
      title: `${nombre} se ha conectado`
    });

  })

  inputMensaje.addEventListener('keyup', (e) => {

    if (e.code === "Enter" && e.target.value.trim().length > 0) {
      socket.emit("mensaje",{emisor: resultado.value, mensaje: e.target.value })
      e.target.value = ""
    }

  })

  socket.on("comienzo", mensajes => {
    mensajes.forEach(mensaje=> {

      let parrafo = document.createElement('p')
      parrafo.innerHTML = `<strong> ${mensaje.emisor}</strong> dice: <i>${mensaje.mensaje}</i>`
      parrafo.classList.add('mensaje')
      let br = document.createElement('br')
      divMensajes.append(parrafo, br)
      divMensajes.scrollTop = divMensajes.scrollHeight

    });


  })

  socket.on("nuevoMensaje", datos => {

    let parrafo = document.createElement('p')
    parrafo.innerHTML = `<strong> ${datos.emisor}</strong> dice: <i>${datos.mensaje}</i>`
    parrafo.classList.add('mensaje')
    let br = document.createElement('br')
    divMensajes.append(parrafo, br)
    divMensajes.scrollTop = divMensajes.scrollHeight

  })

  socket.on("desconectado",usuario=>{

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
      title: `${usuario} se ha desconectado`
    });

  })

})


