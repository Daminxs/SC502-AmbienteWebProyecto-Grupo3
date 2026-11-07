<?php

/* =========================================
   CAMPUS VIRTUAL - EDITAR USUARIO
   ========================================= */

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

session_start();

// Responder al navegador con JSON.
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

// Verificar que exista una sesión.
if (empty($_SESSION["id_usuario"])) {
    responder(401, false, "Debe iniciar sesión.");
}

// Verificar que sea administrador.
$rolSesion = strtolower(trim($_SESSION["rol"] ?? ""));

if ($rolSesion !== "administrador") {
    responder(403, false, "No tiene permisos para editar usuarios.");
}

// Aceptar únicamente solicitudes JSON desde nuestra aplicación.
$tipoContenido = $_SERVER["CONTENT_TYPE"] ?? "";
$solicitudAjax = $_SERVER["HTTP_X_REQUESTED_WITH"] ?? "";

if (
    stripos($tipoContenido, "application/json") === false ||
    $solicitudAjax !== "XMLHttpRequest"
) {
    responder(415, false, "Solicitud no permitida.");
}

// Obtener los datos enviados.
$datos = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($datos)) {
    responder(400, false, "Los datos enviados no son válidos.");
}

// Obtener y validar el ID.
$idUsuario = filter_var(
    $datos["id"] ?? null,
    FILTER_VALIDATE_INT,
    ["options" => ["min_range" => 1]]
);

if ($idUsuario === false) {
    responder(400, false, "El ID del usuario no es válido.");
}

// Obtener información del formulario.
$nombre = trim($datos["nombre"] ?? "");
$apellidos = trim($datos["apellidos"] ?? "");
$correo = strtolower(trim($datos["correo"] ?? ""));
$rol = trim($datos["rol"] ?? "");
$password = $datos["password"] ?? "";

// Validar campos obligatorios.
if (
    $nombre === "" ||
    $apellidos === "" ||
    $correo === "" ||
    $rol === "" ||
    !is_string($password)
) {
    responder(400, false, "Complete los campos obligatorios.");
}

// Validar correo.
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(400, false, "El correo electrónico no es válido.");
}

// La contraseña es opcional al editar.
if (
    $password !== "" &&
    (strlen($password) < 8 || strlen($password) > 72)
) {
    responder(
        400,
        false,
        "La nueva contraseña debe tener entre 8 y 72 bytes."
    );
}

// Verificar el rol seleccionado.
$rolesPermitidos = [
    "Administrador",
    "Docente",
    "Estudiante"
];

if (!in_array($rol, $rolesPermitidos, true)) {
    responder(400, false, "El rol seleccionado no es válido.");
}

// Evitar que el administrador cambie su propio rol.
if (
    (int) $idUsuario === (int) $_SESSION["id_usuario"] &&
    $rol !== "Administrador"
) {
    responder(
        403,
        false,
        "No puede quitarse su propio rol de administrador."
    );
}

try {

    // Conectarse a MySQL.
    require_once __DIR__ . "/conexion.php";

    // Verificar que el usuario exista.
    $sqlUsuario = "
        SELECT id_usuario
        FROM USUARIOS
        WHERE id_usuario = :id_usuario
        LIMIT 1
    ";

    $consultaUsuario = $pdo->prepare($sqlUsuario);

    $consultaUsuario->execute([
        ":id_usuario" => $idUsuario
    ]);

    if (!$consultaUsuario->fetch()) {
        responder(404, false, "El usuario no existe.");
    }

    // Verificar que el correo no esté asignado a otro usuario.
    $sqlCorreo = "
        SELECT id_usuario
        FROM USUARIOS
        WHERE LOWER(correo) = :correo
          AND id_usuario <> :id_usuario
        LIMIT 1
    ";

    $consultaCorreo = $pdo->prepare($sqlCorreo);

    $consultaCorreo->execute([
        ":correo" => $correo,
        ":id_usuario" => $idUsuario
    ]);

    if ($consultaCorreo->fetch()) {
        responder(409, false, "El correo ya pertenece a otro usuario.");
    }

    // Obtener el ID del rol.
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
        responder(400, false, "El rol no existe en MySQL.");
    }

    // Actualizar datos básicos del usuario.
    $sqlActualizar = "
        UPDATE USUARIOS
        SET
            nombre = :nombre,
            apellidos = :apellidos,
            correo = :correo,
            id_rol = :id_rol
        WHERE id_usuario = :id_usuario
    ";

    $parametros = [
        ":nombre" => $nombre,
        ":apellidos" => $apellidos,
        ":correo" => $correo,
        ":id_rol" => $idRol,
        ":id_usuario" => $idUsuario
    ];

    // Solo cambiar la contraseña si se ingresó una nueva.
    if ($password !== "") {

        $sqlActualizar = "
            UPDATE USUARIOS
            SET
                nombre = :nombre,
                apellidos = :apellidos,
                correo = :correo,
                id_rol = :id_rol,
                contrasena_hash = :contrasena_hash
            WHERE id_usuario = :id_usuario
        ";

        $parametros[":contrasena_hash"] = password_hash(
            $password,
            PASSWORD_DEFAULT
        );
    }

    // Ejecutar la actualización.
    $consultaActualizar = $pdo->prepare($sqlActualizar);

    $consultaActualizar->execute($parametros);

    responder(
        200,
        true,
        "Usuario actualizado correctamente en MySQL."
    );

} catch (PDOException $error) {

    error_log($error->getMessage());

    if ($error->getCode() === "23000") {
        responder(
            409,
            false,
            "Los datos entran en conflicto con otro registro."
        );
    }

    responder(
        500,
        false,
        "Ocurrió un error al actualizar el usuario."
    );

} catch (Throwable $error) {

    error_log($error->getMessage());

    responder(500, false, "Ocurrió un error interno.");
}