package com.moviebooking.service;

import com.moviebooking.model.*;
import com.moviebooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShowService {

    private final ShowRepository showRepository;
    private final MovieRepository movieRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;

    public List<Show> getShowsByMovie(Long movieId) {
        return showRepository.findByMovieIdAndShowTimeAfter(movieId, LocalDateTime.now());
    }

    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    public Show getShowById(Long id) {
        return showRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Show not found with id: " + id));
    }

    @Transactional
    public Show addShow(Show show) {
        Movie movie = movieRepository.findById(show.getMovie().getId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        show.setMovie(movie);

        // Ensure total seats is a positive multiple of 8 (since we have 8 rows)
        if (show.getTotalSeats() == null || show.getTotalSeats() <= 0) {
            show.setTotalSeats(80);
        } else {
            int remainder = show.getTotalSeats() % 8;
            if (remainder != 0) {
                show.setTotalSeats(show.getTotalSeats() - remainder);
            }
        }

        show.setAvailableSeats(show.getTotalSeats());
        Show savedShow = showRepository.save(show);
        generateSeats(savedShow);
        return savedShow;
    }

    private void generateSeats(Show show) {
        List<Seat> seats = new ArrayList<>();
        String[] rows = {"A", "B", "C", "D", "E", "F", "G", "H"};
        int seatsPerRow = show.getTotalSeats() / rows.length;

        for (int r = 0; r < rows.length; r++) {
            for (int s = 1; s <= seatsPerRow; s++) {
                Seat.SeatType type;
                if (r < 2) type = Seat.SeatType.VIP;
                else if (r < 4) type = Seat.SeatType.PREMIUM;
                else type = Seat.SeatType.REGULAR;

                seats.add(Seat.builder()
                        .show(show)
                        .rowLabel(rows[r])
                        .seatIndex(s)
                        .seatNumber(rows[r] + s)
                        .seatType(type)
                        .status(Seat.SeatStatus.AVAILABLE)
                        .build());
            }
        }
        seatRepository.saveAll(seats);
    }

    public List<Seat> getSeatsForShow(Long showId) {
        return seatRepository.findByShowId(showId);
    }

    @Transactional
    public void deleteShow(Long id) {
        // Validate if show has any confirmed bookings
        List<Booking> bookings = bookingRepository.findByShowId(id);
        boolean hasConfirmed = bookings.stream()
                .anyMatch(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED);
        if (hasConfirmed) {
            throw new RuntimeException("Cannot delete a show that has confirmed bookings.");
        }

        // Safe cascade: delete seats and associated bookings (cancelled, etc.)
        List<Seat> seats = seatRepository.findByShowId(id);
        seatRepository.deleteAllInBatch(seats);
        bookingRepository.deleteAllInBatch(bookings);

        showRepository.deleteById(id);
    }
}
