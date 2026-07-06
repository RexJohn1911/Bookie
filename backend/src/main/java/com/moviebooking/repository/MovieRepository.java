package com.moviebooking.repository;

import com.moviebooking.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByActiveTrue();
    List<Movie> findByGenreAndActiveTrue(String genre);
    List<Movie> findByTitleContainingIgnoreCaseAndActiveTrue(String title);
}
