package com.moviebooking.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private String bookingReference;
    private String movieTitle;
    private String hallName;
    private LocalDateTime showTime;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private List<String> seatNumbers;
    private Double totalAmount;
    private LocalDateTime bookingTime;
    private String status;
}
