use crate::models::{CreateTaskRequest, Task, TaskPriority, TaskStatus, UpdateProgressRequest, UpdateTaskRequest};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn create_task(pool: &PgPool, req: &CreateTaskRequest) -> Result<Task, sqlx::Error> {
    let priority = req.priority.as_ref().map(|p| p.to_string()).unwrap_or_else(|| "medium".to_string());
    
    let task = sqlx::query_as::<_, Task>(
        r#"
        INSERT INTO tasks (project_id, title, description, priority, assignee_id, due_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        "#,
    )
    .bind(req.project_id)
    .bind(&req.title)
    .bind(&req.description)
    .bind(priority)
    .bind(req.assignee_id)
    .bind(req.due_date)
    .fetch_one(pool)
    .await?;

    Ok(task)
}

pub async fn find_task_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Task>, sqlx::Error> {
    let task = sqlx::query_as::<_, Task>(
        r#"
        SELECT * FROM tasks WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(task)
}

pub async fn list_tasks(
    pool: &PgPool,
    project_id: Option<Uuid>,
    assignee_id: Option<Uuid>,
    status: Option<String>,
) -> Result<Vec<Task>, sqlx::Error> {
    let mut query = String::from("SELECT * FROM tasks WHERE 1=1");
    
    if project_id.is_some() {
        query.push_str(" AND project_id = $1");
    }
    if assignee_id.is_some() {
        query.push_str(" AND assignee_id = $2");
    }
    if status.is_some() {
        query.push_str(" AND status = $3");
    }
    
    query.push_str(" ORDER BY created_at DESC");

    let mut q = sqlx::query_as::<_, Task>(&query);
    
    if let Some(pid) = project_id {
        q = q.bind(pid);
    }
    if let Some(aid) = assignee_id {
        q = q.bind(aid);
    }
    if let Some(s) = status {
        q = q.bind(s);
    }

    let tasks = q.fetch_all(pool).await?;
    Ok(tasks)
}

pub async fn update_task(
    pool: &PgPool,
    id: Uuid,
    req: &UpdateTaskRequest,
) -> Result<Task, sqlx::Error> {
    let status_str = req.status.as_ref().map(|s| s.to_string());
    let priority_str = req.priority.as_ref().map(|p| p.to_string());
    
    let task = sqlx::query_as::<_, Task>(
        r#"
        UPDATE tasks
        SET title = COALESCE($2, title),
            description = COALESCE($3, description),
            status = COALESCE($4, status),
            priority = COALESCE($5, priority),
            assignee_id = COALESCE($6, assignee_id),
            due_date = COALESCE($7, due_date),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        "#,
    )
    .bind(id)
    .bind(&req.title)
    .bind(&req.description)
    .bind(status_str)
    .bind(priority_str)
    .bind(req.assignee_id)
    .bind(req.due_date)
    .fetch_one(pool)
    .await?;

    Ok(task)
}

pub async fn update_task_progress(
    pool: &PgPool,
    id: Uuid,
    progress: i32,
) -> Result<Task, sqlx::Error> {
    let task = sqlx::query_as::<_, Task>(
        r#"
        UPDATE tasks
        SET progress_percent = $2,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        "#,
    )
    .bind(id)
    .bind(progress)
    .fetch_one(pool)
    .await?;

    Ok(task)
}

pub async fn delete_task(pool: &PgPool, id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        DELETE FROM tasks WHERE id = $1
        "#,
    )
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}
