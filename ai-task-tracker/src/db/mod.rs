use sqlx::{postgres::PgPoolOptions, PgPool};

pub mod user_repo;
pub mod team_repo;
pub mod project_repo;
pub mod task_repo;
pub mod subtask_repo;
pub mod task_history_repo;

pub use user_repo::*;
pub use team_repo::*;
pub use project_repo::*;
pub use task_repo::*;
pub use subtask_repo::*;
pub use task_history_repo::*;

pub async fn create_pool(database_url: &str) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await
}
