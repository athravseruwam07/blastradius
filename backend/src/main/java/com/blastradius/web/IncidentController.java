package com.blastradius.web;

import com.blastradius.service.IncidentService;
import com.blastradius.web.dto.IncidentRequest;
import com.blastradius.web.dto.IncidentResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidentResponse create(@Valid @RequestBody IncidentRequest request) {
        return incidentService.create(request);
    }

    /** Incidents for one service, newest first — used by the per-service history view. */
    @GetMapping
    public List<IncidentResponse> list(@RequestParam String service) {
        return incidentService.listForService(service);
    }
}
