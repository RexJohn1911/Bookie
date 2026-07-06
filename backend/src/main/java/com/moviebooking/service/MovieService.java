package com.moviebooking.service;

import com.moviebooking.model.Movie;
import com.moviebooking.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;

    public List<Movie> getAllActiveMovies() {
        return movieRepository.findByActiveTrue();
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + id));
    }

    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Movie updateMovie(Long id, Movie updated) {
        Movie movie = getMovieById(id);
        movie.setTitle(updated.getTitle());
        movie.setGenre(updated.getGenre());
        movie.setLanguage(updated.getLanguage());
        movie.setDescription(updated.getDescription());
        movie.setPosterUrl(updated.getPosterUrl());
        movie.setDurationMinutes(updated.getDurationMinutes());
        movie.setRating(updated.getRating());
        movie.setTicketPrice(updated.getTicketPrice());
        movie.setActive(updated.isActive());
        return movieRepository.save(movie);
    }

    public void deleteMovie(Long id) {
        Movie movie = getMovieById(id);
        movie.setActive(false);   // soft delete
        movieRepository.save(movie);
    }

    public List<Movie> searchMovies(String title) {
        return movieRepository.findByTitleContainingIgnoreCaseAndActiveTrue(title);
    }

    public List<Movie> getMoviesByGenre(String genre) {
        return movieRepository.findByGenreAndActiveTrue(genre);
    }
}
