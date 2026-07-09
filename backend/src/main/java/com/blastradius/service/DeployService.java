package com.blastradius.service;

import com.blastradius.domain.Deploy;
import com.blastradius.domain.Incident;
import com.blastradius.domain.MonitoredService;
import com.blastradius.repository.DeployRepository;
import com.blastradius.repository.IncidentRepository;
import com.blastradius.repository.ServiceRepository;
import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.RiskLevel;
import com.blastradius.scoring.RiskScoringEngine;
import com.blastradius.scoring.ScoringContext;
import com.blastradius.scoring.ScoringResult;
import com.blastradius.web.dto.DeployResponse;
import com.blastradius.web.dto.OutcomeRequest;
import com.blastradius.web.dto.ScoreRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Application service for deploys: runs the scoring engine, persists results,
 * and answers queries. All collaborators arrive by constructor injection.
 */
@Service
public class DeployService {

    private final DeployRepository deployRepository;
    private final ServiceRepository serviceRepository;
    private final IncidentRepository incidentRepository;
    private final RiskScoringEngine scoringEngine;
    private final ObjectMapper objectMapper;

    public DeployService(DeployRepository deployRepository,
                         ServiceRepository serviceRepository,
                         IncidentRepository incidentRepository,
                         RiskScoringEngine scoringEngine,
                         ObjectMapper objectMapper) {
        this.deployRepository = deployRepository;
        this.serviceRepository = serviceRepository;
        this.incidentRepository = incidentRepository;
        this.scoringEngine = scoringEngine;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public DeployResponse scoreAndPersist(ScoreRequest request) {
        MonitoredService service = serviceRepository.findByName(request.serviceName())
                .orElseThrow(() -> new NotFoundException(
                        "Unknown service: " + request.serviceName()));

        LocalDateTime timestamp = request.timestamp() != null ? request.timestamp() : LocalDateTime.now();
        ScoringContext context = new ScoringContext(
                service,
                timestamp,
                request.diffLinesChanged(),
                request.prodLinesChanged(),
                request.testLinesChanged(),
                request.changedPathsOrEmpty());

        ScoringResult result = scoringEngine.score(context);

        Deploy deploy = new Deploy(
                service,
                timestamp,
                request.diffLinesChanged(),
                context.testProdRatio(),
                result.score(),
                writeBreakdown(result.breakdown()));
        deploy = deployRepository.save(deploy);
        return toResponse(deploy);
    }

    @Transactional(readOnly = true)
    public List<DeployResponse> list(String serviceName, RiskLevel riskLevel,
                                     LocalDateTime from, LocalDateTime to) {
        return deployRepository.findAllByOrderByTimestampDesc().stream()
                .filter(d -> serviceName == null || d.getService().getName().equals(serviceName))
                .filter(d -> riskLevel == null || RiskLevel.fromScore(d.getRiskScore()) == riskLevel)
                .filter(d -> from == null || !d.getTimestamp().isBefore(from))
                .filter(d -> to == null || !d.getTimestamp().isAfter(to))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DeployResponse get(Long id) {
        return toResponse(findDeploy(id));
    }

    @Transactional
    public DeployResponse recordOutcome(Long id, OutcomeRequest request) {
        Deploy deploy = findDeploy(id);
        deploy.setStatus(request.status());
        if (request.incidentSeverity() != null) {
            incidentRepository.save(new Incident(
                    deploy.getService(),
                    LocalDateTime.now(),
                    request.incidentSeverity(),
                    request.incidentDescription(),
                    deploy));
        }
        return toResponse(deployRepository.save(deploy));
    }

    private Deploy findDeploy(Long id) {
        return deployRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No deploy with id " + id));
    }

    private DeployResponse toResponse(Deploy deploy) {
        return new DeployResponse(
                deploy.getId(),
                deploy.getService().getName(),
                deploy.getTimestamp(),
                deploy.getDiffSize(),
                deploy.getTestProdRatio(),
                deploy.getRiskScore(),
                RiskLevel.fromScore(deploy.getRiskScore()),
                deploy.getStatus(),
                readBreakdown(deploy.getScoreBreakdown()));
    }

    private String writeBreakdown(List<FactorScore> breakdown) {
        try {
            return objectMapper.writeValueAsString(breakdown);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not serialize score breakdown", e);
        }
    }

    private List<FactorScore> readBreakdown(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<FactorScore>>() {
            });
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not deserialize score breakdown", e);
        }
    }
}
