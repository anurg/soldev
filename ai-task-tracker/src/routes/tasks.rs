use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    db::{
        create_subtask, create_task, delete_task, find_task_by_id,
        list_subtasks, list_tasks, update_task, update_task_progress,
    },
    models::{
        CreateSubtaskRequest, CreateTaskRequest, UpdateProgressRequest,
        UpdateTaskRequest,
    },
};

#[post("")]
async fn create_task_handler(
    pool: web::Data<PgPool>,
    req: web::Json<CreateTaskRequest>,
) -> impl Responder {
    match create_task(&pool, &req).await {
        Ok(task) => HttpResponse::Created().json(task),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[get("")]
async fn list_tasks_handler(
    pool: web::Data<PgPool>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> impl Responder {
    let project_id = query
        .get("project_id")
        .and_then(|id| Uuid::parse_str(id).ok());
    let assignee_id = query
        .get("assignee_id")
        .and_then(|id| Uuid::parse_str(id).ok());
    let status = query.get("status").map(|s| s.to_string());

    match list_tasks(&pool, project_id, assignee_id, status).await {
        Ok(tasks) => HttpResponse::Ok().json(tasks),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[get("/{id}")]
async fn get_task_handler(pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    let task_id = path.into_inner();

    match find_task_by_id(&pool, task_id).await {
        Ok(Some(task)) => HttpResponse::Ok().json(task),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Task not found"
        })),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[put("/{id}")]
async fn update_task_handler(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateTaskRequest>,
) -> impl Responder {
    let task_id = path.into_inner();

    match update_task(&pool, task_id, &req).await {
        Ok(task) => HttpResponse::Ok().json(task),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[put("/{id}/progress")]
async fn update_progress_handler(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateProgressRequest>,
) -> impl Responder {
    let task_id = path.into_inner();

    if req.progress_percent < 0 || req.progress_percent > 100 {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Progress must be between 0 and 100"
        }));
    }

    match update_task_progress(&pool, task_id, req.progress_percent).await {
        Ok(task) => HttpResponse::Ok().json(task),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[delete("/{id}")]
async fn delete_task_handler(pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    let task_id = path.into_inner();

    match delete_task(&pool, task_id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// Subtask routes
#[post("/{id}/subtasks")]
async fn create_subtask_handler(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    req: web::Json<CreateSubtaskRequest>,
) -> impl Responder {
    let task_id = path.into_inner();

    match create_subtask(&pool, task_id, &req).await {
        Ok(subtask) => HttpResponse::Created().json(subtask),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[get("/{id}/subtasks")]
async fn list_subtasks_handler(pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    let task_id = path.into_inner();

    match list_subtasks(&pool, task_id).await {
        Ok(subtasks) => HttpResponse::Ok().json(subtasks),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub fn task_routes() -> actix_web::Scope {
    web::scope("/tasks")
        .service(create_task_handler)
        .service(list_tasks_handler)
        .service(get_task_handler)
        .service(update_task_handler)
        .service(update_progress_handler)
        .service(delete_task_handler)
        .service(create_subtask_handler)
        .service(list_subtasks_handler)
}
