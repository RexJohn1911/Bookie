package com.moviebooking.service;

import com.moviebooking.dto.*;
import com.moviebooking.model.*;
import com.moviebooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowRepository    showRepository;
    private final SeatRepository    seatRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest req) {
        Show show = showRepository.findByIdForUpdate(req.getShowId())
                .orElseThrow(() -> new RuntimeException("Show not found"));

        if (req.getSeatNumbers().size() > show.getAvailableSeats())
            throw new RuntimeException("Not enough seats available. Requested: "
                    + req.getSeatNumbers().size() + ", Available: " + show.getAvailableSeats());

        List<String> uniqueSeats = req.getSeatNumbers().stream().distinct().collect(Collectors.toList());
        if (uniqueSeats.size() != req.getSeatNumbers().size())
            throw new RuntimeException("Duplicate seat numbers in request");

        List<Seat> seatsToBook = new ArrayList<>();
        double totalAmount = 0;

        for (String seatNum : uniqueSeats) {
            Seat seat = seatRepository.findByShowIdAndSeatNumber(show.getId(), seatNum)
                    .orElseThrow(() -> new RuntimeException("Seat not found: " + seatNum));
            if (seat.getStatus() != Seat.SeatStatus.AVAILABLE)
                throw new RuntimeException("Seat " + seatNum + " is no longer available");
            seatsToBook.add(seat);
            double price = show.getMovie().getTicketPrice();
            if (seat.getSeatType() == Seat.SeatType.PREMIUM) price *= 1.5;
            else if (seat.getSeatType() == Seat.SeatType.VIP) price *= 2.0;
            totalAmount += price;
        }

        seatsToBook.forEach(seat -> {
            seat.setStatus(Seat.SeatStatus.BOOKED);
            seatRepository.save(seat);
        });

        show.setAvailableSeats(show.getAvailableSeats() - uniqueSeats.size());
        showRepository.save(show);

        Booking booking = Booking.builder()
                .show(show)
                .customerName(req.getCustomerName())
                .customerEmail(req.getCustomerEmail())
                .customerPhone(req.getCustomerPhone())
                .seatNumbers(uniqueSeats)
                .totalAmount(totalAmount)
                .bookingTime(LocalDateTime.now())
                .status(Booking.BookingStatus.CONFIRMED)
                .bookingReference(generateRef())
                .build();

        bookingRepository.save(booking);
        return toResponse(booking);
    }

    public List<BookingResponse> getBookingsByEmail(String email) {
        return bookingRepository.findByCustomerEmail(email)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BookingResponse getBookingByRef(String ref) {
        return toResponse(bookingRepository.findByBookingReference(ref)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + ref)));
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    // User cancels their own booking — email must match
    @Transactional
    public BookingResponse cancelBookingByUser(Long id, String email) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomerEmail().equalsIgnoreCase(email))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");

        return performCancellation(booking);
    }

    // Admin cancels any booking
    @Transactional
    public BookingResponse cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return performCancellation(booking);
    }

    private BookingResponse performCancellation(Booking booking) {
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED)
            throw new RuntimeException("Booking is already cancelled");

        booking.getSeatNumbers().forEach(seatNum ->
            seatRepository.findByShowIdAndSeatNumber(booking.getShow().getId(), seatNum)
                    .ifPresent(seat -> {
                        seat.setStatus(Seat.SeatStatus.AVAILABLE);
                        seatRepository.save(seat);
                    })
        );

        Show show = booking.getShow();
        show.setAvailableSeats(show.getAvailableSeats() + booking.getSeatNumbers().size());
        showRepository.save(show);

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    private String generateRef() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uid  = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "BK-" + date + "-" + uid;
    }

    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .movieTitle(b.getShow().getMovie().getTitle())
                .hallName(b.getShow().getHallName())
                .showTime(b.getShow().getShowTime())
                .customerName(b.getCustomerName())
                .customerEmail(b.getCustomerEmail())
                .customerPhone(b.getCustomerPhone())
                .seatNumbers(b.getSeatNumbers())
                .totalAmount(b.getTotalAmount())
                .bookingTime(b.getBookingTime())
                .status(b.getStatus().name())
                .build();
    }
}
