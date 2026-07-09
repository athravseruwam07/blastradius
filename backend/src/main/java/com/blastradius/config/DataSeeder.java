package com.blastradius.config;

import com.blastradius.domain.MonitoredService;
import com.blastradius.repository.DeployRepository;
import com.blastradius.repository.ServiceRepository;
import com.blastradius.service.DeployService;
import com.blastradius.service.IncidentService;
import com.blastradius.web.dto.IncidentRequest;
import com.blastradius.web.dto.ScoreRequest;
import com.blastradius.domain.Severity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds a small demo catalog on first boot so the dashboard is not empty.
 * Sample deploys are run through the real scoring engine — nothing here
 * hardcodes a score or a breakdown.
 */
@Component
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ServiceRepository serviceRepository;
    private final DeployRepository deployRepository;
    private final DeployService deployService;
    private final IncidentService incidentService;

    public DataSeeder(ServiceRepository serviceRepository,
                      DeployRepository deployRepository,
                      DeployService deployService,
                      IncidentService incidentService) {
        this.serviceRepository = serviceRepository;
        this.deployRepository = deployRepository;
        this.deployService = deployService;
        this.incidentService = incidentService;
    }

    @Override
    public void run(String... args) {
        if (serviceRepository.count() > 0) {
            return;
        }
        log.info("Seeding demo services, incidents, and deploys");

        serviceRepository.save(new MonitoredService(
                "payment-service", 10, List.of("/payment/", "/billing/")));
        serviceRepository.save(new MonitoredService(
                "auth-service", 9, List.of("/auth/", "/session/")));
        serviceRepository.save(new MonitoredService(
                "order-service", 7, List.of("/checkout/")));
        serviceRepository.save(new MonitoredService(
                "marketing-site", 2, List.of()));
        // Blastradius scores its own deploys (see Jenkinsfile) — it needs to exist
        // as a service like any other. "scoring/" is sensitive because a bad change
        // there silently changes every other service's risk score.
        serviceRepository.save(new MonitoredService(
                "blastradius", 8, List.of("scoring/")));

        LocalDateTime now = LocalDateTime.now();

        // Incident history first so incident-count scoring sees it.
        incidentService.create(new IncidentRequest(
                "payment-service", Severity.HIGH,
                "Double-charge bug after gateway timeout", now.minusDays(6), null));
        incidentService.create(new IncidentRequest(
                "auth-service", Severity.MEDIUM,
                "Session tokens invalidated early", now.minusDays(12), null));

        if (deployRepository.count() == 0) {
            // Scored through the real engine at boot time.
            deployService.scoreAndPersist(new ScoreRequest(
                    "payment-service", 840, 700, 90,
                    List.of("src/main/java/payment/Charge.java", "/payment/gateway/Retry.java"),
                    previousFridayEvening(now)));
            deployService.scoreAndPersist(new ScoreRequest(
                    "auth-service", 260, 180, 80,
                    List.of("/auth/token/Validator.java"),
                    now.minusDays(2).withHour(11).withMinute(30)));
            deployService.scoreAndPersist(new ScoreRequest(
                    "order-service", 120, 70, 50,
                    List.of("src/order/Notes.java"),
                    now.minusDays(1).withHour(10).withMinute(5)));
            deployService.scoreAndPersist(new ScoreRequest(
                    "marketing-site", 40, 35, 5,
                    List.of("pages/pricing.tsx"),
                    now.minusHours(5)));
        }
    }

    private LocalDateTime previousFridayEvening(LocalDateTime from) {
        LocalDateTime cursor = from.minusDays(1);
        while (cursor.getDayOfWeek() != java.time.DayOfWeek.FRIDAY) {
            cursor = cursor.minusDays(1);
        }
        return cursor.withHour(17).withMinute(45);
    }
}
