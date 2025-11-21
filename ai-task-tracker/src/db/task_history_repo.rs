use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{CreateTaskHistoryRequest, TaskHistory, TaskHistoryWithUser};

pub async fn create_task_history(
    pool: &PgPool,
    task_id: Uuid,
    user_id: Uuid,
    req: &CreateTaskHistoryRequest,
) -> Result<TaskHistory, sqlx::Error> {
    let history = sqlx::query_as::<_, TaskHistory>(
        r#"
        INSERT INTO task_history (task_id, user_id, comment, completion_percentage)
        VALUES ($1, $2, $3, $4)
        RETURNING id, task_id, user_id, comment, completion_percentage, created_at
        "#,
    )
    .bind(task_id)
    .bind(user_id)
    .bind(&req.comment)
    .bind(req.completion_percentage)
    .fetch_one(pool)
    .await?;

    Ok(history)
}

pub async fn list_task_history(
    pool: &PgPool,
    task_id: Uuid,
) -> Result<Vec<TaskHistoryWithUser>, sqlx::Error> {
    let history = sqlx::query_as::<_, TaskHistoryWithUser>(
        r#"
        SELECT 
            th.id,
            th.task_id,
            th.user_id,
            th.comment,
            th.completion_percentage,
            th.created_at,
            u.full_name as user_name,
            u.email as user_email
        FROM task_history th
        JOIN users u ON th.user_id = u.id
        WHERE th.task_id = $1
        ORDER BY th.created_at DESC
        "#,
    )
    .bind(task_id)
    .fetch_all(pool)
    .await?;

    Ok(history)
}
