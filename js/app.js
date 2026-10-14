// JS a HTML
const formularioCancion = document.querySelector('#formulario-cancion');
const inputTitulo = document.querySelector('#titulo');
const inputAlbum = document.querySelector('#album');
const selectCalificacion = document.querySelector('#calificacion');
const selectEstado = document.querySelector('#estado');
const tituloFormulario = document.querySelector('#titulo-formulario');
const botonGuardar = document.querySelector('#boton-guardar');
const botonCancelar = document.querySelector('#boton-cancelar');
const listaCanciones = document.querySelector('#lista-canciones');
const inputBusqueda = document.querySelector('#busqueda');
const filtroEstado = document.querySelector('#filtro-estado');
const mensaje = document.querySelector('#mensaje');
const formularioClima = document.querySelector('#formulario-clima');
const inputCiudad = document.querySelector('#ciudad');
const inputApiKey = document.querySelector('#api-key');
const widgetClima = document.querySelector('#widget-clima');
const botonClima = document.querySelector('#boton-clima');

// Variables para los temas
let canciones = [];
let idEnEdicion = null;
let siguienteId = 1;

function cargarCanciones() {
    try {
        const datosGuardados = localStorage.getItem('enanitos-verdes-canciones');

        if (datosGuardados !== null) {
            canciones = JSON.parse(datosGuardados);
        }
    } catch (error) {
        canciones = [];
        mensaje.textContent = 'No se pudieron recuperar las canciones guardadas.';
    }

    // Sumar ID
    for (let i = 0; i < canciones.length; i++) {
        const id = Number(canciones[i].id);

        if (id >= siguienteId) {
            siguienteId = id + 1;
        }
    }
}

function guardarCanciones() {
    try {
        localStorage.setItem('enanitos-verdes-canciones', JSON.stringify(canciones));
    } catch (error) {
        mensaje.textContent = 'No se pudo guardar. Al recargar podrías perder los cambios.';
    }
}


function mostrarCanciones() {
    listaCanciones.innerHTML = '';

    const busqueda = inputBusqueda.value.toLowerCase().trim();
    const estadoElegido = filtroEstado.value;

    const cancionesVisibles = canciones.filter(function (cancion) {
        const texto = (cancion.titulo + ' ' + cancion.album).toLowerCase();

        if (!texto.includes(busqueda)) {
            return false;
        }

        if (estadoElegido !== 'todas' && cancion.estado !== estadoElegido) {
            return false;
        }

        return true;
    });

    cancionesVisibles.forEach(function (cancion, indice) {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjeta';


        tarjeta.innerHTML = `
            <div class="tarjeta-superior">
                <span class="numero-track"></span>
                <span class="estado-cancion"></span>
            </div>
            <h3 class="nombre-cancion"></h3>
            <p class="album-cancion"></p>
            <p class="calificacion-cancion"></p>
            <div class="acciones">
                <button class="boton boton-estado" type="button">Cambiar estado</button>
                <button class="boton boton-texto editar" type="button">Editar</button>
                <button class="boton boton-texto eliminar" type="button">Eliminar</button>
            </div>
        `;

        tarjeta.querySelector('.numero-track').textContent = indice + 1;
        tarjeta.querySelector('.nombre-cancion').textContent = cancion.titulo;
        tarjeta.querySelector('.album-cancion').textContent = cancion.album;

        if (cancion.calificacion === 0) {
            tarjeta.querySelector('.calificacion-cancion').textContent = 'Sin calificar';
        } else {
            tarjeta.querySelector('.calificacion-cancion').textContent = 'Calificación: ' + cancion.calificacion + '/5';
        }

        if (cancion.estado === 'pendiente') {
            tarjeta.querySelector('.estado-cancion').textContent = 'Pendiente';
            tarjeta.querySelector('.estado-cancion').className = 'estado-cancion pendiente';
            tarjeta.querySelector('.boton-estado').textContent = 'Marcar escuchada';
        } else {
            tarjeta.querySelector('.estado-cancion').textContent = 'Escuchada';
            tarjeta.querySelector('.boton-estado').textContent = 'Marcar pendiente';
        }

        tarjeta.querySelector('.boton-estado').addEventListener('click', function () {
            cambiarEstado(cancion.id);
        });

        tarjeta.querySelector('.editar').addEventListener('click', function () {
            editarCancion(cancion.id);
        });

        tarjeta.querySelector('.eliminar').addEventListener('click', function () {
            eliminarCancion(cancion.id);
        });

        listaCanciones.appendChild(tarjeta);
    });

    if (cancionesVisibles.length === 0) {
        if (canciones.length === 0) {
            listaCanciones.innerHTML = '<div class="vacio"><h3>Tu colección empieza acá</h3><p>Agregá tu primera canción desde el formulario.</p></div>';
        } else {
            listaCanciones.innerHTML = '<div class="vacio"><h3>No encontramos canciones</h3><p>Probá con otra búsqueda o cambiá el filtro.</p></div>';
        }
    }

    document.querySelector('#cantidad-resultados').textContent = cancionesVisibles.length + ' de ' + canciones.length + ' canciones';
    actualizarContadores();
}

function actualizarContadores() {
    let escuchadas = 0;

    for (let i = 0; i < canciones.length; i++) {
        if (canciones[i].estado === 'escuchada') {
            escuchadas = escuchadas + 1;
        }
    }

    document.querySelector('#total-canciones').textContent = canciones.length;
    document.querySelector('#total-escuchadas').textContent = escuchadas;
    document.querySelector('#total-pendientes').textContent = canciones.length - escuchadas;
}

function guardarFormulario(evento) {
    evento.preventDefault();

    const titulo = inputTitulo.value.trim();
    const album = inputAlbum.value.trim();

    if (titulo === '' || album === '') {
        mensaje.textContent = 'Completá el título y el álbum. No pueden ser solamente espacios.';
        return;
    }

    if (idEnEdicion === null) {
        const nuevaCancion = {
            id: String(siguienteId),
            titulo: titulo,
            album: album,
            calificacion: Number(selectCalificacion.value),
            estado: selectEstado.value
        };

        canciones.push(nuevaCancion);
        siguienteId = siguienteId + 1;
        mensaje.textContent = 'Canción agregada a tu colección.';
    } else {
        for (let i = 0; i < canciones.length; i++) {
            if (canciones[i].id === idEnEdicion) {
                canciones[i].titulo = titulo;
                canciones[i].album = album;
                canciones[i].calificacion = Number(selectCalificacion.value);
                canciones[i].estado = selectEstado.value;
            }
        }

        mensaje.textContent = 'Canción actualizada.';
    }

    limpiarFormulario();
    guardarCanciones();
    mostrarCanciones();
}

function editarCancion(id) {
    for (let i = 0; i < canciones.length; i++) {
        if (canciones[i].id === id) {
            inputTitulo.value = canciones[i].titulo;
            inputAlbum.value = canciones[i].album;
            selectCalificacion.value = canciones[i].calificacion;
            selectEstado.value = canciones[i].estado;
            idEnEdicion = id;
        }
    }

    tituloFormulario.textContent = 'Editar canción';
    botonGuardar.textContent = 'Guardar cambios';
    botonCancelar.hidden = false;
    mensaje.textContent = 'Modificá los datos en el formulario.';
    inputTitulo.focus();
}

function limpiarFormulario() {
    formularioCancion.reset();
    idEnEdicion = null;
    tituloFormulario.textContent = 'Nueva canción';
    botonGuardar.textContent = 'Guardar canción +';
    botonCancelar.hidden = true;
}

function cambiarEstado(id) {
    for (let i = 0; i < canciones.length; i++) {
        if (canciones[i].id === id) {
            if (canciones[i].estado === 'pendiente') {
                canciones[i].estado = 'escuchada';
            } else {
                canciones[i].estado = 'pendiente';
            }

            if (idEnEdicion === id) {
                selectEstado.value = canciones[i].estado;
            }
        }
    }

    mensaje.textContent = 'Estado actualizado.';
    guardarCanciones();
    mostrarCanciones();
}

function eliminarCancion(id) {
    const confirmado = window.confirm('¿Querés eliminar esta canción?');

    if (confirmado === false) {
        return;
    }

    canciones = canciones.filter(function (cancion) {
        return cancion.id !== id;
    });

    if (idEnEdicion === id) {
        limpiarFormulario();
    }

    mensaje.textContent = 'Canción eliminada.';
    guardarCanciones();
    mostrarCanciones();
}

async function obtenerClima(ciudad, apiKey) {
    const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(ciudad) + '&appid=' + encodeURIComponent(apiKey) + '&units=metric&lang=es';

    widgetClima.textContent = 'Consultando el clima...';
    botonClima.disabled = true;

    try {
        const respuesta = await fetch(url);

        if (respuesta.ok === false) {
            throw new Error('No se pudo consultar el clima. Revisá la ciudad y tu API key.');
        }

        const datos = await respuesta.json();
        const temperatura = Math.round(datos.main.temp);
        const descripcion = datos.weather[0].description;
        const nombreCiudad = datos.name;

        widgetClima.textContent = nombreCiudad + ': ' + temperatura + ' °C - ' + descripcion;
    } catch (error) {
        widgetClima.textContent = 'No se pudo cargar el clima. Revisá tu conexión, la ciudad y tu API key.';
    }

    botonClima.disabled = false;
}

function consultarClima(evento) {
    evento.preventDefault();

    const ciudad = inputCiudad.value.trim();
    const apiKey = inputApiKey.value.trim();

    if (ciudad === '' || apiKey === '') {
        widgetClima.textContent = 'Completá la ciudad y tu API key.';
        return;
    }

    obtenerClima(ciudad, apiKey);
}

formularioCancion.addEventListener('submit', guardarFormulario);
formularioClima.addEventListener('submit', consultarClima);
inputBusqueda.addEventListener('input', mostrarCanciones);
filtroEstado.addEventListener('change', mostrarCanciones);

botonCancelar.addEventListener('click', function () {
    limpiarFormulario();
    mensaje.textContent = 'Edición cancelada.';
});

cargarCanciones();
mostrarCanciones();
