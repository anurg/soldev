use crate::models::{CreateSubtaskRequest, Subtask, UpdateSubtaskRequest};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn create_subtask(
    pool: &PgPool,
    parent_task_id: Uuid,
    req: &CreateSubtaskRequest,
) -> Result<Subtask, sqlx::Error> {
    let subtask = sqlx::query_as::<_, Subtask>(
        r#"
        INSERT INTO subtasks (parent_task_id, title)
        VALUES ($1, $2)
        RETURNING *
        "#,
    )
    .bind(parent_task_id)
    .bind(&req.title)
    .fetch_one(pool)
    .await?;

    Ok(subtask)
}

pub async fn find_subtask_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Subtask>, sqlx::Error> {
    let subtask = sqlx::query_as::<_, Subtask>(
        r#"
        SELECT * FROM subtasks WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(subtask)
}

pub async fn list_subtasks(pool: &PgPool, parent_task_id: Uuid) -> Result<Vec<Subtask>, sqlx::Error> {
    let subtasks = sqlx::query_as::<_, Subtask>(
        r#"
        SELECT * FROM subtasks WHERE parent_task_id = $1 ORDER BY created_at ASC
        "#,
    )
    .bind(parent_task_id)
    .fetch_all(pool)
    .await?;

    Ok(subtasks)
}

pub async fn update_subtask(
    pool: &PgPool,
    id: Uuid,
    req: &UpdateSubtaskRequest,
) -> Result<Subtask, sqlx::Error> {
    let subtask = sqlx::query_as::<_, Subtask>(
        r#"
        UPDATE subtasks
        SET title = COALESCE($2, title),
            is_completed = COALESCE($3, is_completed),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        "#,
    )
    .bind(id)
    .bind(&req.title)
    .bind(req.is_completed)
    .fetch_one(pool)
    .await?;

    Ok(subtask)
}

pub async fn delete_subtask(pool: &PgPool, id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        DELETE FROM subtasks WHERE id = $1
        "#,
    )
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}
