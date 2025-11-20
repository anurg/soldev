use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct EmailLog {
    pub id: Uuid,
    pub sender: String,
    pub subject: Option<String>,
    pub body_text: Option<String>,
    pub received_at: DateTime<Utc>,
    pub processed: bool,
    pub created_task_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct IngestEmailRequest {
    pub sender: String,
    pub subject: Option<String>,
    pub body_text: Option<String>,
    pub received_at: Option<DateTime<Utc>>,
}
