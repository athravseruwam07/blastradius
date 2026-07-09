package com.blastradius.web;

import com.blastradius.scoring.RiskLevel;
import com.blastradius.service.DeployService;
import com.blastradius.web.dto.DeployResponse;
import com.blastradius.web.dto.OutcomeRequest;
import com.blastradius.web.dto.ScoreRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/deploys")
public class DeployController {

    private final DeployService deployService;

    public DeployController(DeployService deployService) {
        this.deployService = deployService;
    }

    /** Score a deploy and persist the result. Main entry point for CI. */
    @PostMapping("/score")
    @ResponseStatus(HttpStatus.CREATED)
    public DeployResponse score(@Valid @RequestBody ScoreRequest request) {
        return deployService.scoreAndPersist(request);
    }

    /** Recent deploys, newest first, filterable by service, risk level, and date range. */
    @GetMapping
    public List<DeployResponse> list(
            @RequestParam(required = false) String service,
            @RequestParam(required = false) RiskLevel riskLevel,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return deployService.list(service, riskLevel, from, to);
    }

    @GetMapping("/{id}")
    public DeployResponse get(@PathVariable Long id) {
        return deployService.get(id);
    }

    /** Record what actually happened (shipped / rolled back, optional incident). */
    @PostMapping("/{id}/outcome")
    public DeployResponse outcome(@PathVariable Long id, @Valid @RequestBody OutcomeRequest request) {
        return deployService.recordOutcome(id, request);
    }
}
