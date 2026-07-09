package com.blastradius.service;

import com.blastradius.domain.Deploy;
import com.blastradius.domain.Incident;
import com.blastradius.domain.MonitoredService;
import com.blastradius.repository.DeployRepository;
import com.blastradius.repository.IncidentRepository;
import com.blastradius.repository.ServiceRepository;
import com.blastradius.web.dto.IncidentRequest;
import com.blastradius.web.dto.IncidentResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final ServiceRepository serviceRepository;
    private final DeployRepository deployRepository;

    public IncidentService(IncidentRepository incidentRepository,
                           ServiceRepository serviceRepository,
                           DeployRepository deployRepository) {
        this.incidentRepository = incidentRepository;
        this.serviceRepository = serviceRepository;
        this.deployRepository = deployRepository;
    }

    @Transactional
    public IncidentResponse create(IncidentRequest request) {
        MonitoredService service = serviceRepository.findByName(request.serviceName())
                .orElseThrow(() -> new NotFoundException(
                        "Unknown service: " + request.serviceName()));
        Deploy linkedDeploy = null;
        if (request.linkedDeployId() != null) {
            linkedDeploy = deployRepository.findById(request.linkedDeployId())
                    .orElseThrow(() -> new NotFoundException(
                            "No deploy with id " + request.linkedDeployId()));
        }
        LocalDateTime timestamp = request.timestamp() != null ? request.timestamp() : LocalDateTime.now();
        Incident incident = incidentRepository.save(new Incident(
                service, timestamp, request.severity(), request.description(), linkedDeploy));
        return toResponse(incident);
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> listForService(String serviceName) {
        return incidentRepository.findByServiceNameOrderByTimestampDesc(serviceName).stream()
                .map(this::toResponse)
                .toList();
    }

    private IncidentResponse toResponse(Incident incident) {
        return new IncidentResponse(
                incident.getId(),
                incident.getService().getName(),
                incident.getTimestamp(),
                incident.getSeverity(),
                incident.getDescription(),
                incident.getLinkedDeploy() != null ? incident.getLinkedDeploy().getId() : null);
    }
}
