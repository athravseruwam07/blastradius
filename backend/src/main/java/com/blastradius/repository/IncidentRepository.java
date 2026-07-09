package com.blastradius.repository;

import com.blastradius.domain.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    long countByServiceIdAndTimestampAfter(Long serviceId, LocalDateTime after);

    List<Incident> findByServiceNameOrderByTimestampDesc(String serviceName);
}
