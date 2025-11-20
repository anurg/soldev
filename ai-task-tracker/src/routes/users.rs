use actix_web::{get, web, HttpMessage, HttpRequest, HttpResponse, Responder};
use sqlx::PgPool;

use crate::{
    db::find_user_by_id,
    utils::Claims,
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

pub fn user_routes() -> actix_web::Scope {
    web::scope("/users")
        .service(get_current_user)
}
