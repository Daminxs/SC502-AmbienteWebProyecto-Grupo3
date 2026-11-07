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

const cursos = [
    {
        id: 1,
        codigo: "SC-502",
        nombre: "Ambiente Web Cliente-Servidor",
        docente: "Laura Solís",
        descripcion:
            "Desarrollo de interfaces y aplicaciones web con una arquitectura cliente-servidor.",
        color: "",
        simbolo: "</>"
    },
    {
        id: 2,
        codigo: "DEMO-02",
        nombre: "Programación Avanzada",
        docente: "Carlos Rojas",
        descripcion:
            "Aplicación de programación orientada a objetos y patrones de diseño.",
        color: "verde",
        simbolo: "{ }"
    },
    {
        id: 3,
        codigo: "DEMO-03",
        nombre: "Bases de Datos",
        docente: "María Vargas",
        descripcion:
            "Diseño de modelos relacionales y organización de la información.",
        color: "arena",
        simbolo: "[ ]"
    }
];

const actividades = [
    {
        id: 1,
        idCurso: 1,
        titulo: "Prototipo del campus virtual",
        fechaLimite: crearFecha(1),
        estado: "pendiente",
        instrucciones:
            "Diseña la pantalla principal del campus usando HTML, CSS y JavaScript. Organiza los archivos por carpetas."
    },
    {
        id: 2,
        idCurso: 2,
        titulo: "Ejercicio de patrones de diseño",
        fechaLimite: crearFecha(3),
        estado: "pendiente",
        instrucciones:
            "Selecciona un patrón de diseño y explica su funcionamiento mediante un ejemplo."
    },
    {
        id: 3,
        idCurso: 3,
        titulo: "Modelo entidad-relación",
        fechaLimite: crearFecha(5),
        estado: "pendiente",
        instrucciones:
            "Representa las entidades, atributos, claves y relaciones del caso de estudio."
    },
    {
        id: 4,
        idCurso: 1,
        titulo: "Estructura semántica de HTML",
        fechaLimite: crearFecha(-3),
        estado: "entregada",
        instrucciones:
            "Construye una página utilizando header, nav, main, section y footer."
    },
    {
        id: 5,
        idCurso: 2,
        titulo: "Fundamentos de clases y objetos",
        fechaLimite: crearFecha(-2),
        estado: "entregada",
        instrucciones:
            "Identifica las propiedades y los métodos de las clases del ejercicio."
    }
];

/* =========================================
   ELEMENTOS DE LA PÁGINA
   ========================================= */

const listaCursos = document.getElementById("listaCursos");
const buscarCurso = document.getElementById("buscarCurso");
const mensajeCursos = document.getElementById("mensajeCursos");

const listaActividades = document.getElementById("listaActividades");
const filtroEstado = document.getElementById("filtroEstado");
const mensajeActividades = document.getElementById("mensajeActividades");

const menuLateral = document.getElementById("menuLateral");
const btnMenu = document.getElementById("btnMenu");

const ventanaDetalle = document.getElementById("ventanaDetalle");
const tituloDetalle = document.getElementById("tituloDetalle");
const contenidoDetalle = document.getElementById("contenidoDetalle");
const btnCerrarDetalle = document.getElementById("btnCerrarDetalle");

/* =========================================
   FUNCIONES GENERALES
   ========================================= */

function formatearFecha(fecha) {
    return fecha.toLocaleDateString("es-CR", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function obtenerCurso(idCurso) {
    return cursos.find(function (curso) {
        return curso.id === idCurso;
    });
}

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function escaparTexto(texto) {
    const elemento = document.createElement("span");
    elemento.textContent = texto;

    return elemento.innerHTML;
}

/* =========================================
   FECHA E INDICADORES
   ========================================= */

function mostrarFechaActual() {
    const fecha = new Date();

    document.getElementById("fechaActual").textContent =
        fecha.toLocaleDateString("es-CR", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });
}

function mostrarIndicadores() {
    const pendientes = actividades.filter(function (actividad) {
        return actividad.estado === "pendiente";
    });

    const entregadas = actividades.filter(function (actividad) {
        return actividad.estado === "entregada";
    });

    document.getElementById("totalCursos").textContent =
        cursos.length;

    document.getElementById("totalPendientes").textContent =
        pendientes.length;

    document.getElementById("totalEntregadas").textContent =
        entregadas.length;
}

/* =========================================
   CURSOS
   ========================================= */

function calcularProgreso(idCurso) {
    const actividadesCurso = actividades.filter(function (actividad) {
        return actividad.idCurso === idCurso;
    });

    const entregadas = actividadesCurso.filter(function (actividad) {
        return actividad.estado === "entregada";
    });

    if (actividadesCurso.length === 0) {
        return 0;
    }

    return Math.round(
        (entregadas.length / actividadesCurso.length) * 100
    );
}

function mostrarCursos() {
    const busqueda = normalizarTexto(buscarCurso.value.trim());

    const cursosFiltrados = cursos.filter(function (curso) {
        const texto = normalizarTexto(
            curso.nombre + " " + curso.codigo
        );

        return texto.includes(busqueda);
    });

    listaCursos.replaceChildren();

    cursosFiltrados.forEach(function (curso) {
        const progreso = calcularProgreso(curso.id);

        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-curso";

        tarjeta.innerHTML = `
            <div class="curso-portada ${curso.color}">
                <span class="curso-codigo">
                    ${escaparTexto(curso.codigo)}
                </span>

                <span class="curso-simbolo" aria-hidden="true">
                    ${escaparTexto(curso.simbolo)}
                </span>
            </div>

            <div class="curso-cuerpo">
                <h3>${escaparTexto(curso.nombre)}</h3>

                <p class="curso-docente">
                    Docente: ${escaparTexto(curso.docente)}
                </p>

                <div class="progreso-texto">
                    <span>Actividades entregadas</span>
                    <strong>${progreso}%</strong>
                </div>

                <progress
                    value="${progreso}"
                    max="100"
                    aria-label="Actividades entregadas del curso">
                    ${progreso}%
                </progress>

                <button
                    class="boton-enlace"
                    type="button"
                    data-curso="${curso.id}">
                    Entrar al curso →
                </button>
            </div>
        `;

        listaCursos.appendChild(tarjeta);
    });

    mensajeCursos.hidden = cursosFiltrados.length > 0;
}

// Abre el aula del curso seleccionado.
// estudiante.html y curso.html deben estar en la carpeta HTML.
function mostrarDetalleCurso(idCurso) {
    const curso = obtenerCurso(idCurso);

    if (!curso) {
        return;
    }

    window.location.href =
        "curso.html?id=" + encodeURIComponent(curso.id);
}

/* =========================================
   ACTIVIDADES
   ========================================= */

function obtenerEstadoVisual(actividad) {
    if (actividad.estado === "entregada") {
        return {
            texto: "Entregada",
            clase: "entregada"
        };
    }

    const horasRestantes =
        (actividad.fechaLimite.getTime() - Date.now()) / 3600000;

    if (horasRestantes < 0) {
        return {
            texto: "Vencida",
            clase: "vencida"
        };
    }

    if (horasRestantes <= 24) {
        return {
            texto: "Menos de 24 horas",
            clase: "urgente"
        };
    }

    if (horasRestantes <= 48) {
        return {
            texto: "Próxima a vencer",
            clase: "urgente"
        };
    }

    return {
        texto: "Pendiente",
        clase: ""
    };
}

function mostrarActividades() {
    const filtro = filtroEstado.value;

    const actividadesFiltradas = actividades.filter(function (actividad) {
        return filtro === "todas" || actividad.estado === filtro;
    });

    actividadesFiltradas.sort(function (a, b) {
        return a.fechaLimite - b.fechaLimite;
    });

    listaActividades.replaceChildren();

    actividadesFiltradas.forEach(function (actividad) {
        const curso = obtenerCurso(actividad.idCurso);
        const estado = obtenerEstadoVisual(actividad);

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${escaparTexto(actividad.titulo)}</td>

            <td>${escaparTexto(curso.nombre)}</td>

            <td>${formatearFecha(actividad.fechaLimite)}</td>

            <td>
                <span class="estado ${estado.clase}">
                    ${estado.texto}
                </span>
            </td>

            <td>
                <button
                    class="boton-enlace"
                    type="button"
                    data-actividad="${actividad.id}">
                    Consultar
                </button>
            </td>
        `;

        listaActividades.appendChild(fila);
    });

    mensajeActividades.hidden = actividadesFiltradas.length > 0;
}

/* =========================================
   DETALLES DE UNA ACTIVIDAD
   ========================================= */

function agregarParrafo(texto, clase = "") {
    const parrafo = document.createElement("p");

    parrafo.textContent = texto;
    parrafo.className = clase;

    contenidoDetalle.appendChild(parrafo);
}

function mostrarDetalleActividad(idActividad) {
    const actividad = actividades.find(function (item) {
        return item.id === idActividad;
    });

    if (!actividad) {
        return;
    }

    const curso = obtenerCurso(actividad.idCurso);
    const estado = obtenerEstadoVisual(actividad);

    tituloDetalle.textContent = actividad.titulo;
    contenidoDetalle.replaceChildren();

    agregarParrafo(curso.nombre, "texto-secundario");

    agregarParrafo(
        "Fecha límite: " +
        formatearFecha(actividad.fechaLimite) +
        " a las 23:59, según la hora local del navegador."
    );

    agregarParrafo("Estado: " + estado.texto);
    agregarParrafo(actividad.instrucciones);

    agregarParrafo(
        "Esta vista permite consultar instrucciones. El formulario de entrega se añadirá en el módulo de actividades.",
        "texto-secundario"
    );

    ventanaDetalle.showModal();
}

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

document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
        cerrarMenu();
    }
});

document.addEventListener("click", function (evento) {
    if (
        !menuLateral.contains(evento.target) &&
        !btnMenu.contains(evento.target)
    ) {
        cerrarMenu();
    }
});

/* =========================================
   NAVEGACIÓN ENTRE SECCIONES
   ========================================= */

function actualizarNavegacion() {
    const destino = window.location.hash || "#resumen";

    document.querySelectorAll(".enlace-menu").forEach(function (enlace) {
        const activo = enlace.getAttribute("href") === destino;

        enlace.classList.toggle("activo", activo);

        if (activo) {
            enlace.setAttribute("aria-current", "location");
        } else {
            enlace.removeAttribute("aria-current");
        }
    });
}

document.querySelectorAll(".enlace-menu").forEach(function (enlace) {
    enlace.addEventListener("click", cerrarMenu);
});

window.addEventListener("hashchange", actualizarNavegacion);

/* =========================================
   BÚSQUEDA, FILTROS Y BOTONES
   ========================================= */

buscarCurso.addEventListener("input", mostrarCursos);

filtroEstado.addEventListener("change", mostrarActividades);

listaCursos.addEventListener("click", function (evento) {
    const boton = evento.target.closest("[data-curso]");

    if (boton) {
        mostrarDetalleCurso(Number(boton.dataset.curso));
    }
});

listaActividades.addEventListener("click", function (evento) {
    const boton = evento.target.closest("[data-actividad]");

    if (boton) {
        mostrarDetalleActividad(Number(boton.dataset.actividad));
    }
});

btnCerrarDetalle.addEventListener("click", function () {
    ventanaDetalle.close();
});

/* =========================================
   INICIALIZACIÓN
   ========================================= */

mostrarFechaActual();
mostrarIndicadores();
mostrarCursos();
mostrarActividades();
actualizarNavegacion();