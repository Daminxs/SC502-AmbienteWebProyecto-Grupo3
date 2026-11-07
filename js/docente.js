

const enlaces = document.querySelectorAll(".menu .enlace");
const secciones = document.querySelectorAll(".seccion");

enlaces.forEach((enlace) => {
    enlace.addEventListener("click", (evento) => {
        evento.preventDefault();

        const seccionSeleccionada = enlace.dataset.seccion;

        // Ocultar todas las secciones
        secciones.forEach((seccion) => {
            seccion.classList.remove("activa");
        });

        // Quitar el estado activo de todos los enlaces
        enlaces.forEach((item) => {
            item.classList.remove("activo");
        });

        // Mostrar la sección seleccionada
        const seccion = document.getElementById(seccionSeleccionada);

        if (seccion) {
            seccion.classList.add("activa");
            enlace.classList.add("activo");
        }
    });
});


// Registro de materiales académicos

const formMaterial = document.getElementById("formMaterial");

formMaterial.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById("nombreMaterial").value.trim();
    const curso = document.getElementById("cursoMaterial").value;
    const descripcion = document.getElementById("descripcionMaterial").value.trim();

    if (!nombre || !curso || !descripcion) {
        alert("Completá todos los campos del material.");
        return;
    }

    const panel = document.querySelector("#materiales .panel");

    let listaMateriales = document.getElementById("listaMateriales");

    if (!listaMateriales) {
        listaMateriales = document.createElement("div");
        listaMateriales.id = "listaMateriales";
        listaMateriales.className = "panel";

        const titulo = document.createElement("h3");
        titulo.textContent = "Materiales publicados";

        listaMateriales.appendChild(titulo);
        panel.after(listaMateriales);
    }

    const material = document.createElement("article");
    material.className = "tarjeta";
    material.style.marginTop = "15px";

    const tituloMaterial = document.createElement("h3");
    tituloMaterial.textContent = nombre;

    const cursoMaterial = document.createElement("p");
    cursoMaterial.textContent = "Curso: " + curso;

    const descripcionMaterial = document.createElement("p");
    descripcionMaterial.textContent = descripcion;

    material.append(tituloMaterial, cursoMaterial, descripcionMaterial);
    listaMateriales.appendChild(material);

    formMaterial.reset();

    alert("El material se agregó correctamente.");
});


// Registro de asignaciones

const formAsignacion = document.getElementById("formAsignacion");

formAsignacion.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const titulo = document.getElementById("tituloAsignacion").value.trim();
    const curso = document.getElementById("cursoAsignacion").value;
    const instrucciones = document.getElementById("instrucciones").value.trim();
    const fecha = document.getElementById("fechaEntrega").value;
    const porcentaje = Number(document.getElementById("porcentaje").value);

    if (!titulo || !curso || !instrucciones || !fecha || !porcentaje) {
        alert("Completá todos los campos de la asignación.");
        return;
    }

    if (porcentaje < 1 || porcentaje > 100) {
        alert("El porcentaje debe estar entre 1 y 100.");
        return;
    }

    const fechaSeleccionada = new Date(fecha + "T00:00:00");
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < fechaActual) {
        alert("La fecha de entrega no puede ser anterior a hoy.");
        return;
    }

    const listaAsignaciones = document.getElementById("listaAsignaciones");

    if (listaAsignaciones.querySelector("p")) {
        listaAsignaciones.querySelector("p").remove();
    }

    const asignacion = document.createElement("article");
    asignacion.className = "tarjeta";
    asignacion.style.marginTop = "15px";

    const tituloAsignacion = document.createElement("h3");
    tituloAsignacion.textContent = titulo;

    const cursoAsignacion = document.createElement("p");
    cursoAsignacion.textContent = "Curso: " + curso;

    const instruccionesAsignacion = document.createElement("p");
    instruccionesAsignacion.textContent = instrucciones;

    const fechaAsignacion = document.createElement("p");
    fechaAsignacion.textContent = "Fecha de entrega: " + fecha;

    const porcentajeAsignacion = document.createElement("p");
    porcentajeAsignacion.textContent = "Porcentaje: " + porcentaje + "%";

    asignacion.append(
        tituloAsignacion,
        cursoAsignacion,
        instruccionesAsignacion,
        fechaAsignacion,
        porcentajeAsignacion
    );

    listaAsignaciones.appendChild(asignacion);

    formAsignacion.reset();

    alert("La asignación se creó correctamente.");
});
