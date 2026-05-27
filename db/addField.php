<?php
/**
 * Add type_user column to messeges table
 * Run this script once to update existing database
 */

$host = '185.84.108.3';
$dbname = 'b108930_mess';
$username = 'u108930';
$password = '123QWE!123qwe';

try {
    // Connect to MySQL server
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM `messeges` LIKE 'type_user'");
    $columnExists = $stmt->fetch();
    
    if ($columnExists) {
        echo "Column 'type_user' already exists in table 'messeges'\n";
    } else {
        // Add type_user column with default value 'sender'
        $pdo->exec("ALTER TABLE `messeges` ADD COLUMN `type_user` VARCHAR(20) DEFAULT 'sender' AFTER `text`");
        echo "Column 'type_user' added successfully to table 'messeges'\n";
    }
    
} catch (PDOException $e) {
    die("Database operation failed: " . $e->getMessage());
}
