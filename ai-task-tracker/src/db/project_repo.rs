use crate::models::{CreateProjectRequest, Project, UpdateProjectRequest};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn create_project(
    pool: &PgPool,
    req: &CreateProjectRequest,
    created_by: Uuid,
) -> Result<Project, sqlx::Error> {
    let project = sqlx::query_as::<_, Project>(
        r#"
        INSERT INTO projects (name, description, team_id, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
    )
    .bind(&req.name)
    .bind(&req.description)
    .bind(req.team_id)
    .bind(created_by)
    .fetch_one(pool)
    .await?;

    Ok(project)
}

pub async fn find_project_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Project>, sqlx::Error> {
    let project = sqlx::query_as::<_, Project>(
        r#"
        SELECT * FROM projects WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(project)
}

pub async fn list_projects(pool: &PgPool, team_id: Option<Uuid>) -> Result<Vec<Project>, sqlx::Error> {
    let projects = if let Some(team_id) = team_id {
        sqlx::query_as::<_, Project>(
            r#"
            SELECT * FROM projects WHERE team_id = $1 ORDER BY created_at DESC
            "#,
        )
        .bind(team_id)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, Project>(
            r#"
            SELECT * FROM projects ORDER BY created_at DESC
            "#,
        )
        .fetch_all(pool)
        .await?
    };

    Ok(projects)
}

pub async fn update_project(
    pool: &PgPool,
    id: Uuid,
    req: &UpdateProjectRequest,
) -> Result<Project, sqlx::Error> {
    let project = sqlx::query_as::<_, Project>(
        r#"
        UPDATE projects
        SET name = COALESCE($2, name),
            description = COALESCE($3, description),
            team_id = COALESCE($4, team_id),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        "#,
    )
    .bind(id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(req.team_id)
    .fetch_one(pool)
    .await?;

    Ok(project)
}

pub async fn delete_project(pool: &PgPool, id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        DELETE FROM projects WHERE id = $1
        "#,
    )
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}
