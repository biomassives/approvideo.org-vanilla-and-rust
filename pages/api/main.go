package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/supabase/supabase-go"
)

type Video struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Categories  []string `json:"categories"`
	Description string   `json:"description"`
	YoutubeID   string   `json:"youtubeId"`
	Tags        []string `json:"tags"`
	Rating      float32  `json:"rating"`
	Date        string   `json:"date"`
	Transcript  string   `json:"transcript"`
	Materials   []string `json:"materials,omitempty"`
	Steps       []string `json:"steps,omitempty"`
	Panels      []Panel  `json:"panels,omitempty"`
}

type Panel struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

type ImprovementSuggestion struct {
	ID        int    `json:"id,omitempty"`
	VideoID   string `json:"video_id"`
	Suggestion string `json:"suggestion"`
	Status    string `json:"status"` // e.g., "pending", "approved", "rejected"
}

type Response struct {
	Message string `json:"message"`
}

type VideoListResponse struct {
	Videos []Video `json:"videos"`
}

func listVideos(w http.ResponseWriter, r *http.Request) {
	// Initialize Supabase client
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	supabase := supabase.NewClient(supabaseUrl, supabaseKey, nil)

	// Fetch videos from Supabase
	var videos []Video
	if err := supabase.DB.From("videos").Select("*").ExecuteWithContext(context.Background(), &videos); err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch videos: %v", err), http.StatusInternalServerError)
		return
	}

	// Return videos as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(VideoListResponse{Videos: videos})
}


func submitVideo(w http.ResponseWriter, r *http.Request) {
	// ... (Authentication logic - you'll need to implement this) ...

	// Parse video data from request body
	var video Video
	if err := json.NewDecoder(r.Body).Decode(&video); err != nil {
		http.Error(w, "Invalid video data", http.StatusBadRequest)
		return
	}

	// Insert video into Supabase
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	supabase := supabase.NewClient(supabaseUrl, supabaseKey, nil)

	// Assuming your table is named "videos"
	if _, err := supabase.DB.From("videos").Insert(video).ExecuteWithContext(context.Background()); err != nil {
		http.Error(w, fmt.Sprintf("Failed to insert video: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(Response{Message: "Video added successfully"})
}


func editVideo(w http.ResponseWriter, r *http.Request) {
	// ... (Authentication logic - you'll need to implement this) ...

	videoID := chi.URLParam(r, "videoID") // Extract video ID using chi.URLParam

	// Parse video data from request body
	var video Video
	if err := json.NewDecoder(r.Body).Decode(&video); err != nil {
		http.Error(w, "Invalid video data", http.StatusBadRequest)
		return
	}


	// Update video in Supabase
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	supabase := supabase.NewClient(supabaseUrl, supabaseKey, nil)

	// Assuming your table is named "videos"
	if _, err := supabase.DB.From("videos").Update(video).Eq("id", videoID).ExecuteWithContext(context.Background()); err != nil {
		http.Error(w, fmt.Sprintf("Failed to update video: %v", err), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(Response{Message: "Video updated successfully"})
}


func suggestImprovement(w http.ResponseWriter, r *http.Request) {
	// ... (Authentication logic - you'll need to implement this) ...

	// Parse suggestion data from request body
	var suggestion ImprovementSuggestion
	if err := json.NewDecoder(r.Body).Decode(&suggestion); err != nil {
		http.Error(w, "Invalid suggestion data", http.StatusBadRequest)
		return
	}

	// Insert suggestion into Supabase
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	supabase := supabase.NewClient(supabaseUrl, supabaseKey, nil)

	// Assuming your table is named "improvement_suggestions"
	if _, err := supabase.DB.From("improvement_suggestions").Insert(suggestion).ExecuteWithContext(context.Background()); err != nil {
		http.Error(w, fmt.Sprintf("Failed to insert suggestion: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(Response{Message: "Suggestion submitted successfully"})
}

func approveImprovement(w http.ResponseWriter, r *http.Request) {
	// ... (Authentication and authorization logic - you'll need to implement this) ...

	suggestionIDStr := chi.URLParam(r, "suggestionID") // Extract suggestion ID using chi.URLParam
	suggestionID, err := strconv.Atoi(suggestionIDStr)
	if err != nil {
		http.Error(w, "Invalid suggestion ID", http.StatusBadRequest)
		return
	}

	// Update suggestion status in Supabase
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	supabase := supabase.NewClient(supabaseUrl, supabaseKey, nil)

	// Assuming your table is named "improvement_suggestions"
	if _, err := supabase.DB.From("improvement_suggestions").Update(map[string]interface{}{"status": "approved"}).Eq("id", suggestionID).ExecuteWithContext(context.Background()); err != nil {
		http.Error(w, fmt.Sprintf("Failed to approve suggestion: %v", err), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(Response{Message: "Suggestion approved"})
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers",    "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

	// Use chi router for more flexible routing
	rtr := chi.NewRouter()

	rtr.Get("/", listVideos)
	rtr.Post("/submit", submitVideo)
	rtr.Put("/{videoID}", editVideo) // Use named parameter for video ID
	rtr.Post("/suggest", suggestImprovement)
	rtr.Post("/approve/{suggestionID}", approveImprovement) // Use named parameter for suggestion ID

	rtr.ServeHTTP(w, r)
}
