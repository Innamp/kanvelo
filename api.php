<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dbPath = __DIR__ . '/database.sqlite';

try {
    $pdo = new PDO("sqlite:" . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? 'get_tasks';
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? [];

switch ($action) {
    case 'get_sprints':
        $stmt = $pdo->query("SELECT * FROM sprints ORDER BY id DESC");
        echo json_encode(['sprints' => $stmt->fetchAll()]);
        break;

    case 'get_tasks':
        $sprintId = $_GET['sprint_id'] ?? 'sprint-10';
        if ($sprintId === 'all') {
            $stmt = $pdo->query("SELECT * FROM tasks ORDER BY created_at DESC");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM tasks WHERE sprint_id = ? ORDER BY created_at DESC");
            $stmt->execute([$sprintId]);
        }
        $tasks = $stmt->fetchAll();
        
        // Also get all sprints for the switcher
        $sprintsStmt = $pdo->query("SELECT * FROM sprints ORDER BY id DESC");
        $sprints = $sprintsStmt->fetchAll();

        echo json_encode([
            'status' => 'success',
            'sprintId' => $sprintId,
            'sprints' => $sprints,
            'tasks' => $tasks
        ]);
        break;

    case 'update_stage':
        $id = $body['id'] ?? null;
        $stage = $body['stage'] ?? null;
        $progress = isset($body['progress']) ? intval($body['progress']) : null;

        if (!$id || !$stage) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id or stage']);
            exit;
        }

        if ($progress === null) {
            if ($stage === 'completed') $progress = 100;
            elseif ($stage === 'todo') $progress = 0;
            elseif ($stage === 'in-progress') $progress = 50;
            else $progress = 80;
        }

        $stmt = $pdo->prepare("UPDATE tasks SET stage = ?, progress = ? WHERE id = ?");
        $stmt->execute([$stage, $progress, $id]);

        echo json_encode(['status' => 'success', 'id' => $id, 'stage' => $stage, 'progress' => $progress]);
        break;

    case 'save_task':
        $id = $body['id'] ?? null;
        $sprintId = $body['sprint_id'] ?? 'sprint-10';
        $title = $body['title'] ?? 'Untitled';
        $platform = $body['platform'] ?? 'General';
        $assignee = $body['assignee'] ?? 'Unassigned';
        $stage = $body['stage'] ?? 'todo';
        $priority = $body['priority'] ?? 'Medium';
        $progress = intval($body['progress'] ?? 0);
        $mandays = strval($body['mandays'] ?? '5');
        $description = $body['description'] ?? '';
        $background = $body['background'] ?? '';
        $jira = $body['jira'] ?? '';
        $dependency = $body['dependency'] ?? '';

        if (!$id) {
            $id = $sprintId . '-t' . time() . rand(100, 999);
        }

        $stmt = $pdo->prepare("
            INSERT INTO tasks (id, sprint_id, title, description, background, platform, assignee, priority, stage, progress, mandays, jira, dependency)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                description = excluded.description,
                background = excluded.background,
                platform = excluded.platform,
                assignee = excluded.assignee,
                priority = excluded.priority,
                stage = excluded.stage,
                progress = excluded.progress,
                mandays = excluded.mandays,
                jira = excluded.jira,
                dependency = excluded.dependency
        ");
        $stmt->execute([
            $id, $sprintId, $title, $description, $background,
            $platform, $assignee, $priority, $stage, $progress,
            $mandays, $jira, $dependency
        ]);

        echo json_encode(['status' => 'success', 'id' => $id]);
        break;

    case 'delete_task':
        $id = $body['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing task id']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['status' => 'success', 'deleted' => $id]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Unknown action']);
        break;
}
