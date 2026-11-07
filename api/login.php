<?php

/* =========================================
   CAMPUS VIRTUAL - INICIO DE SESIÓN
   ========================================= */

// Iniciar sesión PHP
session_start();

// Responder al frontend mediante JSON
header("Content-Type: application/json; charset=UTF-8");

// Permitir únicamente solicitudes POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Método no permitido."
    ]);

    exit();
}

/* =========================================
   RECIBIR DATOS DEL FORMULARIO
   ========================================= */

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {

    echo json_encode([
        "success" => false,
        "message" => "Datos inválidos."
    ]);

    exit();
}

// Obtener correo y contraseña
$correo = strtolower(trim($data["correoLogin"] ?? ""));
$password = $data["passwordLogin"] ?? "";

/* =========================================
   VALIDAR CAMPOS
   ========================================= */

if ($correo === "" || $password === "") {

    echo json_encode([
        "success" => false,
        "message" => "Complete todos los campos."
    ]);

    exit();
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "message" => "Ingrese un correo válido."
    ]);

    exit();
}

/* =========================================
   USUARIOS DE PRUEBA
   ========================================= */

// Estos usuarios son temporales.
// Posteriormente se consultarán desde MySQL.

$usuarios = [
    [
        "correo" => "admin@universidad.com",
        "password" => "123456",
        "rol" => "administrador",
        "nombre" => "Administrador"
    ],
    [
        "correo" => "estudiante@universidad.com",
        "password" => "123456",
        "rol" => "estudiante",
        "nombre" => "Estudiante"
    ]
];

/* =========================================
   VALIDAR CREDENCIALES
   ========================================= */

foreach ($usuarios as $usuario) {

    if (
        $correo === $usuario["correo"] &&
        $password === $usuario["password"]
    ) {

        // Regenerar identificador de sesión
        session_regenerate_id(true);

        // Guardar información de la sesión
        $_SESSION["usuario"] = $usuario["correo"];
        $_SESSION["nombre"] = $usuario["nombre"];
        $_SESSION["rol"] = $usuario["rol"];
        $_SESSION["hora_inicio"] = date("H:i:s");

        // Responder al frontend
        echo json_encode([
            "success" => true,
            "message" => "Inicio de sesión exitoso.",
            "rol" => $usuario["rol"],
            "nombre" => $usuario["nombre"]
        ]);

        exit();
    }
}

/* =========================================
   CREDENCIALES INCORRECTAS
   ========================================= */

echo json_encode([
    "success" => false,
    "message" => "Correo o contraseña incorrectos."
]);

exit();

?>