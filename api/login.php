<?php

/* =========================================
   CAMPUS VIRTUAL
   INICIO DE SESIÓN CON MYSQL
   ========================================= */

// Respuestas en formato JSON
header("Content-Type: application/json; charset=UTF-8");

// =========================================
// 1. VALIDAR MÉTODO HTTP
// =========================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "exito" => false,
        "success" => false,
        "mensaje" => "Método no permitido."
    ]);

    exit();
}

// =========================================
// 2. RECIBIR LOS DATOS DEL FORMULARIO
// =========================================

$datos = json_decode(
    file_get_contents("php://input"),
    true
);

$correo = trim($datos["correoLogin"] ?? "");
$contrasena = $datos["passwordLogin"] ?? "";

// =========================================
// 3. VALIDAR CAMPOS
// =========================================

if ($correo === "" || $contrasena === "") {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "success" => false,
        "mensaje" => "Debe ingresar el correo y la contraseña."
    ]);

    exit();
}

// =========================================
// 4. CONECTAR CON MYSQL
// =========================================

require_once __DIR__ . "/conexion.php";

try {

    // =====================================
    // 5. CONSULTAR EL USUARIO Y SU ROL
    // =====================================

    $sql = "SELECT
                u.id_usuario,
                u.id_rol,
                u.nombre,
                u.apellidos,
                u.correo,
                u.contrasena_hash,
                u.estado,
                r.descripcion AS rol
            FROM USUARIOS u
            INNER JOIN ROLES r
                ON u.id_rol = r.id_rol
            WHERE u.correo = :correo
            LIMIT 1";

    $consulta = $pdo->prepare($sql);

    $consulta->execute([
        "correo" => $correo
    ]);

    $usuario = $consulta->fetch();

    // =====================================
    // 6. VALIDAR LAS CREDENCIALES
    // =====================================

    if (
        !$usuario ||
        !password_verify(
            $contrasena,
            $usuario["contrasena_hash"]
        )
    ) {

        http_response_code(401);

        echo json_encode([
            "exito" => false,
            "success" => false,
            "mensaje" => "Correo o contraseña incorrectos."
        ]);

        exit();
    }

    // =====================================
    // 7. VERIFICAR ESTADO DEL USUARIO
    // =====================================

    if ((int)$usuario["estado"] !== 1) {

        http_response_code(403);

        echo json_encode([
            "exito" => false,
            "success" => false,
            "mensaje" => "La cuenta está desactivada."
        ]);

        exit();
    }

    // =====================================
    // 8. VALIDAR EL ROL
    // =====================================

    $rol = strtolower(trim($usuario["rol"]));

    // Por ahora tenemos paneles para
    // administrador y estudiante.
    if (!in_array(
        $rol,
        ["administrador", "estudiante"],
        true
    )) {

        http_response_code(403);

        echo json_encode([
            "exito" => false,
            "success" => false,
            "mensaje" => "Este rol todavía no tiene un panel habilitado."
        ]);

        exit();
    }

    // =====================================
    // 9. CREAR LA SESIÓN PHP
    // =====================================

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Generar un nuevo identificador
    // de sesión por seguridad.
    session_regenerate_id(true);

    $_SESSION["id_usuario"] = (int)$usuario["id_usuario"];

    $_SESSION["usuario"] = $usuario["correo"];

    $_SESSION["nombre"] = trim(
        $usuario["nombre"] . " " . $usuario["apellidos"]
    );

    $_SESSION["rol"] = $rol;

    // =====================================
    // 10. DEVOLVER RESPUESTA EXITOSA
    // =====================================

    echo json_encode([
        "exito" => true,
        "success" => true,
        "mensaje" => "Inicio de sesión exitoso.",
        "rol" => $rol,
        "nombre" => $_SESSION["nombre"]
    ]);

} catch (PDOException $e) {

    // Registrar el error técnico
    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "success" => false,
        "mensaje" => "Ocurrió un error al iniciar sesión."
    ]);
}

?>