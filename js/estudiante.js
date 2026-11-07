"use strict";

/* =========================================
   DATOS DE DEMOSTRACIÓN
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

// Conserva los estados originales para recalcular el resumen.
const estadosIniciales = actividades.map(function (actividad) {
    return actividad.estado;
});

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
   SINCRONIZACIÓN DE ENTREGAS
   ========================================= */

function sincronizarEntregas() {
    // Restablece los datos originales antes de aplicar
    // las entregas registradas en esta sesión.
    actividades.forEach(function (actividad, indice) {
        actividad.estado = estadosIniciales[indice];
    });

    EntregasDemo.aplicar(actividades);
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
   CURSOS Y PROGRESO
   ========================================= */

function calcularProgreso(idCurso) {
    const actividadesCurso = actividades.filter(function (actividad) {
        return actividad.idCurso === idCurso;
    });

    if (actividadesCurso.length === 0) {
        return 0;
    }

    const entregadas = actividadesCurso.filter(function (actividad) {
        return actividad.estado === "entregada";
    });

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

function mostrarDetalleCurso(idCurso) {
    const curso = obtenerCurso(idCurso);

    if (!curso) {
        return;
    }

    window.location.href =
        "curso.html?id=" + encodeURIComponent(curso.id);
}

/* =========================================
   ESTADOS DE LAS ACTIVIDADES
   ========================================= */

function obtenerEstadoVisual(actividad) {
    const entrega = EntregasDemo.obtener(actividad.id);

    if (actividad.estado === "entregada") {
        if (entrega && entrega.tardia) {
            return {
                texto: "Entrega tardía",
                clase: "urgente"
            };
        }

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

/* =========================================
   LISTADO DE ACTIVIDADES
   ========================================= */

function mostrarActividades() {
    const filtro = filtroEstado.value;

    const actividadesFiltradas = actividades.filter(function (actividad) {
        return filtro === "todas" || actividad.estado === filtro;
    });

    // Ordena las actividades por fecha límite.
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
                    Ver actividad
                </button>
            </td>
        `;

        listaActividades.appendChild(fila);
    });

    mensajeActividades.hidden = actividadesFiltradas.length > 0;
}

function mostrarDetalleActividad(idActividad) {
    const actividad = actividades.find(function (item) {
        return item.id === idActividad;
    });

    if (!actividad) {
        return;
    }

    window.location.href =
        "actividad.html?id=" + encodeURIComponent(actividad.id);
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

/* =========================================
   ACTUALIZACIÓN DEL PANEL
   ========================================= */

function actualizarPanel() {
    sincronizarEntregas();
    mostrarFechaActual();
    mostrarIndicadores();
    mostrarCursos();
    mostrarActividades();
    actualizarNavegacion();
}

/* =========================================
   INICIALIZACIÓN
   ========================================= */

actualizarPanel();

// Si el navegador recupera la página desde su caché
// al pulsar Atrás, actualiza los datos de la sesión.
window.addEventListener("pageshow", function (evento) {
    if (evento.persisted) {
        actualizarPanel();
    }
});