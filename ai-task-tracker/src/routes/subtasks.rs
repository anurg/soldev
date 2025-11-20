use actix_web::{put, delete, web, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    db::{delete_subtask, update_subtask},
    models::UpdateSubtaskRequest,
};

#[put("/{id}")]
async fn update_subtask_handler(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateSubtaskRequest>,
) -> impl Responder {
    let subtask_id = path.into_inner();

    match update_subtask(&pool, subtask_id, &req).await {
        Ok(subtask) => HttpResponse::Ok().json(subtask),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[delete("/{id}")]
async fn delete_subtask_handler(pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    let subtask_id = path.into_inner();

    match delete_subtask(&pool, subtask_id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub fn subtask_routes() -> actix_web::Scope {
    web::scope("/subtasks")
        .service(update_subtask_handler)
        .service(delete_subtask_handler)
}
