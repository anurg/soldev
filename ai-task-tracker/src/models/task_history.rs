use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct TaskHistory {
    pub id: Uuid,
    pub task_id: Uuid,
    pub user_id: Uuid,
    pub comment: String,
    pub completion_percentage: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTaskHistoryRequest {
    pub comment: String,
    pub completion_percentage: i32,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct TaskHistoryWithUser {
    pub id: Uuid,
    pub task_id: Uuid,
    pub user_id: Uuid,
    pub comment: String,
    pub completion_percentage: i32,
    pub created_at: DateTime<Utc>,
    pub user_name: String,
    pub user_email: String,
}
