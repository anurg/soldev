use actix_web::{post, web, HttpResponse, Responder};
use sqlx::PgPool;

use crate::{
    config::Config,
    db::{create_user, find_user_by_email},
    models::{AuthResponse, CreateUserRequest, LoginRequest},
    utils::{create_jwt, hash_password, verify_password},
};

#[post("/register")]
async fn register(
    pool: web::Data<PgPool>,
    config: web::Data<Config>,
    req: web::Json<CreateUserRequest>,
) -> impl Responder {
    // Check if user already exists
    match find_user_by_email(&pool, &req.email).await {
        Ok(Some(_)) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "User with this email already exists"
            }));
        }
        Ok(None) => {}
        Err(e) => {
            log::error!("Database error: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }));
        }
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

    // Create user
    match create_user(&pool, &req, &password_hash).await {
        Ok(user) => {
            // Generate JWT token
            let token = match create_jwt(
                user.id,
                &user.email,
                &user.role.to_string(),
                &config.jwt_secret,
                config.jwt_expiration_hours,
            ) {
                Ok(token) => token,
                Err(e) => {
                    log::error!("JWT creation error: {}", e);
                    return HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Internal server error"
                    }));
                }
            };

            HttpResponse::Created().json(AuthResponse { token, user })
        }
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[post("/login")]
async fn login(
    pool: web::Data<PgPool>,
    config: web::Data<Config>,
    req: web::Json<LoginRequest>,
) -> impl Responder {
    // Find user by email
    let user = match find_user_by_email(&pool, &req.email).await {
        Ok(Some(user)) => user,
        Ok(None) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Invalid email or password"
            }));
        }
        Err(e) => {
            log::error!("Database error: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }));
        }
    };

    // Verify password
    match verify_password(&req.password, &user.password_hash) {
        Ok(true) => {
            // Generate JWT token
            let token = match create_jwt(
                user.id,
                &user.email,
                &user.role.to_string(),
                &config.jwt_secret,
                config.jwt_expiration_hours,
            ) {
                Ok(token) => token,
                Err(e) => {
                    log::error!("JWT creation error: {}", e);
                    return HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Internal server error"
                    }));
                }
            };

            HttpResponse::Ok().json(AuthResponse { token, user })
        }
        Ok(false) => HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Invalid email or password"
        })),
        Err(e) => {
            log::error!("Password verification error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub fn auth_routes() -> actix_web::Scope {
    web::scope("/auth")
        .service(register)
        .service(login)
}
