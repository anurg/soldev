mod config;
mod db;
mod middleware;
mod models;
mod routes;
mod utils;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use dotenv::dotenv;

use config::Config;
use middleware::AuthMiddleware;
use routes::{auth_routes, project_routes, subtask_routes, task_routes, team_routes, user_routes};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables
    dotenv().ok();
    env_logger::init();

    // Load configuration
    let config = Config::from_env().expect("Failed to load configuration");
    log::info!("Starting server at {}", config.server_address());

    // Create database connection pool
    let pool = db::create_pool(&config.database_url)
        .await
        .expect("Failed to create database pool");

    log::info!("Database connection pool created");

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    log::info!("Database migrations completed");

    let server_address = config.server_address();
    let jwt_secret = config.jwt_secret.clone();

    // Start HTTP server
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(config.clone()))
            .service(
                web::scope("/api")
                    // Public routes (no auth required)
                    .service(auth_routes())
                    // Protected routes (auth required)
                    .service(
                        web::scope("")
                            .wrap(AuthMiddleware {
                                jwt_secret: jwt_secret.clone(),
                            })
                            .service(user_routes())
                            .service(team_routes())
                            .service(project_routes())
                            .service(task_routes())
                            .service(subtask_routes()),
                    ),
            )
    })
    .bind(&server_address)?
    .run()
    .await
}
