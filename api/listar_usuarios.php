<?php

/* =========================================
   CAMPUS VIRTUAL - LISTAR USUARIOS
   ========================================= */

// ==========================================
// 1. CONFIGURAR RESPUESTA JSON
// ==========================================

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

// ==========================================
// 2. VALIDAR MÉTODO HTTP
// ==========================================

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    header("Allow: GET");

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "mensaje" => "Método no permitido."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

// ==========================================
// 3. VERIFICAR ADMINISTRADOR
// ==========================================

// Este archivo comprueba que:
// - Existe una sesión.
// - El usuario existe en MySQL.
// - Su cuenta está activa.
// - Su rol actual es Administrador.
//
// También establece la conexión $pdo.

require_once __DIR__ . "/verificar_admin.php";

// ==========================================
// 4. CONSULTAR USUARIOS DESDE MYSQL
// ==========================================

try {

    // Obtener usuarios junto con sus roles.
    $sql = "
        SELECT
            u.id_usuario AS id,
            u.nombre,
            u.apellidos,
            u.correo,
            u.estado AS activo,
            r.descripcion AS rol
        FROM USUARIOS u
        INNER JOIN ROLES r
            ON u.id_rol = r.id_rol
        ORDER BY u.id_usuario ASC
    ";

    // Preparar la consulta SQL.
    $consulta = $pdo->prepare($sql);

    // Ejecutar la consulta.
    $consulta->execute();

    // Obtener todos los usuarios.
    $usuarios = $consulta->fetchAll(
        PDO::FETCH_ASSOC
    );

    // ======================================
    // 5. CONVERTIR DATOS PARA JAVASCRIPT
    // ======================================

    foreach ($usuarios as &$usuario) {

        // Convertir identificador a número.
        $usuario["id"] = (int) $usuario["id"];

        // Convertir estado a booleano.
        $usuario["activo"] = (bool) $usuario["activo"];
    }

    unset($usuario);

    // ======================================
    // 6. DEVOLVER RESPUESTA EXITOSA
    // ======================================

    http_response_code(200);

    echo json_encode([
        "success" => true,
        "usuarios" => $usuarios
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {

    // Registrar el error técnico.
    error_log(
        "Error al listar usuarios: " .
        $error->getMessage()
    );

    // No exponer detalles internos de MySQL.
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "mensaje" => "No fue posible consultar los usuarios."
    ], JSON_UNESCAPED_UNICODE);
}

?>