"use strict";

/* =========================================
   ENTREGAS DE DEMOSTRACIÓN

   Conserva únicamente metadatos en esta pestaña.
   No almacena el contenido de los archivos.
   ========================================= */

const EntregasDemo = {
    clave: "campus.entregas.demo.v1",

    leerTodas: function () {
        try {
            const contenido = sessionStorage.getItem(this.clave);
            const entregas = contenido ? JSON.parse(contenido) : {};

            if (
                entregas === null ||
                typeof entregas !== "object" ||
                Array.isArray(entregas)
            ) {
                return {};
            }

            return entregas;
        } catch (error) {
            return {};
        }
    },

    obtener: function (idActividad) {
        const entregas = this.leerTodas();

        return entregas[String(idActividad)] || null;
    },

    guardar: function (idActividad, entrega) {
        const entregas = this.leerTodas();

        entregas[String(idActividad)] = entrega;

        // Si el navegador bloquea el almacenamiento,
        // la pantalla de entrega mostrará el error.
        sessionStorage.setItem(
            this.clave,
            JSON.stringify(entregas)
        );
    },

    aplicar: function (actividades) {
        const entregas = this.leerTodas();

        actividades.forEach(function (actividad) {
            if (entregas[String(actividad.id)]) {
                actividad.estado = "entregada";
            }
        });
    }
};