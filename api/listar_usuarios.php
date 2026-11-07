<?php

// ==========================================
// CAMPUS VIRTUAL - LISTAR USUARIOS
// ==========================================

// Respuesta en formato JSON.
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

// Iniciar la sesión.
session_start();

// Permitir únicamente solicitudes GET.
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    header("Allow: GET");
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "mensaje" => "Método no permitido."
    ]);

    exit;
}

// Verificar que el usuario haya iniciado sesión.
if (!isset($_SESSION["id_usuario"])) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "mensaje" => "Debe iniciar sesión."
    ]);

    exit;
}

// Verificar que tenga el rol de administrador.
$rol = strtolower(trim($_SESSION["rol"] ?? ""));

if ($rol !== "administrador") {
    http_response_code(403);

    echo json_encode([
        "success" => false,
        "mensaje" => "No tiene permisos para consultar usuarios."
    ]);

    exit;
}

try {

    // Conexión existente con MySQL.
    require_once __DIR__ . "/conexion.php";

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

    // Preparar y ejecutar la consulta.
    $consulta = $pdo->prepare($sql);
    $consulta->execute();

    // Obtener los resultados.
    $usuarios = $consulta->fetchAll(PDO::FETCH_ASSOC);

    // Convertir los tipos para JavaScript.
    foreach ($usuarios as &$usuario) {
        $usuario["id"] = (int) $usuario["id"];
        $usuario["activo"] = (bool) $usuario["activo"];
    }

    unset($usuario);

    // Respuesta exitosa.
    echo json_encode([
        "success" => true,
        "usuarios" => $usuarios
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {

    // Registrar el error sin exponer detalles al navegador.
    error_log($error->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "mensaje" => "No fue posible consultar los usuarios."
    ]);
}