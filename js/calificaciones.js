"use strict";

/* =========================================
   DATOS DE DEMOSTRACIÓN

   Las ponderaciones suman 100 % por curso.
   Las notas son ejemplos, no datos reales.
   ========================================= */

const cursos = [
    {
        id: 1,
        codigo: "SC-502",
        nombre: "Ambiente Web Cliente-Servidor",
        docente: "Laura Solís",

        actividades: [
            {
                id: 1,
                titulo: "Prototipo del campus virtual",
                ponderacion: 60,
                estadoInicial: "pendiente",
                notaInicial: null,
                retroalimentacion:
                    ""
            },
            {
                id: 4,
                titulo: "Estructura semántica de HTML",
                ponderacion: 40,
                estadoInicial: "entregada",
                notaInicial: 92,
                retroalimentacion:
                    "La estructura semántica está bien organizada. Revisa que todos los campos del formulario tengan etiquetas y comprueba el contraste de los enlaces."
            }
        ]
    },
    {
        id: 2,
        codigo: "DEMO-02",
        nombre: "Programación Avanzada",
        docente: "Carlos Rojas",

        actividades: [
            {
                id: 2,
                titulo: "Ejercicio de patrones de diseño",
                ponderacion: 60,
                estadoInicial: "pendiente",
                notaInicial: null,
                retroalimentacion:
                    ""
            },
            {
                id: 5,
                titulo: "Fundamentos de clases y objetos",
                ponderacion: 40,
                estadoInicial: "entregada",
                notaInicial: 85,
                retroalimentacion:
                    "Identificaste correctamente las clases principales. Mejora la separación de responsabilidades y utiliza nombres más descriptivos para los métodos."
            }
        ]
    },
    {
        id: 3,
        codigo: "DEMO-03",
        nombre: "Bases de Datos",
        docente: "María Vargas",

        actividades: [
            {
                id: 3,
                titulo: "Modelo entidad-relación",
                ponderacion: 100,
                estadoInicial: "pendiente",
                notaInicial: null,
                retroalimentacion:
                    ""
            }
        ]
    }
];

/* =========================================
   ELEMENTOS DE LA PÁGINA
   ========================================= */

const filtroCurso = document.getElementById("filtroCurso");
const resultadosCurso = document.getElementById("resultadosCurso");
const tablaCalificaciones = document.getElementById("tablaCalificaciones");

const listaRetroalimentacion =
    document.getElementById("listaRetroalimentacion");

const menuLateral = document.getElementById("menuLateral");
const btnMenu = document.getElementById("btnMenu");

/* =========================================
   FUNCIONES GENERALES
   ========================================= */

function formatearNumero(numero) {
    return numero.toLocaleString("es-CR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function obtenerCursoSeleccionado() {
    const idCurso = Number(filtroCurso.value);

    return cursos.find(function (curso) {
        return curso.id === idCurso;
    });
}

function crearCelda(texto, clase = "") {
    const celda = document.createElement("td");

    celda.textContent = texto;

    if (clase) {
        celda.className = clase;
    }

    return celda;
}

/* =========================================
   ESTADO ACTUAL DE UNA ACTIVIDAD
   ========================================= */

function obtenerResultadoActividad(actividad) {
    const entrega = EntregasDemo.obtener(actividad.id);

    // Una entrega simulada representa un trabajo nuevo
    // o un reemplazo que todavía no ha sido evaluado.
    if (entrega) {
        return {
            entregada: true,
            nota: null,
            retroalimentacion: "",
            estado: "Por calificar",
            clase: "por-calificar",
            tardia: entrega.tardia === true
        };
    }

    // La comparación con null permite que una nota de 0
    // sea reconocida como una calificación válida.
    if (actividad.notaInicial !== null) {
        return {
            entregada: true,
            nota: actividad.notaInicial,
            retroalimentacion: actividad.retroalimentacion,
            estado: "Calificada",
            clase: "calificada",
            tardia: false
        };
    }

    if (actividad.estadoInicial === "entregada") {
        return {
            entregada: true,
            nota: null,
            retroalimentacion: "",
            estado: "Por calificar",
            clase: "por-calificar",
            tardia: false
        };
    }

    return {
        entregada: false,
        nota: null,
        retroalimentacion: "",
        estado: "Pendiente",
        clase: "",
        tardia: false
    };
}

/* =========================================
   SELECTOR DE CURSOS
   ========================================= */

function cargarSelectorCursos() {
    filtroCurso.replaceChildren();

    cursos.forEach(function (curso) {
        const opcion = document.createElement("option");

        opcion.value = curso.id;
        opcion.textContent = curso.codigo + " · " + curso.nombre;

        filtroCurso.appendChild(opcion);
    });

    // Permite abrir una consulta como:
    // calificaciones.html?id=2
    const parametros = new URLSearchParams(window.location.search);
    const idSolicitado = Number(parametros.get("id"));

    const cursoSolicitado = cursos.find(function (curso) {
        return curso.id === idSolicitado;
    });

    if (cursoSolicitado) {
        filtroCurso.value = String(cursoSolicitado.id);
    }

    filtroCurso.disabled = false;
}

/* =========================================
   CÁLCULOS ACADÉMICOS
   ========================================= */

function calcularResumen(resultados) {
    let entregadas = 0;
    let calificadas = 0;
    let porCalificar = 0;
    let pendientes = 0;

    let puntosAcumulados = 0;
    let ponderacionEvaluada = 0;

    resultados.forEach(function (item) {
        const actividad = item.actividad;
        const resultado = item.resultado;

        if (resultado.entregada) {
            entregadas++;
        } else {
            pendientes++;
        }

        if (resultado.nota !== null) {
            calificadas++;

            puntosAcumulados +=
                resultado.nota * actividad.ponderacion / 100;

            ponderacionEvaluada += actividad.ponderacion;
        } else if (resultado.entregada) {
            porCalificar++;
        }
    });

    const total = resultados.length;

    const progreso = total > 0
        ? Math.round(entregadas / total * 100)
        : 0;

    const promedio = ponderacionEvaluada > 0
        ? puntosAcumulados / ponderacionEvaluada * 100
        : null;

    return {
        total: total,
        entregadas: entregadas,
        calificadas: calificadas,
        porCalificar: porCalificar,
        pendientes: pendientes,
        progreso: progreso,
        puntosAcumulados: puntosAcumulados,
        ponderacionEvaluada: ponderacionEvaluada,
        promedio: promedio
    };
}

/* =========================================
   INFORMACIÓN DEL CURSO
   ========================================= */

function mostrarInformacionCurso(curso) {
    document.getElementById("codigoCursoNotas").textContent =
        curso.codigo;

    document.getElementById("nombreCursoNotas").textContent =
        curso.nombre;

    document.getElementById("docenteCursoNotas").textContent =
        "Docente: " + curso.docente;

    document.getElementById("enlaceAula").href =
        "curso.html?id=" + encodeURIComponent(curso.id);
}

/* =========================================
   INDICADORES DE CALIFICACIONES
   ========================================= */

function mostrarIndicadores(resumen) {
    document.getElementById("promedioEvaluado").textContent =
        resumen.promedio === null
            ? "—"
            : formatearNumero(resumen.promedio);

    document.getElementById("puntosAcumulados").textContent =
        formatearNumero(resumen.puntosAcumulados);

    document.getElementById("ponderacionEvaluada").textContent =
        formatearNumero(resumen.ponderacionEvaluada) + "%";

    const aclaracion = document.getElementById("aclaracionPromedio");

    if (resumen.total === 0) {
        aclaracion.textContent =
            "Todavía no hay actividades configuradas para este curso.";

        return;
    }

    if (resumen.ponderacionEvaluada === 0) {
        aclaracion.textContent =
            "Todavía no hay actividades calificadas. Los 0 puntos acumulados no representan una nota final de cero.";

        return;
    }

    if (resumen.ponderacionEvaluada === 100) {
        aclaracion.textContent =
            "Ya se evaluó el 100 % de la ponderación de este curso de ejemplo. El promedio y los puntos acumulados coinciden.";

        return;
    }

    aclaracion.textContent =
        "El promedio considera únicamente el " +
        formatearNumero(resumen.ponderacionEvaluada) +
        "% del curso que ya fue evaluado. Los puntos acumulados muestran su aporte a la nota final; las actividades sin calificar siguen pendientes.";
}

/* =========================================
   PROGRESO DE ENTREGAS
   ========================================= */

function mostrarProgreso(resumen) {
    document.getElementById("porcentajeProgreso").textContent =
        resumen.progreso + "%";

    const barra = document.getElementById("barraProgreso");

    barra.value = resumen.progreso;
    barra.textContent = resumen.progreso + "%";

    document.getElementById("descripcionProgreso").textContent =
        resumen.entregadas +
        " de " +
        resumen.total +
        " actividades entregadas. Este porcentaje mide entregas, no calificaciones.";

    document.getElementById("cantidadPendientes").textContent =
        resumen.pendientes;

    document.getElementById("cantidadPorCalificar").textContent =
        resumen.porCalificar;

    document.getElementById("cantidadCalificadas").textContent =
        resumen.calificadas;
}

/* =========================================
   TABLA DE CALIFICACIONES
   ========================================= */

function mostrarTablaCalificaciones(resultados) {
    tablaCalificaciones.replaceChildren();

    resultados.forEach(function (item) {
        const actividad = item.actividad;
        const resultado = item.resultado;

        const fila = document.createElement("tr");

        const celdaActividad = crearCelda(actividad.titulo);

        const celdaPonderacion = crearCelda(
            formatearNumero(actividad.ponderacion) + "%"
        );

        let textoNota = "—";
        let textoPuntos = "—";

        if (resultado.nota !== null) {
            textoNota = formatearNumero(resultado.nota);

            textoPuntos = formatearNumero(
                resultado.nota * actividad.ponderacion / 100
            );
        }

        const celdaNota = crearCelda(
            textoNota,
            resultado.nota !== null
                ? "notas-calificacion"
                : "notas-sin-calificar"
        );

        const celdaPuntos = crearCelda(textoPuntos);

        const celdaEstado = document.createElement("td");
        const etiqueta = document.createElement("span");

        etiqueta.className = "estado";

        if (resultado.clase) {
            etiqueta.classList.add(resultado.clase);
        }

        etiqueta.textContent = resultado.tardia
            ? resultado.estado + " · Tardía"
            : resultado.estado;

        celdaEstado.appendChild(etiqueta);

        const celdaDetalle = document.createElement("td");
        const enlace = document.createElement("a");

        enlace.className = "boton-enlace";

        enlace.href =
            "actividad.html?id=" + encodeURIComponent(actividad.id);

        enlace.textContent = "Ver actividad";

        enlace.setAttribute(
            "aria-label",
            "Ver actividad: " + actividad.titulo
        );

        celdaDetalle.appendChild(enlace);

        fila.append(
            celdaActividad,
            celdaPonderacion,
            celdaNota,
            celdaPuntos,
            celdaEstado,
            celdaDetalle
        );

        tablaCalificaciones.appendChild(fila);
    });

    document.getElementById("sinCalificaciones").hidden =
        resultados.length > 0;
}

/* =========================================
   RETROALIMENTACIÓN DEL DOCENTE
   ========================================= */

function mostrarRetroalimentacion(curso, resultados) {
    listaRetroalimentacion.replaceChildren();

    const comentarios = resultados.filter(function (item) {
        return (
            item.resultado.nota !== null &&
            item.resultado.retroalimentacion.trim() !== ""
        );
    });

    comentarios.forEach(function (item) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "notas-comentario";

        const encabezado = document.createElement("div");
        encabezado.className = "notas-comentario-cabecera";

        const titulo = document.createElement("h3");
        titulo.textContent = item.actividad.titulo;

        const nota = document.createElement("span");
        nota.className = "estado calificada";

        nota.textContent =
            formatearNumero(item.resultado.nota) + " / 100";

        encabezado.append(titulo, nota);

        const comentario = document.createElement("p");
        comentario.className = "notas-comentario-texto";

        comentario.textContent =
            item.resultado.retroalimentacion;

        const autor = document.createElement("span");
        autor.className = "notas-comentario-autor";
        autor.textContent = curso.docente + " · Docente";

        tarjeta.append(encabezado, comentario, autor);

        listaRetroalimentacion.appendChild(tarjeta);
    });

    document.getElementById("sinRetroalimentacion").hidden =
        comentarios.length > 0;
}

/* =========================================
   ACTUALIZACIÓN DE LA PANTALLA
   ========================================= */

function actualizarCalificaciones() {
    const curso = obtenerCursoSeleccionado();

    if (!curso) {
        resultadosCurso.hidden = true;
        return;
    }

    // Obtiene el estado actual sin modificar los datos originales.
    const resultados = curso.actividades.map(function (actividad) {
        return {
            actividad: actividad,
            resultado: obtenerResultadoActividad(actividad)
        };
    });

    const resumen = calcularResumen(resultados);

    mostrarInformacionCurso(curso);
    mostrarIndicadores(resumen);
    mostrarProgreso(resumen);
    mostrarTablaCalificaciones(resultados);
    mostrarRetroalimentacion(curso, resultados);

    resultadosCurso.hidden = false;
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

document.querySelectorAll(".enlace-menu").forEach(function (enlace) {
    enlace.addEventListener("click", cerrarMenu);
});

/* =========================================
   EVENTOS E INICIALIZACIÓN
   ========================================= */

filtroCurso.addEventListener("change", actualizarCalificaciones);

cargarSelectorCursos();
actualizarCalificaciones();

// Actualiza las entregas al volver con el botón Atrás.
window.addEventListener("pageshow", function (evento) {
    if (evento.persisted) {
        actualizarCalificaciones();
    }
});