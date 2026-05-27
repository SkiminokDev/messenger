<?php
/**
 * Database initialization and connection handler
 * Creates database and tables if they don't exist
 */

$host = '185.84.108.3';
$dbname = 'b108930_mess';
$username = 'u108930';
$password = '123QWE!123qwe';

try {
    // Connect to MySQL server (without selecting database)
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    // Select the database
    $pdo->exec("USE `$dbname`");
    
    // Create messages table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `messeges` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `text` TEXT NOT NULL,
            `type_user` VARCHAR(20) DEFAULT 'sender',
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

/**
 * Get PDO connection to the database
 */
function getDbConnection() {
    global $host, $dbname, $username, $password;
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        die("Database connection failed: " . $e->getMessage());
    }
}
