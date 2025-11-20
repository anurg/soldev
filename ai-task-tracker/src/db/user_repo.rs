use crate::models::{CreateUserRequest, User};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn create_user(
    pool: &PgPool,
    req: &CreateUserRequest,
    password_hash: &str,
) -> Result<User, sqlx::Error> {
    let user = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
    )
    .bind(&req.email)
    .bind(password_hash)
    .bind(&req.full_name)
    .bind("member")
    .fetch_one(pool)
    .await?;

    Ok(user)
}

pub async fn find_user_by_email(pool: &PgPool, email: &str) -> Result<Option<User>, sqlx::Error> {
    let user = sqlx::query_as::<_, User>(
        r#"
        SELECT * FROM users WHERE email = $1
        "#,
    )
    .bind(email)
    .fetch_optional(pool)
    .await?;

    Ok(user)
}

pub async fn find_user_by_id(pool: &PgPool, id: Uuid) -> Result<Option<User>, sqlx::Error> {
    let user = sqlx::query_as::<_, User>(
        r#"
        SELECT * FROM users WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(user)
}

pub async fn list_users(pool: &PgPool) -> Result<Vec<User>, sqlx::Error> {
    let users = sqlx::query_as::<_, User>(
        r#"
        SELECT * FROM users ORDER BY created_at DESC
        "#,
    )
    .fetch_all(pool)
    .await?;

    Ok(users)
}
