use actix_web::{web, App, HttpServer, Responder, HttpRequest, HttpResponse, http::header};
use serde::{Deserialize, Serialize};
use suppabase::{Client, client};
use std::env;

#[derive(Deserialize, Serialize, Debug)]
struct Video {
    id: String,
    title: String,
    categories: Vec<String>,
    description: String,
    youtubeId: String,
    tags: Vec<String>,
    rating: f32,
    date: String,
    transcript: String,
    materials: Option<Vec<String>>,
    steps: Option<Vec<String>>,
    panels: Option<Vec<Panel>>,
}

#[derive(Deserialize, Serialize, Debug)]
struct Panel {
    title: String,
    content: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
struct ImprovementSuggestion {
    id: Option<i32>,
    video_id: String,
    suggestion: String,
    status: String, 
}

#[derive(Serialize)]
struct Response {
    message: String,
}

#[derive(Serialize)]
struct VideoListResponse {
    videos: Vec<Video>,
}

async fn list_videos(req: HttpRequest) -> impl Responder {
    let supabase_url = env::var("SUPABASE_URL").expect("SUPABASE_URL must be set");
    let supabase_key = env::var("SUPABASE_SERVICE_ROLE_KEY").expect("SUPABASE_SERVICE_ROLE_KEY must be set");
    let supabase: Client = client(&supabase_url, &supabase_key);

    let jwt = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))
        .unwrap_or("");

    let auth_response = supabase.auth().api().user_with_jwt(jwt).await;

    match auth_response {
        Ok(user_response) => {
            if let Some(_) = user_response.user {
                let response = supabase.from("videos").select("*").execute().await;

                match response {
                    Ok(result) => {
                        let videos: Vec<Video> = serde_json::from_value(result.data).unwrap();
                        HttpResponse::Ok().json(VideoListResponse { videos })
                    }
                    Err(e) => HttpResponse::InternalServerError().body(format!("Failed to fetch videos: {:?}", e)),
                }
            } else {
                HttpResponse::Unauthorized().body("Invalid token")
            }
        }
        Err(e) => HttpResponse::InternalServerError().body(format!("Authentication error: {:?}", e)),
    }
}

async fn submit(req: HttpRequest, form_data: web::Json<FormData>) -> impl Responder {
    // ... (Authentication logic as before) ...

            if let Some(_) = user_response.user {
                let insert_result = supabase
                    .from("videos")
                    .insert(serde_json::to_value(form_data.0).unwrap())
                    .execute()
                    .await;

                match insert_result {
                    Ok(_) => HttpResponse::Ok().json(Response { message: "Video added successfully!".to_string() }),
                    Err(e) => HttpResponse::InternalServerError().body(format!("Failed to add video: {:?}", e)),
                }
            } else {
                HttpResponse::Unauthorized().body("Invalid token")
            }
        }
        Err(e) => HttpResponse::InternalServerError().body(format!("Authentication error: {:?}", e)),
    }
}

async fn edit_video(req: HttpRequest, path: web::Path<String>, form_data: web::Json<FormData>) -> impl Responder {
    // ... (Authentication logic as before) ...

            if let Some(_) = user_response.user {
                let update_result = supabase
                    .from("videos")
                    .update(serde_json::to_value(form_data.0).unwrap())
                    .eq("id", video_id)
                    .execute()
                    .await;

                match update_result {
                    Ok(_) => HttpResponse::Ok().json(Response { message: "Video updated successfully!".to_string() }),
                    Err(e) => HttpResponse::InternalServerError().body(format!("Failed to update video: {:?}", e)),
                }
            } else {
                HttpResponse::Unauthorized().body("Invalid token")
            }
        }
        Err(e) => HttpResponse::InternalServerError().body(format!("Authentication error: {:?}", e)),
    }
}

async fn suggest_improvement(req: HttpRequest, suggestion: web::Json<ImprovementSuggestion>) -> impl Responder {
    // ... (Authentication logic as before) ...

            if let Some(_) = user_response.user { 
                let insert_result = supabase
                    .from("improvement_suggestions") 
                    .insert(serde_json::to_value(suggestion.0).unwrap())
                    .execute()
                    .await;

                match insert_result {
                    Ok(_) => HttpResponse::Ok().json(Response { message: "Suggestion submitted successfully!".to_string() }),
                    Err(e) => HttpResponse::InternalServerError().body(format!("Failed to submit suggestion: {:?}", e)),
                }
            } else {
                HttpResponse::Unauthorized().body("Invalid token")
            }
        }
        Err(e) => HttpResponse::InternalServerError().body(format!("Authentication error: {:?}", e)),
    }
}

async fn approve_improvement(req: HttpRequest, path: web::Path<i32>) -> impl Responder {
    // ... (Authentication and admin check logic as before) ...

                    let update_result = supabase
                        .from("improvement_suggestions")
                        .update(serde_json::json!({ "status": "approved" }))
                        .eq("id", suggestion_id)
                        .execute()
                        .await;

                    match update_result {
                        Ok(_) => HttpResponse::Ok().json(Response { message: "Suggestion approved!".to_string() }),
                        Err(e) => HttpResponse::InternalServerError().body(format!("Failed to approve suggestion: {:?}", e)),
                    }
            } else {
                HttpResponse::Unauthorized().body("Invalid token")
            }
        }
        Err(e) => HttpResponse::InternalServerError().body(format!("Authentication error: {:?}", e)),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(web::resource("/").route(web::get().to(list_videos)))
            .service(web::resource("/submit").route(web::post().to(submit)))
            .service(web::resource("/{video_id}").route(web::put().to(edit_video)))
            .service(web::resource("/suggest").route(web::post().to(suggest_improvement)))
            .service(web::resource("/approve/{suggestion_id}").route(web::post().to(approve_improvement)))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
