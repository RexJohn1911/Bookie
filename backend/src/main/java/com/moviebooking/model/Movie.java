package com.moviebooking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Genre is required")
    private String genre;

    @NotBlank(message = "Language is required")
    private String language;

    @Column(length = 1000)
    private String description;

    private String posterUrl;

    @NotNull
    private Integer durationMinutes;

    @NotBlank
    private String rating;  // e.g. U, UA, A

    private Double ticketPrice;

    @Column(nullable = false)
    private boolean active = true;
}
