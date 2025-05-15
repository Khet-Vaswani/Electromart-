<?php
require_once __DIR__.'/vendor/firbase/php-jwt/JWT.PHP';
$jwt_config = include __DIR__.'/electromart-backend/config/jwt.php';

$payload = [
    "user_id" => 1,
    "email" => "khet@example.com",
    "iat" => time(),
    "exp" => time() + 3600,
    "iss" => $jwt_config['issuer'],
    "aud" => $jwt_config['audience']
];

try {
    $jwt = \Firebase\JWT\JWT::encode($payload, $jwt_config['secret_key'], 'HS256');
    echo json_encode([
        "status" => "success",
        "token" => $jwt
    ]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
