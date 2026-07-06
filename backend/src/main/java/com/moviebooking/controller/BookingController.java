package com.moviebooking.controller;

import com.moviebooking.dto.*;
import com.moviebooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    private static final String ADMIN_SECRET =
            System.getenv().getOrDefault("ADMIN_SECRET", "changeme");

    private void requireAdmin(String key) {
        if (key == null || !key.equals(ADMIN_SECRET))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin key");
    }

    // ── Public ────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest req) {
        return ResponseEntity.ok(bookingService.createBooking(req));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@RequestParam String email) {
        return ResponseEntity.ok(bookingService.getBookingsByEmail(email));
    }

    @GetMapping("/ref/{ref}")
    public ResponseEntity<BookingResponse> getByRef(@PathVariable String ref) {
        return ResponseEntity.ok(bookingService.getBookingByRef(ref));
    }

    // ── User self-cancel: user can cancel their OWN booking by proving their email ──
    @PutMapping("/{id}/cancel-user")
    public ResponseEntity<BookingResponse> cancelMyBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email required");
        return ResponseEntity.ok(bookingService.cancelBookingByUser(id, email));
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    @GetMapping("/admin/all")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        requireAdmin(key);
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> adminCancelBooking(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        requireAdmin(key);
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
