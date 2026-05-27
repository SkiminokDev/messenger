<?php
/**
 * Clear messages handler - Alternative direct endpoint
 * Can be called directly or via API router
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Include database initialization
require_once __DIR__ . '/../../db/init.php';

try {
    $pdo = getDbConnection();
    
    // Truncate the messages table
    $pdo->exec("TRUNCATE TABLE messeges");
    
    echo json_encode(['success' => true, 'message' => 'History cleared']);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
