package com.blastradius.web;

import com.blastradius.repository.ServiceRepository;
import com.blastradius.web.dto.ServiceResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceRepository serviceRepository;

    public ServiceController(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    public List<ServiceResponse> list() {
        return serviceRepository.findAll().stream()
                .map(s -> new ServiceResponse(
                        s.getId(), s.getName(), s.getCriticalityWeight(), s.getSensitivePathPatterns()))
                .toList();
    }
}
