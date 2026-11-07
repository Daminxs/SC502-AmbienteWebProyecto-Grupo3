<?php

/* =========================================
   CAMPUS VIRTUAL - EDITAR USUARIO
   ========================================= */

// ==========================================
// 1. CONFIGURAR RESPUESTA JSON
// ==========================================

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

// ==========================================
// 2. FUNCIÓN PARA RESPONDER
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

// El archivo verificar_admin.php comprueba:
// - Sesión iniciada.
// - Usuario existente en MySQL.
// - Cuenta activa.
// - Rol de administrador vigente.
//
// También proporciona la conexión $pdo.

require_once __DIR__ . "/verificar_admin.php";

// ==========================================
// 5. VALIDAR TIPO DE SOLICITUD
// ==========================================

$tipoContenido = $_SERVER["CONTENT_TYPE"] ?? "";

$solicitudAjax =
    $_SERVER["HTTP_X_REQUESTED_WITH"] ?? "";

if (
    stripos($tipoContenido, "application/json") === false ||
    $solicitudAjax !== "XMLHttpRequest"
) {

    responder(
        415,
        false,
        "Solicitud no permitida."
    );
}

// ==========================================
// 6. RECIBIR LOS DATOS
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
// 7. VALIDAR IDENTIFICADOR
// ==========================================

$idUsuario = filter_var(
    $datos["id"] ?? null,
    FILTER_VALIDATE_INT,
    [
        "options" => [
            "min_range" => 1
        ]
    ]
);

if ($idUsuario === false || $idUsuario === null) {

    responder(
        400,
        false,
        "El identificador del usuario no es válido."
    );
}

// ==========================================
// 8. VALIDAR TIPOS DE DATOS
// ==========================================

$campos = [
    "nombre",
    "apellidos",
    "correo",
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

// La contraseña es opcional al editar.
if (
    isset($datos["password"]) &&
    !is_string($datos["password"])
) {

    responder(
        400,
        false,
        "La contraseña no tiene un formato válido."
    );
}

// ==========================================
// 9. LIMPIAR INFORMACIÓN
// ==========================================

$nombre = trim($datos["nombre"]);

$apellidos = trim($datos["apellidos"]);

$correo = strtolower(
    trim($datos["correo"])
);

$rol = trim($datos["rol"]);

$password = $datos["password"] ?? "";

// ==========================================
// 10. VALIDAR CAMPOS OBLIGATORIOS
// ==========================================

if (
    $nombre === "" ||
    $apellidos === "" ||
    $correo === "" ||
    $rol === ""
) {

    responder(
        400,
        false,
        "Complete todos los campos obligatorios."
    );
}

// ==========================================
// 11. VALIDAR CORREO
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
// 12. VALIDAR CONTRASEÑA OPCIONAL
// ==========================================

// Si está vacía, se conserva la contraseña.
//
// Si se proporciona una nueva, debe tener
// entre 8 y 72 bytes para mantener
// compatibilidad con el formulario actual.

if (
    $password !== "" &&
    (
        strlen($password) < 8 ||
        strlen($password) > 72
    )
) {

    responder(
        400,
        false,
        "La nueva contraseña debe tener entre 8 y 72 bytes."
    );
}

// ==========================================
// 13. VALIDAR ROL
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
// 14. PROTEGER EL ROL DEL ADMINISTRADOR
// ==========================================

// Impedir que el administrador que está
// utilizando el panel se quite a sí mismo
// los permisos de administrador.

if (
    (int) $idUsuario ===
        (int) $_SESSION["id_usuario"] &&
    $rol !== "Administrador"
) {

    responder(
        403,
        false,
        "No puede quitarse su propio rol de administrador."
    );
}

// ==========================================
// 15. ACTUALIZAR USUARIO EN MYSQL
// ==========================================

try {

    // La conexión $pdo ya fue creada por
    // verificar_admin.php.

    // ======================================
    // 16. VERIFICAR USUARIO EXISTENTE
    // ======================================

    $sqlUsuario = "
        SELECT
            id_usuario
        FROM USUARIOS
        WHERE id_usuario = :id_usuario
        LIMIT 1
    ";

    $consultaUsuario = $pdo->prepare(
        $sqlUsuario
    );

    $consultaUsuario->execute([
        ":id_usuario" => $idUsuario
    ]);

    if (!$consultaUsuario->fetch()) {

        responder(
            404,
            false,
            "El usuario que intenta editar no existe."
        );
    }

    // ======================================
    // 17. COMPROBAR CORREO DUPLICADO
    // ======================================

    // El correo puede pertenecer al mismo
    // usuario, pero no a uno diferente.

    $sqlCorreo = "
        SELECT
            id_usuario
        FROM USUARIOS
        WHERE LOWER(correo) = :correo
          AND id_usuario <> :id_usuario
        LIMIT 1
    ";

    $consultaCorreo = $pdo->prepare(
        $sqlCorreo
    );

    $consultaCorreo->execute([
        ":correo" => $correo,
        ":id_usuario" => $idUsuario
    ]);

    if ($consultaCorreo->fetch()) {

        responder(
            409,
            false,
            "El correo electrónico ya pertenece a otro usuario."
        );
    }

    // ======================================
    // 18. OBTENER ID DEL ROL
    // ======================================

    $sqlRol = "
        SELECT
            id_rol
        FROM ROLES
        WHERE descripcion = :rol
        LIMIT 1
    ";

    $consultaRol = $pdo->prepare(
        $sqlRol
    );

    $consultaRol->execute([
        ":rol" => $rol
    ]);

    $idRol = $consultaRol->fetchColumn();

    if (!$idRol) {

        responder(
            400,
            false,
            "El rol seleccionado no existe en MySQL."
        );
    }

    // ======================================
    // 19. PREPARAR LA ACTUALIZACIÓN
    // ======================================

    $sqlActualizar = "
        UPDATE USUARIOS
        SET
            nombre = :nombre,
            apellidos = :apellidos,
            correo = :correo,
            id_rol = :id_rol
    ";

    $parametros = [
        ":nombre" => $nombre,
        ":apellidos" => $apellidos,
        ":correo" => $correo,
        ":id_rol" => (int) $idRol,
        ":id_usuario" => (int) $idUsuario
    ];

    // ======================================
    // 20. ACTUALIZAR CONTRASEÑA SI APLICA
    // ======================================

    if ($password !== "") {

        // Generar hash seguro.
        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        if ($passwordHash === false) {

            throw new RuntimeException(
                "No se pudo generar el hash de contraseña."
            );
        }

        // Agregar campo de contraseña al UPDATE.
        $sqlActualizar .= ",
            contrasena_hash = :contrasena_hash
        ";

        $parametros[":contrasena_hash"] =
            $passwordHash;
    }

    // ======================================
    // 21. COMPLETAR CONSULTA SQL
    // ======================================

    $sqlActualizar .= "
        WHERE id_usuario = :id_usuario
    ";

    // ======================================
    // 22. EJECUTAR ACTUALIZACIÓN
    // ======================================

    $consultaActualizar = $pdo->prepare(
        $sqlActualizar
    );

    $consultaActualizar->execute(
        $parametros
    );

    // ======================================
    // 23. ACTUALIZAR SESIÓN PROPIA
    // ======================================

    // Si el administrador modifica sus
    // propios datos, actualizar la sesión.

    if (
        (int) $idUsuario ===
        (int) $_SESSION["id_usuario"]
    ) {

        $_SESSION["usuario"] = $correo;

        $_SESSION["nombre"] = trim(
            $nombre . " " . $apellidos
        );

        // El administrador conserva su rol.
        $_SESSION["rol"] = "administrador";
    }

    // ======================================
    // 24. RESPUESTA EXITOSA
    // ======================================

    responder(
        200,
        true,
        "Usuario actualizado correctamente en MySQL."
    );

} catch (PDOException $error) {

    // Guardar detalles técnicos en el servidor.
    error_log(
        "Error al editar usuario: " .
        $error->getMessage()
    );

    // Conflicto con restricciones de MySQL.
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

    error_log(
        "Error interno al editar usuario: " .
        $error->getMessage()
    );

    responder(
        500,
        false,
        "Ocurrió un error interno."
    );
}