<?php
class Database
{
    // Update these to match your MySQL credentials
    private $host     = 'localhost';
    private $dbname   = 'SOLE_HAVEN';
    private $username = 'root';
    private $password = '';
    private $charset  = 'utf8mb4';

    /** @var \PDO */
    private $pdo;

    /** @var Database */
    private static $instance;

    // Private constructor to prevent direct new
    private function __construct()
    {
        $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
        $options = [
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
            \PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $this->pdo = new \PDO($dsn, $this->username, $this->password, $options);
    }

    /**
     * Get (or create) the singleton instance
     * @return Database
     */
    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    /**
     * Get the raw PDO connection
     * @return \PDO
     */
    public function getConnection(): \PDO
    {
        return $this->pdo;
    }

    /**
     * Execute a SELECT and return all rows
     * @param string $sql
     * @param array  $params
     * @return array
     */
    public function fetchAll(string $sql, array $params = []): array
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Execute a SELECT and return one row
     * @param string $sql
     * @param array  $params
     * @return array|false
     */
    public function fetch(string $sql, array $params = [])
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }

    /**
     * Execute an INSERT, UPDATE, or DELETE
     * @param string $sql
     * @param array  $params
     * @return int   Number of affected rows
     */
    public function execute(string $sql, array $params = []): int
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /**
     * Get last inserted ID (for AUTO_INCREMENT PKs)
     * @return string
     */
    public function lastInsertId(): string
    {
        return $this->pdo->lastInsertId();
    }
}
