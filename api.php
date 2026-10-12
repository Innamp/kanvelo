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

    // Ensure users table exists with default seed
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'contributor',
            avatar TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($userCount == 0) {
        $defaultUsers = [
            ['usr-1', 'John Doe', 'john.doe@novaboard.io', 'administrator', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'],
            ['usr-2', 'Sarah Jenkins', 'sarah.j@novaboard.io', 'contributor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop'],
            ['usr-3', 'Alex Rivera', 'alex.r@novaboard.io', 'contributor', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop'],
            ['usr-4', 'Guest Viewer', 'guest.viewer@novaboard.io', 'viewer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop']
        ];
        $insertStmt = $pdo->prepare("INSERT INTO users (id, name, email, role, avatar) VALUES (?, ?, ?, ?, ?)");
        foreach ($defaultUsers as $u) {
            $insertStmt->execute($u);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? 'get_tasks';
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? [];

switch ($action) {
    case 'get_users':
        $stmt = $pdo->query("SELECT * FROM users ORDER BY created_at ASC");
        echo json_encode(['status' => 'success', 'users' => $stmt->fetchAll()]);
        break;

    case 'save_user':
        $id = $body['id'] ?? null;
        $name = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');
        $role = $body['role'] ?? 'contributor';
        $avatar = $body['avatar'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop';

        if (!$name || !$email) {
            http_response_code(400);
            echo json_encode(['error' => 'Name and email are required']);
            exit;
        }

        if (!in_array($role, ['administrator', 'contributor', 'viewer'])) {
            $role = 'contributor';
        }

        if (!$id) {
            $id = 'usr-' . time() . rand(10, 99);
        }

        $stmt = $pdo->prepare("
            INSERT INTO users (id, name, email, role, avatar)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                email = excluded.email,
                role = excluded.role,
                avatar = excluded.avatar
        ");
        $stmt->execute([$id, $name, $email, $role, $avatar]);

        echo json_encode(['status' => 'success', 'user' => [
            'id' => $id, 'name' => $name, 'email' => $email, 'role' => $role, 'avatar' => $avatar
        ]]);
        break;

    case 'delete_user':
        $id = $body['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing user ID']);
            exit;
        }

        // Prevent deleting the last administrator
        $adminCount = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'administrator'")->fetchColumn();
        $targetUser = $pdo->prepare("SELECT role FROM users WHERE id = ?");
        $targetUser->execute([$id]);
        $targetRole = $targetUser->fetchColumn();

        if ($targetRole === 'administrator' && $adminCount <= 1) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot delete the only remaining Administrator']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'deleted' => $id]);
        break;

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
        $sprintId = $body['sprint_id'] ?? 'sprint-8';
        $title = $body['title'] ?? ($body['epic'] ?? 'Untitled');
        $platform = $body['platform'] ?? 'General';
        $assignee = $body['assignee'] ?? ($body['pm_name'] ?? 'Unassigned');
        $stage = $body['stage'] ?? 'todo';
        $priority = $body['priority'] ?? 'Medium';
        $progress = intval($body['progress'] ?? 0);
        $mandays = strval($body['mandays'] ?? ($body['weight_mandays'] ?? '0'));
        $description = $body['description'] ?? '';
        $background = $body['background'] ?? '';
        $objective = $body['objective'] ?? '';
        $jira = $body['jira'] ?? ($body['jira_ticket_number'] ?? '');
        $dependency = $body['dependency'] ?? '';

        $no = $body['no'] ?? null;
        $ticket_code = $body['ticket_code'] ?? '';
        $sub_platform = $body['sub_platform'] ?? '';
        $epic = $body['epic'] ?? $title;
        $impact = $body['impact'] ?? '';
        $business_owner_pic = $body['business_owner_pic'] ?? '';
        $category = $body['category'] ?? '';
        $changes_principal_role = $body['changes_principal_role'] ?? '';
        $brd_submission_date = $body['brd_submission_date'] ?? '';
        $pm_name = $body['pm_name'] ?? $assignee;
        $weight_mandays = $body['weight_mandays'] ?? $mandays;
        $proposal_prio_rank = $body['proposal_prio_rank'] ?? '';
        $final_prio_rank = $body['final_prio_rank'] ?? '';
        $prd_creation_date = $body['prd_creation_date'] ?? '';
        $jira_ticket_number = $body['jira_ticket_number'] ?? $jira;
        $total_tickets_generated = $body['total_tickets_generated'] ?? '';
        $uat_date = $body['uat_date'] ?? '';
        $date_sharing_req_se = $body['date_sharing_req_se'] ?? '';
        $final_dev_status = $body['final_dev_status'] ?? '';
        $develop_in_sprint = $body['develop_in_sprint'] ?? '';
        $cross_sprint = $body['cross_sprint'] ?? '';
        $cross_sprint_to = $body['cross_sprint_to'] ?? '';
        $mandays_consumption_se = $body['mandays_consumption_se'] ?? '';
        $mandays_consumption_itpd = $body['mandays_consumption_itpd'] ?? '';
        $reason_cancel_deprio = $body['reason_cancel_deprio'] ?? '';
        $deployment_date = $body['deployment_date'] ?? '';
        $brd = $body['brd'] ?? '';
        $ticket_1st_shown = $body['ticket_1st_shown'] ?? '';
        $start_dev_in_sprint = $body['start_dev_in_sprint'] ?? '';
        $final_remarks = $body['final_remarks'] ?? '';
        $remark = $body['remark'] ?? '';
        $shared_product_team = $body['shared_product_team'] ?? '';
        $prev_prio = $body['prev_prio'] ?? '';

        if (!$id) {
            $id = $sprintId . '-t' . time() . rand(100, 999);
        }

        $stmt = $pdo->prepare("
            INSERT INTO tasks (
                id, sprint_id, title, description, background, objective, platform, assignee, priority, stage, progress, mandays, jira, dependency,
                no, ticket_code, sub_platform, epic, impact, business_owner_pic, category, changes_principal_role, brd_submission_date,
                pm_name, weight_mandays, proposal_prio_rank, final_prio_rank, prd_creation_date, jira_ticket_number, total_tickets_generated,
                uat_date, date_sharing_req_se, final_dev_status, develop_in_sprint, cross_sprint, cross_sprint_to, mandays_consumption_se,
                mandays_consumption_itpd, reason_cancel_deprio, deployment_date, brd, ticket_1st_shown, start_dev_in_sprint, final_remarks,
                remark, shared_product_team, prev_prio
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                description = excluded.description,
                background = excluded.background,
                objective = excluded.objective,
                platform = excluded.platform,
                assignee = excluded.assignee,
                priority = excluded.priority,
                stage = excluded.stage,
                progress = excluded.progress,
                mandays = excluded.mandays,
                jira = excluded.jira,
                dependency = excluded.dependency,
                no = excluded.no,
                ticket_code = excluded.ticket_code,
                sub_platform = excluded.sub_platform,
                epic = excluded.epic,
                impact = excluded.impact,
                business_owner_pic = excluded.business_owner_pic,
                category = excluded.category,
                changes_principal_role = excluded.changes_principal_role,
                brd_submission_date = excluded.brd_submission_date,
                pm_name = excluded.pm_name,
                weight_mandays = excluded.weight_mandays,
                proposal_prio_rank = excluded.proposal_prio_rank,
                final_prio_rank = excluded.final_prio_rank,
                prd_creation_date = excluded.prd_creation_date,
                jira_ticket_number = excluded.jira_ticket_number,
                total_tickets_generated = excluded.total_tickets_generated,
                uat_date = excluded.uat_date,
                date_sharing_req_se = excluded.date_sharing_req_se,
                final_dev_status = excluded.final_dev_status,
                develop_in_sprint = excluded.develop_in_sprint,
                cross_sprint = excluded.cross_sprint,
                cross_sprint_to = excluded.cross_sprint_to,
                mandays_consumption_se = excluded.mandays_consumption_se,
                mandays_consumption_itpd = excluded.mandays_consumption_itpd,
                reason_cancel_deprio = excluded.reason_cancel_deprio,
                deployment_date = excluded.deployment_date,
                brd = excluded.brd,
                ticket_1st_shown = excluded.ticket_1st_shown,
                start_dev_in_sprint = excluded.start_dev_in_sprint,
                final_remarks = excluded.final_remarks,
                remark = excluded.remark,
                shared_product_team = excluded.shared_product_team,
                prev_prio = excluded.prev_prio
        ");
        $stmt->execute([
            $id, $sprintId, $title, $description, $background, $objective,
            $platform, $assignee, $priority, $stage, $progress,
            $mandays, $jira, $dependency,
            $no, $ticket_code, $sub_platform, $epic, $impact, $business_owner_pic, $category, $changes_principal_role, $brd_submission_date,
            $pm_name, $weight_mandays, $proposal_prio_rank, $final_prio_rank, $prd_creation_date, $jira_ticket_number, $total_tickets_generated,
            $uat_date, $date_sharing_req_se, $final_dev_status, $develop_in_sprint, $cross_sprint, $cross_sprint_to, $mandays_consumption_se,
            $mandays_consumption_itpd, $reason_cancel_deprio, $deployment_date, $brd, $ticket_1st_shown, $start_dev_in_sprint, $final_remarks,
            $remark, $shared_product_team, $prev_prio
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
