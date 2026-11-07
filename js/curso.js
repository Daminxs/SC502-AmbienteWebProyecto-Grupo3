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

        unidades: [
            {
                titulo: "Unidad 1 · Estructura y presentación",
                materiales: [
                    {
                        tipo: "Lectura",
                        titulo: "HTML semántico",
                        contenido:
                            "Organiza las páginas utilizando header, nav, main, section, article y footer. Cada elemento debe representar la función de su contenido."
                    },
                    {
                        tipo: "Práctica",
                        titulo: "Estilos y diseño adaptable",
                        contenido:
                            "Separa los estilos en un archivo CSS. Utiliza Flexbox o Grid para distribuir los elementos y media queries para adaptar la interfaz a pantallas pequeñas."
                    }
                ]
            },
            {
                titulo: "Unidad 2 · Interacción con JavaScript",
                materiales: [
                    {
                        tipo: "Instrucciones",
                        titulo: "Eventos y manipulación del DOM",
                        contenido:
                            "Selecciona elementos con getElementById o querySelector. Registra eventos con addEventListener y actualiza el contenido según las acciones del usuario."
                    }
                ]
            }
        ],

        actividades: [
            {
                id: 1,
                titulo: "Prototipo del campus virtual",
                fechaLimite: crearFecha(1),
                estado: "pendiente",
                instrucciones:
                    "Diseña la pantalla principal del campus usando HTML, CSS y JavaScript. Organiza los archivos por carpetas."
            },
            {
                id: 4,
                titulo: "Estructura semántica de HTML",
                fechaLimite: crearFecha(-3),
                estado: "entregada",
                instrucciones:
                    "Construye una página utilizando header, nav, main, section y footer."
            }
        ],

        estudiantes: ["Alex Mora", "Valeria Rojas"]
    },
    {
        id: 2,
        codigo: "DEMO-02",
        nombre: "Programación Avanzada",
        docente: "Carlos Rojas",
        descripcion:
            "Aplicación de programación orientada a objetos y patrones de diseño.",

        unidades: [
            {
                titulo: "Unidad 1 · Clases y objetos",
                materiales: [
                    {
                        tipo: "Lectura",
                        titulo: "Responsabilidades de una clase",
                        contenido:
                            "Una clase reúne propiedades y comportamientos relacionados. Identifica qué información necesita cada objeto y qué operaciones debe realizar."
                    },
                    {
                        tipo: "Práctica",
                        titulo: "Modelado de objetos",
                        contenido:
                            "Representa un libro mediante una clase. Define sus propiedades y plantea métodos relacionados con las operaciones del caso."
                    }
                ]
            },
            {
                titulo: "Unidad 2 · Patrones de diseño",
                materiales: [
                    {
                        tipo: "Instrucciones",
                        titulo: "Análisis de una solución",
                        contenido:
                            "Describe un problema de diseño, selecciona un patrón que ayude a resolverlo y explica sus responsabilidades y limitaciones."
                    }
                ]
            }
        ],

        actividades: [
            {
                id: 2,
                titulo: "Ejercicio de patrones de diseño",
                fechaLimite: crearFecha(3),
                estado: "pendiente",
                instrucciones:
                    "Selecciona un patrón de diseño y explica su funcionamiento mediante un ejemplo."
            },
            {
                id: 5,
                titulo: "Fundamentos de clases y objetos",
                fechaLimite: crearFecha(-2),
                estado: "entregada",
                instrucciones:
                    "Identifica las propiedades y los métodos de las clases del ejercicio."
            }
        ],

        estudiantes: ["Alex Mora", "Daniel Campos"]
    },
    {
        id: 3,
        codigo: "DEMO-03",
        nombre: "Bases de Datos",
        docente: "María Vargas",
        descripcion:
            "Diseño de modelos relacionales y organización de la información.",

        unidades: [
            {
                titulo: "Unidad 1 · Modelo relacional",
                materiales: [
                    {
                        tipo: "Lectura",
                        titulo: "Entidades, atributos y claves",
                        contenido:
                            "Identifica las entidades del caso, sus atributos y sus claves primarias. Representa las relaciones mediante claves foráneas."
                    },
                    {
                        tipo: "Práctica",
                        titulo: "Relaciones entre tablas",
                        contenido:
                            "Distingue relaciones uno a muchos y muchos a muchos. Para estas últimas, utiliza una tabla intermedia con las claves correspondientes."
                    }
                ]
            },
            {
                titulo: "Unidad 2 · Organización de datos",
                materiales: [
                    {
                        tipo: "Instrucciones",
                        titulo: "Revisión del modelo",
                        contenido:
                            "Comprueba que cada tabla tenga una clave primaria y que las relaciones representen las reglas del caso. Revisa los datos repetidos y las dependencias."
                    }
                ]
            }
        ],

        actividades: [
            {
                id: 3,
                titulo: "Modelo entidad-relación",
                fechaLimite: crearFecha(5),
                estado: "pendiente",
                instrucciones:
                    "Representa las entidades, atributos, claves y relaciones del caso de estudio."
            }
        ],

        estudiantes: ["Alex Mora", "Valeria Rojas", "Daniel Campos"]
    }
];

/* =========================================
   CURSO SELECCIONADO
   ========================================= */

const parametros = new URLSearchParams(window.location.search);
const idCurso = Number(parametros.get("id"));

const cursoSeleccionado = cursos.find(function (curso) {
    return curso.id === idCurso;
});

// Conserva los estados originales para poder recalcularlos.
const estadosIniciales = cursoSeleccionado
    ? cursoSeleccionado.actividades.map(function (actividad) {
        return actividad.estado;
    })
    : [];

/* =========================================
   ELEMENTOS DE LA PÁGINA
   ========================================= */

const menuLateral = document.getElementById("menuLateral");
const btnMenu = document.getElementById("btnMenu");

const filtroActividad = document.getElementById("filtroActividad");
const actividadesCurso = document.getElementById("actividadesCurso");

const pestanas = document.querySelectorAll(".aula-pestana");

/* =========================================
   FUNCIONES GENERALES
   ========================================= */

function escaparTexto(texto) {
    const elemento = document.createElement("span");

    elemento.textContent = texto;

    return elemento.innerHTML;
}

function formatearFecha(fecha) {
    return fecha.toLocaleDateString("es-CR", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function obtenerIniciales(nombre) {
    return nombre
        .split(" ")
        .filter(function (parte) {
            return parte !== "";
        })
        .slice(0, 2)
        .map(function (parte) {
            return parte.charAt(0);
        })
        .join("")
        .toUpperCase();
}

/* =========================================
   SINCRONIZACIÓN DE ENTREGAS
   ========================================= */

function sincronizarEntregas() {
    if (!cursoSeleccionado) {
        return;
    }

    cursoSeleccionado.actividades.forEach(
        function (actividad, indice) {
            actividad.estado = estadosIniciales[indice];
        }
    );

    EntregasDemo.aplicar(cursoSeleccionado.actividades);
}

/* =========================================
   INFORMACIÓN GENERAL
   ========================================= */

function mostrarInformacionCurso() {
    document.title =
        cursoSeleccionado.nombre + " | Campus Virtual";

    document.getElementById("codigoCurso").textContent =
        cursoSeleccionado.codigo;

    document.getElementById("nombreCurso").textContent =
        cursoSeleccionado.nombre;

    document.getElementById("descripcionCurso").textContent =
        cursoSeleccionado.descripcion;

    document.getElementById("docenteCurso").textContent =
        cursoSeleccionado.docente;

    document.getElementById("totalUnidades").textContent =
        cursoSeleccionado.unidades.length;

    const entregadas = cursoSeleccionado.actividades.filter(
        function (actividad) {
            return actividad.estado === "entregada";
        }
    );

    document.getElementById("avanceCurso").textContent =
        entregadas.length +
        " de " +
        cursoSeleccionado.actividades.length;
}

/* =========================================
   CONTENIDOS POR UNIDAD
   ========================================= */

function mostrarUnidades() {
    const contenedor = document.getElementById("listaUnidades");

    contenedor.replaceChildren();

    cursoSeleccionado.unidades.forEach(function (unidad, indice) {
        const detalle = document.createElement("details");
        detalle.className = "aula-unidad";

        // La primera unidad aparece abierta.
        detalle.open = indice === 0;

        const resumen = document.createElement("summary");
        resumen.textContent = unidad.titulo;

        detalle.appendChild(resumen);

        unidad.materiales.forEach(function (material) {
            const articulo = document.createElement("article");
            articulo.className = "aula-material";

            const tipo = document.createElement("span");
            tipo.className = "etiqueta";
            tipo.textContent = material.tipo;

            const titulo = document.createElement("h3");
            titulo.textContent = material.titulo;

            const contenido = document.createElement("p");
            contenido.textContent = material.contenido;

            articulo.append(tipo, titulo, contenido);
            detalle.appendChild(articulo);
        });

        contenedor.appendChild(detalle);
    });
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
    const filtro = filtroActividad.value;

    const actividadesFiltradas =
        cursoSeleccionado.actividades.filter(function (actividad) {
            return filtro === "todas" || actividad.estado === filtro;
        });

    // Primero pendientes; dentro de cada grupo, por fecha límite.
    actividadesFiltradas.sort(function (a, b) {
        if (a.estado !== b.estado) {
            return a.estado === "pendiente" ? -1 : 1;
        }

        return a.fechaLimite - b.fechaLimite;
    });

    actividadesCurso.replaceChildren();

    actividadesFiltradas.forEach(function (actividad) {
        const estado = obtenerEstadoVisual(actividad);
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${escaparTexto(actividad.titulo)}</td>

            <td>${formatearFecha(actividad.fechaLimite)}</td>

            <td>
                <span class="estado ${estado.clase}">
                    ${estado.texto}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="boton-enlace"
                    data-actividad="${actividad.id}">
                    Ver actividad
                </button>
            </td>
        `;

        actividadesCurso.appendChild(fila);
    });

    document.getElementById("sinActividades").hidden =
        actividadesFiltradas.length > 0;
}

function mostrarDetalleActividad(idActividad) {
    if (!cursoSeleccionado) {
        return;
    }

    const actividad = cursoSeleccionado.actividades.find(
        function (item) {
            return item.id === idActividad;
        }
    );

    if (!actividad) {
        return;
    }

    window.location.href =
        "actividad.html?id=" + encodeURIComponent(actividad.id);
}

/* =========================================
   PARTICIPANTES
   ========================================= */

function mostrarParticipantes() {
    const contenedor = document.getElementById("participantesCurso");

    const participantes = [
        {
            nombre: cursoSeleccionado.docente,
            rol: "Docente"
        }
    ];

    cursoSeleccionado.estudiantes.forEach(function (nombre) {
        participantes.push({
            nombre: nombre,
            rol: "Estudiante"
        });
    });

    contenedor.replaceChildren();

    participantes.forEach(function (persona) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "aula-persona";

        const avatar = document.createElement("span");
        avatar.className = "avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = obtenerIniciales(persona.nombre);

        const informacion = document.createElement("div");

        const nombre = document.createElement("h3");
        nombre.textContent = persona.nombre;

        const rol = document.createElement("p");
        rol.textContent = persona.rol;

        informacion.append(nombre, rol);
        tarjeta.append(avatar, informacion);

        contenedor.appendChild(tarjeta);
    });
}

/* =========================================
   PESTAÑAS DEL CURSO
   ========================================= */

function activarPestana(pestanaSeleccionada) {
    pestanas.forEach(function (pestana) {
        const activa = pestana === pestanaSeleccionada;

        pestana.classList.toggle("activa", activa);
        pestana.setAttribute("aria-selected", String(activa));
        pestana.tabIndex = activa ? 0 : -1;

        const idPanel = pestana.getAttribute("aria-controls");

        document.getElementById(idPanel).hidden = !activa;
    });
}

pestanas.forEach(function (pestana, indice) {
    pestana.addEventListener("click", function () {
        activarPestana(pestana);
    });

    // Navegación accesible mediante teclado.
    pestana.addEventListener("keydown", function (evento) {
        let siguiente = indice;

        if (evento.key === "ArrowRight") {
            siguiente = (indice + 1) % pestanas.length;
        } else if (evento.key === "ArrowLeft") {
            siguiente =
                (indice - 1 + pestanas.length) % pestanas.length;
        } else if (evento.key === "Home") {
            siguiente = 0;
        } else if (evento.key === "End") {
            siguiente = pestanas.length - 1;
        } else {
            return;
        }

        evento.preventDefault();

        activarPestana(pestanas[siguiente]);
        pestanas[siguiente].focus();
    });
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

document.querySelectorAll(".enlace-menu").forEach(function (enlace) {
    enlace.addEventListener("click", cerrarMenu);
});

/* =========================================
   FILTRO Y BOTONES DE ACTIVIDADES
   ========================================= */

filtroActividad.addEventListener("change", function () {
    if (cursoSeleccionado) {
        mostrarActividades();
    }
});

actividadesCurso.addEventListener("click", function (evento) {
    const boton = evento.target.closest("[data-actividad]");

    if (boton && cursoSeleccionado) {
        mostrarDetalleActividad(Number(boton.dataset.actividad));
    }
});

/* =========================================
   ACTUALIZACIÓN DEL RESUMEN
   ========================================= */

function actualizarResumenCurso() {
    if (!cursoSeleccionado) {
        return;
    }

    sincronizarEntregas();
    mostrarInformacionCurso();
    mostrarActividades();
}

/* =========================================
   INICIALIZACIÓN
   ========================================= */

if (cursoSeleccionado) {
    actualizarResumenCurso();
    mostrarUnidades();
    mostrarParticipantes();

    document.getElementById("aulaCurso").hidden = false;
} else {
    document.getElementById("errorCurso").hidden = false;
}

// Actualiza las entregas al regresar con el botón Atrás.
// Conserva la pestaña seleccionada y las unidades abiertas.
window.addEventListener("pageshow", function (evento) {
    if (evento.persisted && cursoSeleccionado) {
        actualizarResumenCurso();
    }
});