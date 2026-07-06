package com.moviebooking.repository;

import com.moviebooking.model.Seat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByShowId(Long showId);

    // FIX: Pessimistic write lock prevents race condition when two users
    // try to book the same seat simultaneously
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.show.id = :showId AND s.seatNumber = :seatNumber")
    Optional<Seat> findByShowIdAndSeatNumber(@Param("showId") Long showId,
                                             @Param("seatNumber") String seatNumber);
}
