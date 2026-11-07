<?php

/* =========================================
   CAMPUS VIRTUAL - CREAR USUARIO
   ========================================= */

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

session_start();

// Responder en formato JSON.
function responder($codigo, $exito, $mensaje)
{
    http_response_code($codigo);

    echo json_encode([
        "success" => $exito,
        "mensaje" => $mensaje
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

// Solo permitir solicitudes POST.
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Allow: POST");

    responder(405, false, "Método no permitido.");
}

// Verificar la sesión.
if (!isset($_SESSION["id_usuario"])) {
    responder(401, false, "Debe iniciar sesión.");
}

// Verificar permisos de administrador.
$rolSesion = strtolower(trim($_SESSION["rol"] ?? ""));

if ($rolSesion !== "administrador") {
    responder(403, false, "No tiene permisos para crear usuarios.");
}

// Aceptar únicamente peticiones JSON desde JavaScript.
$tipoContenido = $_SERVER["CONTENT_TYPE"] ?? "";
$solicitudAjax = $_SERVER["HTTP_X_REQUESTED_WITH"] ?? "";

if (
    stripos($tipoContenido, "application/json") === false ||
    $solicitudAjax !== "XMLHttpRequest"
) {
    responder(415, false, "Solicitud no permitida.");
}

// Obtener los datos enviados.
$datos = json_decode(file_get_contents("php://input"), true);

if (!is_array($datos)) {
    responder(400, false, "Los datos enviados no son válidos.");
}

// Limpiar datos.
$nombre = trim($datos["nombre"] ?? "");
$apellidos = trim($datos["apellidos"] ?? "");
$correo = strtolower(trim($datos["correo"] ?? ""));
$password = $datos["password"] ?? "";
$rol = trim($datos["rol"] ?? "");

// Validar campos obligatorios.
if (
    $nombre === "" ||
    $apellidos === "" ||
    $correo === "" ||
    !is_string($password) ||
    $password === "" ||
    $rol === ""
) {
    responder(400, false, "Complete todos los campos.");
}

// Validar correo.
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(400, false, "El correo electrónico no es válido.");
}

// Validar contraseña.
if (strlen($password) < 8 || strlen($password) > 72) {
    responder(
        400,
        false,
        "La contraseña debe tener entre 8 y 72 bytes."
    );
}

// Validar roles permitidos.
$rolesPermitidos = [
    "Administrador",
    "Docente",
    "Estudiante"
];

if (!in_array($rol, $rolesPermitidos, true)) {
    responder(400, false, "El rol seleccionado no es válido.");
}

try {

    // Conectar con MySQL.
    require_once __DIR__ . "/conexion.php";

    // Verificar si el correo ya existe.
    $sqlCorreo = "
        SELECT id_usuario
        FROM USUARIOS
        WHERE LOWER(correo) = :correo
        LIMIT 1
    ";

    $consultaCorreo = $pdo->prepare($sqlCorreo);

    $consultaCorreo->execute([
        ":correo" => $correo
    ]);

    if ($consultaCorreo->fetch()) {
        responder(409, false, "Ya existe un usuario con ese correo.");
    }

    // Buscar el ID del rol seleccionado.
    $sqlRol = "
        SELECT id_rol
        FROM ROLES
        WHERE descripcion = :rol
        LIMIT 1
    ";

    $consultaRol = $pdo->prepare($sqlRol);

    $consultaRol->execute([
        ":rol" => $rol
    ]);

    $idRol = $consultaRol->fetchColumn();

    if (!$idRol) {
        responder(400, false, "El rol no existe en la base de datos.");
    }

    // Cifrar la contraseña.
    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    // Insertar el usuario.
    $sqlInsertar = "
        INSERT INTO USUARIOS
        (
            id_rol,
            nombre,
            apellidos,
            correo,
            contrasena_hash,
            estado
        )
        VALUES
        (
            :id_rol,
            :nombre,
            :apellidos,
            :correo,
            :contrasena_hash,
            1
        )
    ";

    $consultaInsertar = $pdo->prepare($sqlInsertar);

    $consultaInsertar->execute([
        ":id_rol" => $idRol,
        ":nombre" => $nombre,
        ":apellidos" => $apellidos,
        ":correo" => $correo,
        ":contrasena_hash" => $passwordHash
    ]);

    responder(201, true, "Usuario registrado correctamente.");

} catch (PDOException $error) {

    error_log($error->getMessage());

    // Evitar correos duplicados, incluso con
    // solicitudes simultáneas.
    if ($error->getCode() === "23000") {
        responder(409, false, "El usuario ya existe o los datos están duplicados.");
    }

    responder(500, false, "Ocurrió un error al registrar el usuario.");

} catch (Throwable $error) {

    error_log($error->getMessage());

    responder(500, false, "Ocurrió un error interno.");
}