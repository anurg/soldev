use actix_web::{get, post, put, web, HttpMessage, HttpRequest, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    db::{create_user, find_user_by_email, find_user_by_id, list_users, update_user},
    models::{CreateUserRequest, UpdateUserRequest},
    utils::{hash_password, Claims},
};

#[get("/me")]
async fn get_current_user(pool: web::Data<PgPool>, req: HttpRequest) -> impl Responder {
    // Get claims from request extensions (set by auth middleware)
    let claims = match req.extensions().get::<Claims>() {
        Some(claims) => claims.clone(),
        None => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Unauthorized"
            }));
        }
    };

    // Parse user ID from claims
    let user_id = match uuid::Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Invalid user ID"
            }));
        }
    };

    // Fetch user from database
    match find_user_by_id(&pool, user_id).await {
        Ok(Some(user)) => HttpResponse::Ok().json(user),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "User not found"
        })),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[get("")]
async fn list_users_handler(pool: web::Data<PgPool>) -> impl Responder {
    match list_users(&pool).await {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[post("")]
async fn create_user_handler(
    pool: web::Data<PgPool>,
    req: web::Json<CreateUserRequest>,
) -> impl Responder {
    // Check if user already exists
    if let Ok(Some(_)) = find_user_by_email(&pool, &req.email).await {
        return HttpResponse::Conflict().json(serde_json::json!({
            "error": "User already exists"
        }));
    }

    // Hash password
    let password_hash = match hash_password(&req.password) {
        Ok(hash) => hash,
        Err(e) => {
            log::error!("Password hashing error: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }));
        }
    };

    match create_user(&pool, &req, &password_hash).await {
        Ok(user) => HttpResponse::Created().json(user),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[put("/{id}")]
async fn update_user_handler(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateUserRequest>,
) -> impl Responder {
    let user_id = path.into_inner();

    let password_hash = if let Some(password) = &req.password {
        match hash_password(password) {
            Ok(hash) => Some(hash),
            Err(e) => {
                log::error!("Password hashing error: {}", e);
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Internal server error"
                }));
            }
        }
    } else {
        None
    };

    match update_user(&pool, user_id, req.full_name.clone(), password_hash).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub fn user_routes() -> actix_web::Scope {
    web::scope("/users")
        .service(get_current_user)
        .service(list_users_handler)
        .service(create_user_handler)
        .service(update_user_handler)
}
