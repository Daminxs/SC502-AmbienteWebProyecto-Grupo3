<?php

/* =========================================
   CAMPUS VIRTUAL
   CONEXIÓN A LA BASE DE DATOS MYSQL
   ========================================= */

// =========================================
// 1. UBICAR EL ARCHIVO DE CONFIGURACIÓN
// =========================================

// El archivo de configuración está fuera
// de la carpeta pública del proyecto.

$ruta_env = dirname(__DIR__, 2) . '/campus_virtual.env';

// Verificar que exista el archivo.
if (!file_exists($ruta_env)) {

    http_response_code(500);

    exit("No existe el archivo de configuración.");

}

// =========================================
// 2. LEER LA CONFIGURACIÓN
// =========================================

$config = parse_ini_file(
    $ruta_env,
    false,
    INI_SCANNER_RAW
);

// Verificar que se pueda leer la configuración.
if (
    $config === false ||
    !isset(
        $config['DB_HOST'],
        $config['DB_PORT'],
        $config['DB_NAME'],
        $config['DB_USER'],
        $config['DB_PASSWORD']
    )
) {

    http_response_code(500);

    exit("No se pudo leer la configuración de MySQL.");

}

// =========================================
// 3. ESTABLECER LA CONEXIÓN CON PDO
// =========================================

try {

    // Dirección del servidor MySQL.
    $dsn = "mysql:host=" . $config['DB_HOST']
         . ";port=" . $config['DB_PORT']
         . ";dbname=" . $config['DB_NAME']
         . ";charset=utf8mb4";

    // Crear la conexión.
    $pdo = new PDO(
        $dsn,
        $config['DB_USER'],
        $config['DB_PASSWORD'],
        [
            PDO::ATTR_ERRMODE =>
                PDO::ERRMODE_EXCEPTION,

            PDO::ATTR_DEFAULT_FETCH_MODE =>
                PDO::FETCH_ASSOC,

            PDO::ATTR_EMULATE_PREPARES =>
                false
        ]
    );

} catch (PDOException $e) {

    // Guardar el error técnico en el servidor.
    error_log($e->getMessage());

    // Mostrar un mensaje seguro.
    http_response_code(500);

    exit("Error de conexión con la base de datos.");

}