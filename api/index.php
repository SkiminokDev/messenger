<?php
/**
 * API Router - Single entry point for all API requests
 * Handles routing based on REQUEST_URI
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include database initialization and connection
require_once __DIR__ . '/../db/init.php';

// Get the request URI and parse it
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove trailing slashes and normalize path
$path = rtrim($path, '/');

// Route matching
$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDbConnection();
    
    // Route: POST /api/v1/messeges - Create new message
    if ($path === '/api/v1/messeges' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['text']) && !empty(trim($input['text']))) {
            $text = trim($input['text']);
            $type_user = isset($input['type_user']) ? $input['type_user'] : 'sender';
            
            $stmt = $pdo->prepare("INSERT INTO messeges (text, type_user, created_at) VALUES (:text, :type_user, NOW())");
            $stmt->execute([':text' => $text, ':type_user' => $type_user]);
            
            $id = (int)$pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => $id,
                    'text' => $text,
                    'type_user' => $type_user,
                    'created_at' => date('Y-m-d H:i:s')
                ]
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Text is required']);
        }
        exit;
    }
    
    // Route: GET /api/v1/messeges - Get all messages
    if ($path === '/api/v1/messeges' && $method === 'GET') {
        $stmt = $pdo->query("SELECT id, text, type_user, created_at FROM messeges ORDER BY created_at ASC");
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $messages]);
        exit;
    }
    
    // Route: GET /api/v1/messeges/{id} - Get single message by ID
    if (preg_match('#^/api/v1/messeges/(\d+)$#', $path, $matches) && $method === 'GET') {
        $id = (int)$matches[1];
        
        $stmt = $pdo->prepare("SELECT id, text, type_user, created_at FROM messeges WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $message = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($message) {
            echo json_encode(['success' => true, 'data' => $message]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Message not found']);
        }
        exit;
    }
    
    // Route: POST /api/admin/messeges/clear - Clear all messages (for admin)
    if ($path === '/api/admin/messeges/clear' && $method === 'POST') {
        $pdo->exec("TRUNCATE TABLE messeges");
        echo json_encode(['success' => true, 'message' => 'History cleared']);
        exit;
    }
    
    // Route: GET /api/admin/messeges/count - Get message count
    if ($path === '/api/admin/messeges/count' && $method === 'GET') {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM messeges");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => ['count' => (int)$result['count']]]);
        exit;
    }
    
    // 404 for unmatched routes
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Endpoint not found']);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
