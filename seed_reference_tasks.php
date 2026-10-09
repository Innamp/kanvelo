<?php
$dbPath = __DIR__ . '/database.sqlite';
$pdo = new PDO("sqlite:" . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// The exact tasks from reference mockup
$referenceTasks = [
    // Column 1: To Do
    [
        'id' => 'ref-todo-1',
        'title' => 'Design Notification Banner',
        'description' => 'Ensure it adapts well in both light and dark themes.',
        'platform' => 'Mobile App',
        'assignee' => 'Sarah',
        'priority' => 'Medium',
        'stage' => 'todo',
        'progress' => 0,
        'mandays' => '3',
        'sprint_id' => 'sprint-10',
        'attachments_count' => 0,
        'comments_count' => 2,
        'created_at' => date('Y-m-d H:i:s', time() + 100)
    ],
    [
        'id' => 'ref-todo-2',
        'title' => 'Write Error Message Guidelines',
        'description' => '',
        'platform' => 'Mobile App',
        'assignee' => 'Elena',
        'priority' => 'Low',
        'stage' => 'todo',
        'progress' => 0,
        'mandays' => '2',
        'sprint_id' => 'sprint-10',
        'attachments_count' => 1,
        'comments_count' => 1,
        'created_at' => date('Y-m-d H:i:s', time() + 99)
    ],
    [
        'id' => 'ref-todo-3',
        'title' => 'Create Avatar Component',
        'description' => '',
        'platform' => 'Mobile App',
        'assignee' => 'Alex',
        'priority' => 'Medium',
        'stage' => 'todo',
        'progress' => 10,
        'mandays' => '4',
        'sprint_id' => 'sprint-10',
        'attachments_count' => 2,
        'comments_count' => 0,
        'created_at' => date('Y-m-d H:i:s', time() + 98)
    ],

    // Column 2: In Progress
    [
        'id' => 'ref-prog-1',
        'title' => 'Create Dashboard Wireframe',
        'description' => 'Client wants more whitespace in the left sidebar.',
        'platform' => 'Mobile App',
        'assignee' => 'Indah, Dody',
        'priority' => 'High',
        'stage' => 'in-progress',
        'progress' => 60,
        'mandays' => '5',
        'sprint_id' => 'sprint-10',
        'attachments_count' => 3,
        'comments_count' => 5,
        'created_at' => date('Y-m-d H:i:s', time() + 97)
    ],
    [
        'id' => 'ref-prog-2',
        'title' => 'API Endpoint Mapping',
        'description' => '',
        'platform' => 'Mobile App',
        'assignee' => 'Marcus',
        'priority' => 'Medium',
        'stage' => 'in-progress',
        'progress' => 40,
        'mandays' => '4',
        'sprint_id' => 'sprint-10',
        'attachments_count' => 2,
        'comments_count' => 1,
        'created_at' => date('Y-m-d H:i:s', time() + 96)
    ],
    [
        'id' => 'ref-prog-3',
        'title' => 'Dark Mode Theme Integration',
        'description' => '',
        'platform' => 'Mobile App',
        'assignee' => 'Leo, Sarah',
        'priority' => 'Low',
        'stage' => 'in-progress',
        'progress' => 25,
        'mandays' => '3',
        'sprint_id' => 'sprint-10',
        'attachments_count' => 1,
        'comments_count' => 2,
        'created_at' => date('Y-m-d H:i:s', time() + 95)
    ],

    // Column 3: In Review
    [
        'id' => 'ref-rev-1',
        'title' => 'Mobile Navigation Prototype',
        'description' => 'Check responsiveness on iOS devices.',
        'platform' => 'Mobile App',
        'assignee' => 'Gerry',
        'priority' => 'Low',
        'stage' => 'review',
        'progress' => 100,
        'mandays' => '4',
        'sprint_id' => 'sprint-10',
        'attachments_count' => 2,
        'comments_count' => 4,
        'created_at' => date('Y-m-d H:i:s', time() + 94)
    ],
    [
        'id' => 'ref-rev-2',
        'title' => 'Team Settings Layout',
        'description' => '',
        'platform' => 'Mobile App',
        'assignee' => 'Indah, Dody',
        'priority' => 'Medium',
        'stage' => 'review',
        'progress' => 100,
        'mandays' => '3',
        'sprint_id' => 'sprint-10',
        'attachments_count' => 1,
        'comments_count' => 3,
        'created_at' => date('Y-m-d H:i:s', time() + 93)
    ],

    // Column 4: Completed
    [
        'id' => 'ref-done-1',
        'title' => 'Landing Page Copywriting',
        'description' => '',
        'platform' => 'Mobile App',
        'assignee' => 'Sarah, Alex',
        'priority' => 'Medium',
        'stage' => 'completed',
        'progress' => 100,
        'mandays' => '4',
        'sprint_id' => 'sprint-10',
        'attachments_count' => 2,
        'comments_count' => 6,
        'created_at' => date('Y-m-d H:i:s', time() + 92)
    ],
    [
        'id' => 'ref-done-2',
        'title' => 'Brand Color Exploration',
        'description' => 'Colors approved for both web and mobile.',
        'platform' => 'Mobile App',
        'assignee' => 'Indah, Dody, Gerry',
        'priority' => 'Medium',
        'stage' => 'completed',
        'progress' => 100,
        'mandays' => '5',
        'sprint_id' => 'sprint-10',
        'attachments_count' => 3,
        'comments_count' => 1,
        'created_at' => date('Y-m-d H:i:s', time() + 91)
    ],
    [
        'id' => 'ref-done-3',
        'title' => 'App Icon Design',
        'description' => '',
        'platform' => 'Mobile App',
        'assignee' => 'Indah, Dody, Gerry, Sarah',
        'priority' => 'High',
        'stage' => 'completed',
        'progress' => 100,
        'mandays' => '6',
        'sprint_id' => 'sprint-10',
        'attachments_count' => 1,
        'comments_count' => 3,
        'created_at' => date('Y-m-d H:i:s', time() + 90)
    ]
];

$stmt = $pdo->prepare("
    INSERT OR REPLACE INTO tasks (
        id, title, description, background, objective, platform, assignee, 
        priority, stage, progress, mandays, sprint_id, attachments_count, 
        comments_count, created_at
    ) VALUES (
        :id, :title, :description, '', '', :platform, :assignee, 
        :priority, :stage, :progress, :mandays, :sprint_id, :attachments_count, 
        :comments_count, :created_at
    )
");

foreach ($referenceTasks as $task) {
    $stmt->execute([
        ':id' => $task['id'],
        ':title' => $task['title'],
        ':description' => $task['description'],
        ':platform' => $task['platform'],
        ':assignee' => $task['assignee'],
        ':priority' => $task['priority'],
        ':stage' => $task['stage'],
        ':progress' => $task['progress'],
        ':mandays' => $task['mandays'],
        ':sprint_id' => $task['sprint_id'],
        ':attachments_count' => $task['attachments_count'],
        ':comments_count' => $task['comments_count'],
        ':created_at' => $task['created_at']
    ]);
}

echo "Successfully seeded " . count($referenceTasks) . " reference tasks into database.sqlite\n";
