use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    db::{
        add_team_member, create_team, delete_team, find_team_by_id, list_team_members,
        list_teams, remove_team_member, update_team,
    },
    models::{AddTeamMemberRequest, CreateTeamRequest, UpdateTeamRequest},
};

#[post("")]
async fn create_team_handler(
    pool: web::Data<PgPool>,
    req: web::Json<CreateTeamRequest>,
    http_req: actix_web::HttpRequest,
) -> impl Responder {
    use actix_web::HttpMessage;
    use crate::utils::Claims;

    // Get user ID from claims
    let user_id = match http_req.extensions().get::<Claims>() {
        Some(claims) => match uuid::Uuid::parse_str(&claims.sub) {
            Ok(id) => id,
            Err(_) => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Invalid user ID"})),
        },
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    match create_team(&pool, &req).await {
        Ok(team) => {
            // Auto-add creator as member
            if let Err(e) = crate::db::add_team_member(&pool, team.id, user_id).await {
                log::error!("Failed to auto-add creator to team: {}", e);
                // We don't fail the request if adding member fails, but we log it
            }
            HttpResponse::Created().json(team)
        },
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[get("")]
async fn list_teams_handler(pool: web::Data<PgPool>) -> impl Responder {
    match list_teams(&pool).await {
        Ok(teams) => HttpResponse::Ok().json(teams),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[get("/{id}")]
async fn get_team_handler(pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    let team_id = path.into_inner();

    match find_team_by_id(&pool, team_id).await {
        Ok(Some(team)) => HttpResponse::Ok().json(team),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Team not found"
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
async fn update_team_handler(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateTeamRequest>,
) -> impl Responder {
    let team_id = path.into_inner();

    match update_team(&pool, team_id, &req).await {
        Ok(team) => HttpResponse::Ok().json(team),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[delete("/{id}")]
async fn delete_team_handler(pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    let team_id = path.into_inner();

    match delete_team(&pool, team_id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[post("/{id}/members")]
async fn add_member_handler(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    req: web::Json<AddTeamMemberRequest>,
) -> impl Responder {
    let team_id = path.into_inner();

    let user_id = if let Some(id) = req.user_id {
        id
    } else if let Some(email) = &req.email {
        match crate::db::find_user_by_email(&pool, email).await {
            Ok(Some(user)) => user.id,
            Ok(None) => {
                return HttpResponse::NotFound().json(serde_json::json!({
                    "error": "User not found"
                }));
            }
            Err(e) => {
                log::error!("Database error: {}", e);
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Internal server error"
                }));
            }
        }
    } else {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Either user_id or email must be provided"
        }));
    };

    match add_team_member(&pool, team_id, user_id).await {
        Ok(member) => HttpResponse::Created().json(member),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[delete("/{id}/members/{user_id}")]
async fn remove_member_handler(
    pool: web::Data<PgPool>,
    path: web::Path<(Uuid, Uuid)>,
) -> impl Responder {
    let (team_id, user_id) = path.into_inner();

    match remove_team_member(&pool, team_id, user_id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

#[get("/{id}/members")]
async fn list_members_handler(pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    let team_id = path.into_inner();

    match list_team_members(&pool, team_id).await {
        Ok(members) => HttpResponse::Ok().json(members),
        Err(e) => {
            log::error!("Database error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub fn team_routes() -> actix_web::Scope {
    web::scope("/teams")
        .service(create_team_handler)
        .service(list_teams_handler)
        .service(get_team_handler)
        .service(update_team_handler)
        .service(delete_team_handler)
        .service(add_member_handler)
        .service(remove_member_handler)
        .service(list_members_handler)
}
