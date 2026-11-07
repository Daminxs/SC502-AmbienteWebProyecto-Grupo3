<?php

/* =========================================
   CAMPUS VIRTUAL - CREAR USUARIO
   ========================================= */

// ==========================================
// 1. CONFIGURAR RESPUESTA JSON
// ==========================================

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

// ==========================================
// 2. FUNCIÓN DE RESPUESTA
// ==========================================

function responder($codigo, $exito, $mensaje)
{
    http_response_code($codigo);

    echo json_encode([
        "success" => $exito,
        "mensaje" => $mensaje
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

// ==========================================
// 3. VALIDAR MÉTODO HTTP
// ==========================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    header("Allow: POST");

    responder(
        405,
        false,
        "Método no permitido."
    );
}

// ==========================================
// 4. VERIFICAR ADMINISTRADOR
// ==========================================

// Este archivo verifica:
// - Que exista una sesión.
// - Que el usuario exista en MySQL.
// - Que su cuenta esté activa.
// - Que tenga el rol Administrador.
//
// Además, proporciona la conexión $pdo.

require_once __DIR__ . "/verificar_admin.php";

// ==========================================
// 5. VALIDAR TIPO DE SOLICITUD
// ==========================================

$tipoContenido = $_SERVER["CONTENT_TYPE"] ?? "";

$solicitudAjax =
    $_SERVER["HTTP_X_REQUESTED_WITH"] ?? "";

if (
    stripos(
        $tipoContenido,
        "application/json"
    ) === false ||
    $solicitudAjax !== "XMLHttpRequest"
) {

    responder(
        415,
        false,
        "Solicitud no permitida."
    );
}

// ==========================================
// 6. RECIBIR DATOS DEL FORMULARIO
// ==========================================

$datos = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($datos)) {

    responder(
        400,
        false,
        "Los datos enviados no son válidos."
    );
}

// ==========================================
// 7. VALIDAR TIPOS DE DATOS
// ==========================================

$campos = [
    "nombre",
    "apellidos",
    "correo",
    "password",
    "rol"
];

foreach ($campos as $campo) {

    if (
        !isset($datos[$campo]) ||
        !is_string($datos[$campo])
    ) {

        responder(
            400,
            false,
            "Los datos del formulario no son válidos."
        );
    }
}

// ==========================================
// 8. LIMPIAR DATOS
// ==========================================

$nombre = trim($datos["nombre"]);

$apellidos = trim($datos["apellidos"]);

$correo = strtolower(
    trim($datos["correo"])
);

$password = $datos["password"];

$rol = trim($datos["rol"]);

// ==========================================
// 9. VALIDAR CAMPOS OBLIGATORIOS
// ==========================================

if (
    $nombre === "" ||
    $apellidos === "" ||
    $correo === "" ||
    $password === "" ||
    $rol === ""
) {

    responder(
        400,
        false,
        "Complete todos los campos obligatorios."
    );
}

// ==========================================
// 10. VALIDAR CORREO ELECTRÓNICO
// ==========================================

if (!filter_var(
    $correo,
    FILTER_VALIDATE_EMAIL
)) {

    responder(
        400,
        false,
        "El correo electrónico no es válido."
    );
}

// ==========================================
// 11. VALIDAR CONTRASEÑA
// ==========================================

// Para mantener compatibilidad con el
// formulario actual, usamos entre
// 8 y 72 bytes.

if (
    strlen($password) < 8 ||
    strlen($password) > 72
) {

    responder(
        400,
        false,
        "La contraseña debe tener entre 8 y 72 bytes."
    );
}

// ==========================================
// 12. VALIDAR ROL SELECCIONADO
// ==========================================

$rolesPermitidos = [
    "Administrador",
    "Docente",
    "Estudiante"
];

if (!in_array(
    $rol,
    $rolesPermitidos,
    true
)) {

    responder(
        400,
        false,
        "El rol seleccionado no es válido."
    );
}

// ==========================================
// 13. REGISTRAR USUARIO EN MYSQL
// ==========================================

try {

    // La conexión $pdo ya está disponible
    // gracias al archivo verificar_admin.php.

    // ======================================
    // 14. VERIFICAR CORREO DUPLICADO
    // ======================================

    $sqlCorreo = "
        SELECT
            id_usuario
        FROM USUARIOS
        WHERE LOWER(correo) = :correo
        LIMIT 1
    ";

    $consultaCorreo = $pdo->prepare($sqlCorreo);

    $consultaCorreo->execute([
        ":correo" => $correo
    ]);

    if ($consultaCorreo->fetch()) {

        responder(
            409,
            false,
            "Ya existe un usuario con ese correo."
        );
    }

    // ======================================
    // 15. BUSCAR EL ID DEL ROL
    // ======================================

    $sqlRol = "
        SELECT
            id_rol
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

        responder(
            400,
            false,
            "El rol no existe en la base de datos."
        );
    }

    // ======================================
    // 16. GENERAR HASH DE CONTRASEÑA
    // ======================================

    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    if ($passwordHash === false) {

        throw new RuntimeException(
            "No fue posible generar el hash."
        );
    }

    // ======================================
    // 17. INSERTAR USUARIO
    // ======================================

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

    $consultaInsertar = $pdo->prepare(
        $sqlInsertar
    );

    $consultaInsertar->execute([
        ":id_rol" => (int) $idRol,
        ":nombre" => $nombre,
        ":apellidos" => $apellidos,
        ":correo" => $correo,
        ":contrasena_hash" => $passwordHash
    ]);

    // ======================================
    // 18. RESPUESTA EXITOSA
    // ======================================

    responder(
        201,
        true,
        "Usuario registrado correctamente en MySQL."
    );

} catch (PDOException $error) {

    // Registrar el error técnico.
    error_log(
        "Error al crear usuario: " .
        $error->getMessage()
    );

    // Posible restricción UNIQUE.
    if ($error->getCode() === "23000") {

        responder(
            409,
            false,
            "El usuario ya existe o los datos están duplicados."
        );
    }

    responder(
        500,
        false,
        "Ocurrió un error al registrar el usuario."
    );

} catch (Throwable $error) {

    error_log(
        "Error interno al crear usuario: " .
        $error->getMessage()
    );

    responder(
        500,
        false,
        "Ocurrió un error interno."
    );
}