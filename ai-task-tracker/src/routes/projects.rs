use actix_web::{delete, get, post, put, web, HttpMessage, HttpRequest, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    db::{create_project, delete_project, find_project_by_id, list_projects, update_project},
    models::{CreateProjectRequest, UpdateProjectRequest},
    utils::Claims,
};

#[post("")]
async fn create_project_handler(
    pool: web::Data<PgPool>,
    req_http: HttpRequest,
    req: web::Json<CreateProjectRequest>,
) -> impl Responder {
    // Get current user from claims
    let claims = match req_http.extensions().get::<Claims>() {
        Some(claims) => claims.clone(),
        None => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Unauthorized"
            }));
        }
    };

    let user_id = match Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Invalid user ID"
            }));
        }
    };

    match create_project(&pool, &req, user_id).await {
        Ok(project) => HttpResponse::Created().json(project),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[get("")]
async fn list_projects_handler(
    pool: web::Data<PgPool>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> impl Responder {
    let team_id = query
        .get("team_id")
        .and_then(|id| Uuid::parse_str(id).ok());

    match list_projects(&pool, team_id).await {
        Ok(projects) => HttpResponse::Ok().json(projects),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[get("/{id}")]
async fn get_project_handler(pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    let project_id = path.into_inner();

    match find_project_by_id(&pool, project_id).await {
        Ok(Some(project)) => HttpResponse::Ok().json(project),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Project not found"
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
async fn update_project_handler(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateProjectRequest>,
) -> impl Responder {
    let project_id = path.into_inner();

    match update_project(&pool, project_id, &req).await {
        Ok(project) => HttpResponse::Ok().json(project),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[delete("/{id}")]
async fn delete_project_handler(pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    let project_id = path.into_inner();

    match delete_project(&pool, project_id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub fn project_routes() -> actix_web::Scope {
    web::scope("/projects")
        .service(create_project_handler)
        .service(list_projects_handler)
        .service(get_project_handler)
        .service(update_project_handler)
        .service(delete_project_handler)
}
