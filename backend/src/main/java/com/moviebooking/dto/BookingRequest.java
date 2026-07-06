package com.moviebooking.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.List;

// ── Booking Request ──────────────────────────────────────────────────────────
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    @NotNull
    private Long showId;

    @NotBlank
    private String customerName;

    @Email
    @NotBlank
    private String customerEmail;

    @NotBlank
    private String customerPhone;

    @NotEmpty
    private List<String> seatNumbers;
}

