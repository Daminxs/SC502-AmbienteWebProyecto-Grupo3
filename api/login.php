<?php
// Configuramos los encabezados HTTP para permitir el intercambio de datos con el frontend mediante JSON
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Capturamos la información enviada desde el formulario utilizando la solicitud fetch
$data = json_decode(file_get_contents("php://input"), true);

// Extraemos el correo y la contraseña, aplicando una limpieza de espacios al correo
$correo = trim($data['correoLogin'] ?? '');
$password = $data['passwordLogin'] ?? '';

// Verificamos que los campos obligatorios no estén vacíos antes de continuar con la lógica
if (empty($correo) || empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Por favor, complete todos los campos para continuar."
    ]);
    exit();
}

// implementaremos la conexión con la base de datos y la consulta SQL para validar al usuario
// Respuesta temporal para comprobar que la comunicación entre el cliente y el servidor funciona correctamente
if ($correo === "admin@universidad.com" && $password === "123456") {
    echo json_encode([
        "success" => true,
        "message" => "Inicio de sesión exitoso.",
        "rol" => "administrador"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Credenciales incorrectas. Por favor, verifique sus datos."
    ]);
}
?>