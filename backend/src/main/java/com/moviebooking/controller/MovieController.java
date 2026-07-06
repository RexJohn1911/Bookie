package com.moviebooking.controller;

import com.moviebooking.model.Movie;
import com.moviebooking.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    private static final String ADMIN_SECRET = System.getenv()
            .getOrDefault("ADMIN_SECRET", "changeme");

    private void requireAdmin(String key) {
        if (key == null || !key.equals(ADMIN_SECRET)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin key");
        }
    }

    // Public: list all active movies
    @GetMapping
    public ResponseEntity<List<Movie>> getActiveMovies() {
        return ResponseEntity.ok(movieService.getAllActiveMovies());
    }

    // Admin: list all movies including inactive
    @GetMapping("/admin/all")
    public ResponseEntity<List<Movie>> getAllMovies(
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        requireAdmin(key);
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Movie>> searchMovies(@RequestParam String title) {
        return ResponseEntity.ok(movieService.searchMovies(title));
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<Movie>> getByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(movieService.getMoviesByGenre(genre));
    }

    // FIX: Admin write endpoints require X-Admin-Key header
    @PostMapping
    public ResponseEntity<Movie> addMovie(
            @Valid @RequestBody Movie movie,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        requireAdmin(key);
        return ResponseEntity.ok(movieService.addMovie(movie));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Movie> updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody Movie movie,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        requireAdmin(key);
        return ResponseEntity.ok(movieService.updateMovie(id, movie));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMovie(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        requireAdmin(key);
        movieService.deleteMovie(id);
        return ResponseEntity.ok("Movie removed successfully");
    }
}
