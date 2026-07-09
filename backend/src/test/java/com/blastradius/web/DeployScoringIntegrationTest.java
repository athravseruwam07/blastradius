package com.blastradius.web;

import com.blastradius.domain.MonitoredService;
import com.blastradius.repository.DeployRepository;
import com.blastradius.repository.IncidentRepository;
import com.blastradius.repository.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack integration test: HTTP → controller → scoring engine → JPA → response.
 * Uses an in-memory H2 database in PostgreSQL compatibility mode.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DeployScoringIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private DeployRepository deployRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @BeforeEach
    void setUp() {
        incidentRepository.deleteAll();
        deployRepository.deleteAll();
        serviceRepository.deleteAll();
        serviceRepository.save(new MonitoredService(
                "payment-service", 10, List.of("/payment/", "/billing/")));
    }

    @Test
    void scoringADeployReturnsComputedScoreAndBreakdown() throws Exception {
        String payload = """
                {
                  "serviceName": "payment-service",
                  "diffLinesChanged": 900,
                  "prodLinesChanged": 850,
                  "testLinesChanged": 50,
                  "changedPaths": ["/payment/gateway/Charge.java", "src/util/Format.java"],
                  "timestamp": "2026-07-10T17:30:00"
                }
                """;

        mockMvc.perform(post("/api/deploys/score")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.riskScore", notNullValue()))
                .andExpect(jsonPath("$.riskScore", greaterThan(0)))
                .andExpect(jsonPath("$.riskLevel", notNullValue()))
                .andExpect(jsonPath("$.breakdown", hasSize(6)))
                .andExpect(jsonPath("$.breakdown[0].factor", notNullValue()))
                .andExpect(jsonPath("$.serviceName").value("payment-service"));
    }

    @Test
    void scoredDeployIsPersistedAndRetrievable() throws Exception {
        String payload = """
                {
                  "serviceName": "payment-service",
                  "diffLinesChanged": 300,
                  "prodLinesChanged": 200,
                  "testLinesChanged": 100,
                  "changedPaths": ["src/main/java/notes/Note.java"],
                  "timestamp": "2026-07-07T10:00:00"
                }
                """;

        String body = mockMvc.perform(post("/api/deploys/score")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long id = com.jayway.jsonpath.JsonPath.parse(body).read("$.id", Long.class);

        mockMvc.perform(get("/api/deploys/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.breakdown", hasSize(6)))
                .andExpect(jsonPath("$.status").value("PENDING"));

        mockMvc.perform(get("/api/deploys"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void unknownServiceReturns404() throws Exception {
        String payload = """
                {
                  "serviceName": "no-such-service",
                  "diffLinesChanged": 10,
                  "prodLinesChanged": 10,
                  "testLinesChanged": 0,
                  "changedPaths": []
                }
                """;

        mockMvc.perform(post("/api/deploys/score")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNotFound());
    }

    @Test
    void outcomeEndpointRecordsRollbackAndLinkedIncident() throws Exception {
        String payload = """
                {
                  "serviceName": "payment-service",
                  "diffLinesChanged": 500,
                  "prodLinesChanged": 500,
                  "testLinesChanged": 0,
                  "changedPaths": ["/payment/Charge.java"],
                  "timestamp": "2026-07-10T17:30:00"
                }
                """;

        String body = mockMvc.perform(post("/api/deploys/score")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andReturn().getResponse().getContentAsString();
        long id = com.jayway.jsonpath.JsonPath.parse(body).read("$.id", Long.class);

        mockMvc.perform(post("/api/deploys/" + id + "/outcome")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "ROLLED_BACK",
                                  "incidentSeverity": "HIGH",
                                  "incidentDescription": "Charge failures spiked after deploy"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ROLLED_BACK"));

        mockMvc.perform(get("/api/incidents").param("service", "payment-service"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].linkedDeployId").value(id));
    }
}
