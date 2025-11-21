use actix_web::{get, post, web, HttpMessage, HttpRequest, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    db::{create_task_history, list_task_history},
    models::CreateTaskHistoryRequest,
    utils::Claims,
};

#[post("/{task_id}/history")]
async fn create_history_handler(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    req: web::Json<CreateTaskHistoryRequest>,
    http_req: HttpRequest,
) -> impl Responder {
    let task_id = path.into_inner();

    // Get user ID from claims
    let user_id = match http_req.extensions().get::<Claims>() {
        Some(claims) => match Uuid::parse_str(&claims.sub) {
            Ok(id) => id,
            Err(_) => {
                return HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "Invalid user ID"
                }))
            }
        },
        None => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Unauthorized"
            }))
        }
    };

    match create_task_history(&pool, task_id, user_id, &req).await {
        Ok(history) => HttpResponse::Created().json(history),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[get("/{task_id}/history")]
async fn list_history_handler(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let task_id = path.into_inner();

    match list_task_history(&pool, task_id).await {
        Ok(history) => HttpResponse::Ok().json(history),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub fn task_history_routes() -> actix_web::Scope {
    web::scope("/tasks")
        .service(create_history_handler)
        .service(list_history_handler)
}
