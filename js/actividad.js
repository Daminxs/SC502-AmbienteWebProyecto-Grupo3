"use strict";

/* =========================================
   DATOS DE EJEMPLO
   ========================================= */

function crearFecha(dias) {
    const fecha = new Date();

    fecha.setDate(fecha.getDate() + dias);
    fecha.setHours(23, 59, 0, 0);

    return fecha;
}

const actividades = [
    {
        id: 1,
        idCurso: 1,
        curso: "Ambiente Web Cliente-Servidor",
        titulo: "Prototipo del campus virtual",
        fechaLimite: crearFecha(1),
        estado: "pendiente",
        instrucciones:
            "Diseña la pantalla principal del campus usando HTML, CSS y JavaScript. Organiza los archivos por carpetas."
    },
    {
        id: 2,
        idCurso: 2,
        curso: "Programación Avanzada",
        titulo: "Ejercicio de patrones de diseño",
        fechaLimite: crearFecha(3),
        estado: "pendiente",
        instrucciones:
            "Selecciona un patrón de diseño y explica su funcionamiento mediante un ejemplo."
    },
    {
        id: 3,
        idCurso: 3,
        curso: "Bases de Datos",
        titulo: "Modelo entidad-relación",
        fechaLimite: crearFecha(5),
        estado: "pendiente",
        instrucciones:
            "Representa las entidades, atributos, claves y relaciones del caso de estudio."
    },
    {
        id: 4,
        idCurso: 1,
        curso: "Ambiente Web Cliente-Servidor",
        titulo: "Estructura semántica de HTML",
        fechaLimite: crearFecha(-3),
        estado: "entregada",
        instrucciones:
            "Construye una página utilizando header, nav, main, section y footer."
    },
    {
        id: 5,
        idCurso: 2,
        curso: "Programación Avanzada",
        titulo: "Fundamentos de clases y objetos",
        fechaLimite: crearFecha(-2),
        estado: "entregada",
        instrucciones:
            "Identifica las propiedades y los métodos de las clases del ejercicio."
    }
];

const parametros = new URLSearchParams(window.location.search);
const idActividad = Number(parametros.get("id"));

const actividad = actividades.find(function (item) {
    return item.id === idActividad;
});

/* =========================================
   ELEMENTOS
   ========================================= */

const formEntrega = document.getElementById("formEntrega");
const archivosEntrega = document.getElementById("archivosEntrega");
const comentarioEntrega = document.getElementById("comentarioEntrega");
const listaArchivos = document.getElementById("listaArchivos");
const errorEntrega = document.getElementById("errorEntrega");

const resumenEntrega = document.getElementById("resumenEntrega");
const btnEditarEntrega = document.getElementById("btnEditarEntrega");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");

const confirmacion = document.getElementById("confirmacionEntrega");
const detalleConfirmacion = document.getElementById("detalleConfirmacion");
const btnConfirmarEntrega = document.getElementById("btnConfirmarEntrega");

const menuLateral = document.getElementById("menuLateral");
const btnMenu = document.getElementById("btnMenu");

let entregaEnRevision = null;

/* =========================================
   FUNCIONES GENERALES
   ========================================= */

function formatearFecha(fecha, incluirHora = false) {
    const opciones = {
        day: "numeric",
        month: "short",
        year: "numeric"
    };

    if (incluirHora) {
        opciones.hour = "2-digit";
        opciones.minute = "2-digit";
    }

    return new Date(fecha).toLocaleString("es-CR", opciones);
}

function formatearTamano(bytes) {
    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function agregarTexto(contenedor, texto, clase = "") {
    const parrafo = document.createElement("p");

    parrafo.textContent = texto;
    parrafo.className = clase;

    contenedor.appendChild(parrafo);
}

function mostrarError(mensaje) {
    errorEntrega.textContent = mensaje;
    errorEntrega.hidden = false;
}

function ocultarError() {
    errorEntrega.textContent = "";
    errorEntrega.hidden = true;
}

function mostrarArchivosEn(contenedor, archivos) {
    const lista = document.createElement("ul");
    lista.className = "entrega-archivos";

    archivos.forEach(function (archivo) {
        const elemento = document.createElement("li");

        elemento.textContent =
            archivo.nombre + " · " + formatearTamano(archivo.tamano);

        lista.appendChild(elemento);
    });

    contenedor.appendChild(lista);
}

/* =========================================
   ESTADO DE LA ACTIVIDAD
   ========================================= */

function actualizarEstado() {
    const entrega = EntregasDemo.obtener(actividad.id);
    const etiqueta = document.getElementById("estadoActividad");

    etiqueta.className = "estado";

    if (entrega) {
        etiqueta.textContent = entrega.tardia
            ? "Entrega tardía"
            : "Entregada";

        etiqueta.classList.add(
            entrega.tardia ? "urgente" : "entregada"
        );

        return;
    }

    if (actividad.estado === "entregada") {
        etiqueta.textContent = "Entregada";
        etiqueta.classList.add("entregada");
        return;
    }

    const horas =
        (actividad.fechaLimite.getTime() - Date.now()) / 3600000;

    if (horas < 0) {
        etiqueta.textContent = "Vencida";
        etiqueta.classList.add("vencida");
    } else if (horas <= 48) {
        etiqueta.textContent = "Próxima a vencer";
        etiqueta.classList.add("urgente");
    } else {
        etiqueta.textContent = "Pendiente";
    }
}

/* =========================================
   PRESENTACIÓN DE LA ENTREGA
   ========================================= */

function mostrarResumen() {
    const entrega = EntregasDemo.obtener(actividad.id);

    const tieneEntrega =
        entrega !== null || actividad.estado === "entregada";

    resumenEntrega.replaceChildren();
    resumenEntrega.hidden = !tieneEntrega;

    formEntrega.hidden = tieneEntrega;
    btnEditarEntrega.hidden = !tieneEntrega;
    btnCancelarEdicion.hidden = true;

    document.getElementById("avisoPlazo").hidden = true;

    actualizarEstado();

    if (!tieneEntrega) {
        document.getElementById("avisoPlazo").hidden =
            Date.now() <= actividad.fechaLimite.getTime();

        return;
    }

    if (!entrega) {
        agregarTexto(
            resumenEntrega,
            "Esta actividad aparece entregada en los datos iniciales de ejemplo."
        );

        agregarTexto(
            resumenEntrega,
            "No se proporcionaron archivos ni una fecha de entrega para ese registro.",
            "texto-secundario"
        );

        return;
    }

    agregarTexto(
        resumenEntrega,
        "Entrega simulada registrada el " +
            formatearFecha(entrega.fecha, true) + "."
    );

    agregarTexto(
        resumenEntrega,
        entrega.tardia
            ? "Registrada después de la fecha límite."
            : "Registrada dentro del plazo."
    );

    mostrarArchivosEn(resumenEntrega, entrega.archivos);

    if (entrega.comentario) {
        agregarTexto(resumenEntrega, "Tu comentario:");

        agregarTexto(
            resumenEntrega,
            entrega.comentario,
            "entrega-comentario"
        );
    }

    agregarTexto(
        resumenEntrega,
        "Se conservaron los nombres y tamaños, no el contenido de los archivos.",
        "texto-secundario"
    );
}

/* =========================================
   VALIDACIÓN DE ARCHIVOS
   ========================================= */

function validarArchivos(archivos) {
    const extensiones = [
        "pdf", "doc", "docx", "ppt", "pptx",
        "xls", "xlsx", "zip", "txt", "png", "jpg", "jpeg"
    ];

    const maximoIndividual = 10 * 1024 * 1024;
    const maximoTotal = 25 * 1024 * 1024;

    if (archivos.length === 0) {
        return "Selecciona al menos un archivo.";
    }

    if (archivos.length > 5) {
        return "Puedes seleccionar un máximo de 5 archivos.";
    }

    let total = 0;

    for (const archivo of archivos) {
        const extension = archivo.name.split(".").pop().toLowerCase();

        if (!extensiones.includes(extension)) {
            return "Formato no permitido: " + archivo.name;
        }

        if (archivo.size === 0) {
            return "El archivo está vacío: " + archivo.name;
        }

        if (archivo.size > maximoIndividual) {
            return "El archivo supera los 10 MB: " + archivo.name;
        }

        total += archivo.size;
    }

    if (total > maximoTotal) {
        return "El tamaño total supera los 25 MB.";
    }

    return "";
}

archivosEntrega.addEventListener("change", function () {
    ocultarError();
    listaArchivos.replaceChildren();

    const archivos = Array.from(archivosEntrega.files);

    archivos.forEach(function (archivo) {
        const elemento = document.createElement("li");

        elemento.textContent =
            archivo.name + " · " + formatearTamano(archivo.size);

        listaArchivos.appendChild(elemento);
    });

    if (archivos.length > 0) {
        const error = validarArchivos(archivos);

        if (error) {
            mostrarError(error);
        }
    }
});

/* =========================================
   REVISIÓN Y CONFIRMACIÓN
   ========================================= */

formEntrega.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!actividad) {
        return;
    }

    ocultarError();

    const archivos = Array.from(archivosEntrega.files);
    const error = validarArchivos(archivos);

    if (error) {
        mostrarError(error);
        return;
    }

    entregaEnRevision = {
        comentario: comentarioEntrega.value.trim(),

        archivos: archivos.map(function (archivo) {
            return {
                nombre: archivo.name,
                tamano: archivo.size
            };
        })
    };

    detalleConfirmacion.replaceChildren();

    agregarTexto(detalleConfirmacion, actividad.titulo);

    mostrarArchivosEn(
        detalleConfirmacion,
        entregaEnRevision.archivos
    );

    if (entregaEnRevision.comentario) {
        agregarTexto(
            detalleConfirmacion,
            entregaEnRevision.comentario,
            "entrega-comentario"
        );
    }

    if (EntregasDemo.obtener(actividad.id) ||
        actividad.estado === "entregada") {
        agregarTexto(
            detalleConfirmacion,
            "Esta confirmación reemplazará el registro anterior de demostración."
        );
    }

    if (Date.now() > actividad.fechaLimite.getTime()) {
        agregarTexto(
            detalleConfirmacion,
            "La entrega se registrará como tardía.",
            "entrega-aviso"
        );
    }

    confirmacion.showModal();
});

btnConfirmarEntrega.addEventListener("click", function () {
    if (!actividad || !entregaEnRevision) {
        return;
    }

    btnConfirmarEntrega.disabled = true;

    const ahora = new Date();

    const entrega = {
        comentario: entregaEnRevision.comentario,
        archivos: entregaEnRevision.archivos,
        fecha: ahora.toISOString(),
        tardia: ahora.getTime() > actividad.fechaLimite.getTime()
    };

    try {
        EntregasDemo.guardar(actividad.id, entrega);
    } catch (error) {
        confirmacion.close();

        mostrarError(
            "No se pudo guardar la demostración. Revisa si el navegador permite almacenamiento para esta página."
        );

        btnConfirmarEntrega.disabled = false;
        return;
    }

    confirmacion.close();

    formEntrega.reset();
    listaArchivos.replaceChildren();
    ocultarError();

    mostrarResumen();

    btnEditarEntrega.focus();
    btnConfirmarEntrega.disabled = false;
});

document.getElementById("btnCerrarConfirmacion").addEventListener(
    "click",
    function () {
        confirmacion.close();
    }
);

confirmacion.addEventListener("close", function () {
    entregaEnRevision = null;
});

/* =========================================
   REEMPLAZO DE UNA ENTREGA
   ========================================= */

btnEditarEntrega.addEventListener("click", function () {
    const entrega = EntregasDemo.obtener(actividad.id);

    formEntrega.reset();
    listaArchivos.replaceChildren();
    ocultarError();

    comentarioEntrega.value = entrega ? entrega.comentario : "";

    resumenEntrega.hidden = true;
    btnEditarEntrega.hidden = true;

    formEntrega.hidden = false;
    btnCancelarEdicion.hidden = false;

    document.getElementById("avisoPlazo").hidden =
        Date.now() <= actividad.fechaLimite.getTime();

    archivosEntrega.focus();
});

btnCancelarEdicion.addEventListener("click", function () {
    formEntrega.reset();
    listaArchivos.replaceChildren();
    ocultarError();

    mostrarResumen();
    btnEditarEntrega.focus();
});

/* =========================================
   MENÚ MÓVIL
   ========================================= */

function cerrarMenu() {
    menuLateral.classList.remove("abierto");

    btnMenu.setAttribute("aria-expanded", "false");
    btnMenu.setAttribute("aria-label", "Abrir menú");
}

btnMenu.addEventListener("click", function () {
    const abierto = menuLateral.classList.toggle("abierto");

    btnMenu.setAttribute("aria-expanded", String(abierto));

    btnMenu.setAttribute(
        "aria-label",
        abierto ? "Cerrar menú" : "Abrir menú"
    );
});

document.addEventListener("click", function (evento) {
    if (
        !menuLateral.contains(evento.target) &&
        !btnMenu.contains(evento.target)
    ) {
        cerrarMenu();
    }
});

document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
        cerrarMenu();
    }
});

/* =========================================
   INICIALIZACIÓN
   ========================================= */

if (actividad) {
    document.title = actividad.titulo + " | Campus Virtual";

    document.getElementById("tituloActividad").textContent =
        actividad.titulo;

    document.getElementById("nombreCursoActividad").textContent =
        actividad.curso;

    document.getElementById("fechaLimite").textContent =
        formatearFecha(actividad.fechaLimite);

    document.getElementById("instruccionesActividad").textContent =
        actividad.instrucciones;

    const volverCurso = document.getElementById("volverCurso");

    volverCurso.href =
        "curso.html?id=" + encodeURIComponent(actividad.idCurso);

    volverCurso.textContent = "← Volver al curso";

    document.getElementById("paginaActividad").hidden = false;

    // Elimina los espacios iniciales del textarea.
    comentarioEntrega.value = "";

    mostrarResumen();
} else {
    document.getElementById("errorActividad").hidden = false;
}