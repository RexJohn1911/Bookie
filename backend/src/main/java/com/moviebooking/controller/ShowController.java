package com.moviebooking.controller;

import com.moviebooking.model.*;
import com.moviebooking.service.ShowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/shows")
@RequiredArgsConstructor
public class ShowController {

    private final ShowService showService;

    private static final String ADMIN_SECRET = System.getenv()
            .getOrDefault("ADMIN_SECRET", "changeme");

    private void requireAdmin(String key) {
        if (key == null || !key.equals(ADMIN_SECRET)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin key");
        }
    }

    // Public
    @GetMapping
    public ResponseEntity<List<Show>> getAllShows() {
        return ResponseEntity.ok(showService.getAllShows());
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<Show>> getShowsByMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(showService.getShowsByMovie(movieId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Show> getShowById(@PathVariable Long id) {
        return ResponseEntity.ok(showService.getShowById(id));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<List<Seat>> getSeats(@PathVariable Long id) {
        return ResponseEntity.ok(showService.getSeatsForShow(id));
    }

    // FIX: Admin write endpoints require X-Admin-Key header
    @PostMapping
    public ResponseEntity<Show> addShow(
            @RequestBody Show show,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        requireAdmin(key);
        return ResponseEntity.ok(showService.addShow(show));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteShow(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        requireAdmin(key);
        showService.deleteShow(id);
        return ResponseEntity.ok("Show deleted");
    }
}
