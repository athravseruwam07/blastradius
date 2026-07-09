package com.blastradius.repository;

import com.blastradius.domain.MonitoredService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ServiceRepository extends JpaRepository<MonitoredService, Long> {

    Optional<MonitoredService> findByName(String name);
}
