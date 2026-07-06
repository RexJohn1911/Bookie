package com.moviebooking.config;

import com.moviebooking.model.Movie;
import com.moviebooking.model.Show;
import com.moviebooking.repository.MovieRepository;
import com.moviebooking.repository.ShowRepository;
import com.moviebooking.service.ShowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final MovieRepository movieRepository;
    private final ShowRepository showRepository;
    private final ShowService showService;

    @Override
    public void run(String... args) {
        // Only seed if no data exists
        if (movieRepository.count() > 0) {
            log.info("Database already has data — skipping seed.");
            return;
        }

        log.info("Seeding sample movies and shows...");

        Movie m1 = movieRepository.save(Movie.builder()
                .title("Interstellar")
                .genre("Sci-Fi")
                .language("English")
                .description("A team of explorers travel through a wormhole in space to ensure humanity's survival.")
                .posterUrl("https://m.media-amazon.com/images/I/81p6F7GiCBL.jpg")
                .durationMinutes(169)
                .rating("UA")
                .ticketPrice(200.0)
                .active(true)
                .build());

        Movie m2 = movieRepository.save(Movie.builder()
                .title("KGF Chapter 2")
                .genre("Action")
                .language("Kannada")
                .description("Rocky faces new enemies who threaten his iron grip on the Kolar Gold Fields.")
                .posterUrl("https://m.media-amazon.com/images/I/81nHAG-TBFL.jpg")
                .durationMinutes(168)
                .rating("A")
                .ticketPrice(180.0)
                .active(true)
                .build());

        Movie m3 = movieRepository.save(Movie.builder()
                .title("Leo")
                .genre("Action/Thriller")
                .language("Tamil")
                .description("A mild-mannered man's hidden past catches up with him in explosive fashion.")
                .posterUrl("https://m.media-amazon.com/images/I/71n9XQKUWWL.jpg")
                .durationMinutes(164)
                .rating("UA")
                .ticketPrice(220.0)
                .active(true)
                .build());

        // Create shows for each movie
        List<Object[]> showData = List.of(
                new Object[]{m1, LocalDateTime.now().plusDays(1).withHour(10).withMinute(0), "Hall A", 80},
                new Object[]{m1, LocalDateTime.now().plusDays(1).withHour(14).withMinute(30), "Hall B", 80},
                new Object[]{m2, LocalDateTime.now().plusDays(1).withHour(11).withMinute(0), "Hall A", 80},
                new Object[]{m2, LocalDateTime.now().plusDays(2).withHour(18).withMinute(0), "Hall C", 80},
                new Object[]{m3, LocalDateTime.now().plusDays(1).withHour(16).withMinute(0), "Hall B", 80},
                new Object[]{m3, LocalDateTime.now().plusDays(2).withHour(20).withMinute(0), "Hall A", 80}
        );

        for (Object[] row : showData) {
            Show show = Show.builder()
                    .movie((Movie) row[0])
                    .showTime((LocalDateTime) row[1])
                    .hallName((String) row[2])
                    .totalSeats((Integer) row[3])
                    .availableSeats(0) // showService.addShow sets this
                    .build();
            showService.addShow(show);
        }

        log.info("Seeded {} movies and {} shows.", movieRepository.count(), showRepository.count());
    }
}
