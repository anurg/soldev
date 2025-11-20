use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage,
};
use futures_util::future::LocalBoxFuture;
use std::future::{ready, Ready};

use crate::utils::verify_jwt;

pub struct AuthMiddleware {
    pub jwt_secret: String,
}

impl<S, B> Transform<S, ServiceRequest> for AuthMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = AuthMiddlewareService<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(AuthMiddlewareService {
            service,
            jwt_secret: self.jwt_secret.clone(),
        }))
    }
}

pub struct AuthMiddlewareService<S> {
    service: S,
    jwt_secret: String,
}

impl<S, B> Service<ServiceRequest> for AuthMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let jwt_secret = self.jwt_secret.clone();

        // Extract token from Authorization header
        let auth_header = req.headers().get("Authorization");

        let token = match auth_header {
            Some(header_value) => {
                let header_str = header_value.to_str().unwrap_or("");
                if header_str.starts_with("Bearer ") {
                    Some(header_str[7..].to_string())
                } else {
                    None
                }
            }
            None => None,
        };

        if let Some(token) = token {
            match verify_jwt(&token, &jwt_secret) {
                Ok(claims) => {
                    // Store claims in request extensions
                    req.extensions_mut().insert(claims);
                    let fut = self.service.call(req);
                    Box::pin(async move {
                        let res = fut.await?;
                        Ok(res)
                    })
                }
                Err(_) => {
                    Box::pin(async move {
                        Err(actix_web::error::ErrorUnauthorized("Invalid token"))
                    })
                }
            }
        } else {
            Box::pin(async move {
                Err(actix_web::error::ErrorUnauthorized("Missing authorization token"))
            })
        }
    }
}
