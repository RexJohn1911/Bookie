package com.moviebooking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Show show;

    @Column(nullable = false)
    private String seatNumber;   // e.g. "A1", "B5"

    @Column(nullable = false)
    private String rowLabel;     // e.g. "A", "B"

    @Column(nullable = false)
    private Integer seatIndex;   // e.g. 1, 2, 3

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatType seatType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status;

    public enum SeatType {
        REGULAR,
        PREMIUM,
        VIP
    }

    public enum SeatStatus {
        AVAILABLE,
        BOOKED,
        LOCKED
    }
}