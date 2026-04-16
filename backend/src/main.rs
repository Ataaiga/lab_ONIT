mod entities;
use entities::{Entity as Project, Model as ProjectModel, ActiveModel};

use axum::{routing::{get, put}, Router, Json, extract::{Path, State}};
use sea_orm::*;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

#[derive(Clone)]
struct AppState {
    db: DatabaseConnection,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    
    // Подключение к БД
    let db = Database::connect(db_url).await.expect("Failed to connect to DB");
    let state = AppState { db };

    // Настройка CORS (чтобы React мог стучаться к Rust)
    let cors = CorsLayer::permissive();

    // Роутинг
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/projects", get(list_projects).post(create_project))
        .route("/api/projects/:id", put(update_project).delete(delete_project))
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("Backend запущен на http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "ok" }))
}

// --- Хендлеры (CRUD) ---

async fn list_projects(State(state): State<AppState>) -> Json<Vec<ProjectModel>> {
    let projects = Project::find().all(&state.db).await.unwrap();
    Json(projects)
}

async fn create_project(State(state): State<AppState>, Json(payload): Json<ProjectModel>) -> Json<ProjectModel> {
    let new_project = ActiveModel {
        eth_address: Set(payload.eth_address),
        name: Set(payload.name),
        description: Set(payload.description),
        target_amount: Set(payload.target_amount),
        owner_address: Set(payload.owner_address),
        ..Default::default()
    };
    
    let res = new_project.insert(&state.db).await.unwrap();
    Json(res)
}

async fn update_project(
    State(state): State<AppState>, 
    Path(id): Path<i32>, 
    Json(payload): Json<ProjectModel>
) -> Json<ProjectModel> {
    let project: ActiveModel = Project::find_by_id(id).one(&state.db).await.unwrap().unwrap().into();
    
    let mut updated_project = project;
    updated_project.name = Set(payload.name);
    updated_project.description = Set(payload.description);
    
    let res = updated_project.update(&state.db).await.unwrap();
    Json(res)
}

async fn delete_project(State(state): State<AppState>, Path(id): Path<i32>) -> Json<serde_json::Value> {
    Project::delete_by_id(id).exec(&state.db).await.unwrap();
    Json(serde_json::json!({ "status": "success" }))
}

#[cfg(test)]
mod tests {
    use super::health;

    #[tokio::test]
    async fn health_endpoint_returns_ok_status() {
        let response = health().await;
        let body = response.0;
        assert_eq!(body["status"], "ok");
    }
}
