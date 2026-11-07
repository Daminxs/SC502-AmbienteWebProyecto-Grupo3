console.log("Bienvenido al panel de administración del Campus Virtual");

const roles = [
    {
        nombre: "Estudiante",
        permisos: ["Consultar sus cursos y materiales", "Realizar entregas", "Ver calificaciones y progreso"]
    },
    {
        nombre: "Docente",
        permisos: ["Administrar sus cursos", "Publicar contenidos y asignaciones", "Calificar entregas"]
    },
    {
        nombre: "Administrador",
        permisos: ["Gestionar usuarios y roles", "Administrar cursos y períodos", "Consultar información general"]
    }
];

const periodos = ["I Cuatrimestre 2026", "II Cuatrimestre 2026", "III Cuatrimestre 2026"];

let usuarios = [
    { id: 1, nombre: "Laura", apellidos: "Jiménez Solano", correo: "ljimenez@ufide.ac.cr", rol: "Administrador", activo: true },
    { id: 2, nombre: "Carlos", apellidos: "Mora Rojas", correo: "cmora@ufide.ac.cr", rol: "Docente", activo: true },
    { id: 3, nombre: "Andrea", apellidos: "Vargas Quesada", correo: "avargas@ufide.ac.cr", rol: "Docente", activo: true },
    { id: 4, nombre: "Daniela", apellidos: "Castro Pérez", correo: "dcastro@ufide.ac.cr", rol: "Estudiante", activo: true },
    { id: 5, nombre: "Mateo", apellidos: "Araya Soto", correo: "maraya@ufide.ac.cr", rol: "Estudiante", activo: true },
    { id: 6, nombre: "Valeria", apellidos: "Chaves Brenes", correo: "vchaves@ufide.ac.cr", rol: "Estudiante", activo: false }
];

let cursos = [
    { id: 1, codigo: "SC502", nombre: "Ambiente Web Cliente Servidor", docenteId: 2, periodo: "III Cuatrimestre 2026", matriculados: 28, activo: true },
    { id: 2, codigo: "SC504", nombre: "Lenguaje de Base de Datos", docenteId: 3, periodo: "III Cuatrimestre 2026", matriculados: 24, activo: true },
    { id: 3, codigo: "SC301", nombre: "Programación II", docenteId: 2, periodo: "II Cuatrimestre 2026", matriculados: 30, activo: false }
];

let siguienteId = 100;

function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function nombreCompleto(usuario) {
    return usuario.nombre + " " + usuario.apellidos;
}

function buscarUsuario(id) {
    for (const usuario of usuarios) {
        if (usuario.id === id) {
            return usuario;
        }
    }
    return null;
}

function buscarCurso(id) {
    for (const curso of cursos) {
        if (curso.id === id) {
            return curso;
        }
    }
    return null;
}

function contarPorRol(nombreRol) {
    let total = 0;
    for (const usuario of usuarios) {
        if (usuario.rol === nombreRol) {
            total++;
        }
    }
    return total;
}

function insigniaEstado(activo) {
    if (activo) {
        return `<span class="badge bg-success">Activo</span>`;
    }
    return `<span class="badge bg-secondary">Inactivo</span>`;
}

function cargarOpcionesRol() {
    const selectRol = document.getElementById("rolUsuario");
    selectRol.innerHTML = "";
    for (const rol of roles) {
        selectRol.innerHTML += `<option value="${rol.nombre}">${rol.nombre}</option>`;
    }
}

function cargarOpcionesPeriodo() {
    const selectPeriodo = document.getElementById("periodoCurso");
    selectPeriodo.innerHTML = "";
    for (const periodo of periodos) {
        selectPeriodo.innerHTML += `<option value="${periodo}">${periodo}</option>`;
    }
}

function cargarOpcionesDocente() {
    const selectDocente = document.getElementById("docenteCurso");
    selectDocente.innerHTML = `<option value="0">Sin asignar</option>`;
    for (const usuario of usuarios) {
        if (usuario.rol === "Docente" && usuario.activo) {
            selectDocente.innerHTML += `<option value="${usuario.id}">${escapar(nombreCompleto(usuario))}</option>`;
        }
    }
}

function actualizarTodo() {
    mostrarResumen();
    mostrarUsuarios();
    mostrarRoles();
    mostrarCursos();
}

function mostrarResumen() {
    let cursosActivos = 0;
    for (const curso of cursos) {
        if (curso.activo) {
            cursosActivos++;
        }
    }

    document.getElementById("totalUsuarios").textContent = usuarios.length;
    document.getElementById("totalEstudiantes").textContent = contarPorRol("Estudiante");
    document.getElementById("totalDocentes").textContent = contarPorRol("Docente");
    document.getElementById("totalCursos").textContent = cursosActivos;

    const lista = document.getElementById("listaRecientes");
    lista.innerHTML = "";

    for (let i = usuarios.length - 1; i >= 0 && i >= usuarios.length - 4; i--) {
        const usuario = usuarios[i];
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${escapar(nombreCompleto(usuario))} - ${escapar(usuario.correo)}</span>
                <span class="badge bg-danger">${usuario.rol}</span>
            </li>`;
    }
}

function mostrarUsuarios() {
    const texto = document.getElementById("buscarUsuario").value.trim().toLowerCase();
    const filtro = document.getElementById("filtroRol").value;
    const tabla = document.getElementById("tablaUsuarios");
    let filas = "";

    for (const usuario of usuarios) {
        const datos = (nombreCompleto(usuario) + " " + usuario.correo).toLowerCase();

        if (datos.includes(texto) && (filtro === "" || usuario.rol === filtro)) {
            let textoEstado = "Desactivar";
            if (!usuario.activo) {
                textoEstado = "Activar";
            }

            filas += `
                <tr>
                    <td>${escapar(nombreCompleto(usuario))}</td>
                    <td>${escapar(usuario.correo)}</td>
                    <td><span class="badge bg-danger">${usuario.rol}</span></td>
                    <td>${insigniaEstado(usuario.activo)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary btn-accion-usuario" data-accion="editar" data-id="${usuario.id}">Editar</button>
                        <button class="btn btn-sm btn-outline-secondary btn-accion-usuario" data-accion="estado" data-id="${usuario.id}">${textoEstado}</button>
                        <button class="btn btn-sm btn-outline-danger btn-accion-usuario" data-accion="eliminar" data-id="${usuario.id}">Eliminar</button>
                    </td>
                </tr>`;
        }
    }

    if (filas === "") {
        filas = `<tr><td colspan="5" class="text-center">No hay usuarios que coincidan con la búsqueda.</td></tr>`;
    }

    tabla.innerHTML = filas;

    const botones = document.querySelectorAll(".btn-accion-usuario");
    botones.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const id = Number(boton.dataset.id);
            const accion = boton.dataset.accion;

            if (accion === "editar") {
                abrirModalUsuario(id);
            } else if (accion === "estado") {
                cambiarEstadoUsuario(id);
            } else {
                eliminarUsuario(id);
            }
        });
    });
}

function abrirModalUsuario(id) {
    document.getElementById("formUsuario").reset();
    document.getElementById("idUsuario").value = "";
    document.getElementById("tituloModalUsuario").textContent = "Nuevo usuario";

    if (id) {
        const usuario = buscarUsuario(id);
        document.getElementById("tituloModalUsuario").textContent = "Editar usuario";
        document.getElementById("idUsuario").value = usuario.id;
        document.getElementById("nombreUsuario").value = usuario.nombre;
        document.getElementById("apellidosUsuario").value = usuario.apellidos;
        document.getElementById("correoUsuario").value = usuario.correo;
        document.getElementById("rolUsuario").value = usuario.rol;
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById("modalUsuario")).show();
}

function cambiarEstadoUsuario(id) {
    const usuario = buscarUsuario(id);
    usuario.activo = !usuario.activo;
    actualizarTodo();
}

function eliminarUsuario(id) {
    if (!confirm("¿Desea eliminar este usuario? Esta acción no se puede deshacer.")) {
        return;
    }

    const restantes = [];
    for (const usuario of usuarios) {
        if (usuario.id !== id) {
            restantes.push(usuario);
        }
    }
    usuarios = restantes;
    actualizarTodo();
}

const formUsuario = document.getElementById("formUsuario");

formUsuario.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("idUsuario").value;
    const nombre = document.getElementById("nombreUsuario").value.trim();
    const apellidos = document.getElementById("apellidosUsuario").value.trim();
    const correo = document.getElementById("correoUsuario").value.trim();
    const rol = document.getElementById("rolUsuario").value;

    if (nombre === "" || apellidos === "" || correo === "") {
        alert("Complete todos los datos del usuario");
        return;
    }

    for (const usuario of usuarios) {
        if (usuario.correo.toLowerCase() === correo.toLowerCase() && String(usuario.id) !== id) {
            alert("Ya existe un usuario con ese correo");
            return;
        }
    }

    if (id === "") {
        usuarios.push({ id: siguienteId, nombre: nombre, apellidos: apellidos, correo: correo, rol: rol, activo: true });
        siguienteId++;
    } else {
        const usuario = buscarUsuario(Number(id));
        usuario.nombre = nombre;
        usuario.apellidos = apellidos;
        usuario.correo = correo;
        usuario.rol = rol;
    }

    document.activeElement.blur();
    bootstrap.Modal.getInstance(document.getElementById("modalUsuario")).hide();
    actualizarTodo();
});

function mostrarRoles() {
    const contenedor = document.getElementById("tarjetasRoles");
    contenedor.innerHTML = "";

    for (const rol of roles) {
        let permisos = "";
        for (const permiso of rol.permisos) {
            permisos += `<li>${permiso}</li>`;
        }

        contenedor.innerHTML += `
            <div class="col-12 col-md-4">
                <article class="card">
                    <div class="card-body">
                        <h3 class="card-title">${rol.nombre}</h3>
                        <p class="card-text rol-cantidad">${contarPorRol(rol.nombre)} usuarios</p>
                        <ul>${permisos}</ul>
                    </div>
                </article>
            </div>`;
    }

    const tabla = document.getElementById("tablaRoles");
    tabla.innerHTML = "";

    for (const usuario of usuarios) {
        let opciones = "";
        for (const rol of roles) {
            let seleccionado = "";
            if (rol.nombre === usuario.rol) {
                seleccionado = "selected";
            }
            opciones += `<option value="${rol.nombre}" ${seleccionado}>${rol.nombre}</option>`;
        }

        tabla.innerHTML += `
            <tr>
                <td>${escapar(nombreCompleto(usuario))}</td>
                <td>
                    <select class="form-select select-rol" data-id="${usuario.id}">${opciones}</select>
                </td>
            </tr>`;
    }

    const selects = document.querySelectorAll(".select-rol");
    selects.forEach(function (select) {
        select.addEventListener("change", function () {
            const usuario = buscarUsuario(Number(select.dataset.id));
            usuario.rol = select.value;
            actualizarTodo();
        });
    });
}

function mostrarCursos() {
    const texto = document.getElementById("buscarCurso").value.trim().toLowerCase();
    const tabla = document.getElementById("tablaCursos");
    let filas = "";

    for (const curso of cursos) {
        const datos = (curso.codigo + " " + curso.nombre).toLowerCase();

        if (datos.includes(texto)) {
            const docente = buscarUsuario(curso.docenteId);
            let nombreDocente = "Sin asignar";
            if (docente !== null) {
                nombreDocente = nombreCompleto(docente);
            }

            filas += `
                <tr>
                    <td>${escapar(curso.codigo)}</td>
                    <td>${escapar(curso.nombre)}</td>
                    <td>${escapar(nombreDocente)}</td>
                    <td>${curso.periodo}</td>
                    <td>${curso.matriculados}</td>
                    <td>${insigniaEstado(curso.activo)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary btn-accion-curso" data-accion="editar" data-id="${curso.id}">Editar</button>
                        <button class="btn btn-sm btn-outline-danger btn-accion-curso" data-accion="eliminar" data-id="${curso.id}">Eliminar</button>
                    </td>
                </tr>`;
        }
    }

    if (filas === "") {
        filas = `<tr><td colspan="7" class="text-center">No hay cursos que coincidan con la búsqueda.</td></tr>`;
    }

    tabla.innerHTML = filas;

    const botones = document.querySelectorAll(".btn-accion-curso");
    botones.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const id = Number(boton.dataset.id);

            if (boton.dataset.accion === "editar") {
                abrirModalCurso(id);
            } else {
                eliminarCurso(id);
            }
        });
    });
}

function abrirModalCurso(id) {
    document.getElementById("formCurso").reset();
    document.getElementById("idCurso").value = "";
    document.getElementById("tituloModalCurso").textContent = "Nuevo curso";
    cargarOpcionesDocente();

    if (id) {
        const curso = buscarCurso(id);
        document.getElementById("tituloModalCurso").textContent = "Editar curso";
        document.getElementById("idCurso").value = curso.id;
        document.getElementById("codigoCurso").value = curso.codigo;
        document.getElementById("nombreCurso").value = curso.nombre;
        document.getElementById("docenteCurso").value = curso.docenteId;
        document.getElementById("periodoCurso").value = curso.periodo;
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById("modalCurso")).show();
}

function eliminarCurso(id) {
    if (!confirm("¿Desea eliminar este curso? Esta acción no se puede deshacer.")) {
        return;
    }

    const restantes = [];
    for (const curso of cursos) {
        if (curso.id !== id) {
            restantes.push(curso);
        }
    }
    cursos = restantes;
    actualizarTodo();
}

const formCurso = document.getElementById("formCurso");

formCurso.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("idCurso").value;
    const codigo = document.getElementById("codigoCurso").value.trim().toUpperCase();
    const nombre = document.getElementById("nombreCurso").value.trim();
    const docenteId = Number(document.getElementById("docenteCurso").value);
    const periodo = document.getElementById("periodoCurso").value;

    if (codigo === "" || nombre === "") {
        alert("Complete el código y el nombre del curso");
        return;
    }

    for (const curso of cursos) {
        if (curso.codigo === codigo && curso.periodo === periodo && String(curso.id) !== id) {
            alert("Ese código ya existe en el mismo período");
            return;
        }
    }

    if (id === "") {
        cursos.push({ id: siguienteId, codigo: codigo, nombre: nombre, docenteId: docenteId, periodo: periodo, matriculados: 0, activo: true });
        siguienteId++;
    } else {
        const curso = buscarCurso(Number(id));
        curso.codigo = codigo;
        curso.nombre = nombre;
        curso.docenteId = docenteId;
        curso.periodo = periodo;
    }

    document.activeElement.blur();
    bootstrap.Modal.getInstance(document.getElementById("modalCurso")).hide();
    actualizarTodo();
});

document.getElementById("btnNuevoUsuario").addEventListener("click", function () {
    abrirModalUsuario(0);
});

document.getElementById("btnNuevoCurso").addEventListener("click", function () {
    abrirModalCurso(0);
});

document.getElementById("buscarUsuario").addEventListener("input", mostrarUsuarios);
document.getElementById("filtroRol").addEventListener("change", mostrarUsuarios);
document.getElementById("buscarCurso").addEventListener("input", mostrarCursos);

const enlacesMenu = document.querySelectorAll("nav .nav-link");
enlacesMenu.forEach(function (enlace) {
    enlace.addEventListener("click", function () {
        enlacesMenu.forEach(function (otro) {
            otro.classList.remove("active");
        });
        enlace.classList.add("active");
    });
});

cargarOpcionesRol();
cargarOpcionesPeriodo();
actualizarTodo();
