package com.blastradius.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Validates the X-Api-Key header on state-changing requests. Reads (GET) stay
 * open so the dashboard doesn't need to embed a secret in the browser bundle;
 * writes (POST) require the key, since those are what CI and the manual
 * submit form use, both of which can hold a real secret.
 */
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Api-Key";

    private final String expectedKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ApiKeyAuthFilter(String expectedKey) {
        this.expectedKey = expectedKey;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Reads are public; only enforce the key on state-changing requests. Without
        // this check the filter blocks everything unconditionally before
        // authorizeHttpRequests' GET-permitAll rule ever gets a chance to apply.
        //
        // OPTIONS must always pass through too: any fetch() that sets a header
        // (this app sends Content-Type: application/json even on GETs) makes the
        // browser send a CORS preflight OPTIONS request first, which never carries
        // the API key. Rejecting it here with a 401 produces a response with no
        // Access-Control-Allow-Origin header, which the browser reports as a CORS
        // failure — masking the real cause ("preflight got a 401") behind a generic
        // "blocked by CORS policy" / "Failed to fetch" error.
        String method = request.getMethod();
        if ("GET".equalsIgnoreCase(method) || "HEAD".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String providedKey = request.getHeader(HEADER);
        if (providedKey != null && providedKey.equals(expectedKey)) {
            // Authenticated for this request only; no session, no state kept.
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("api-client", null, List.of()));
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(),
                Map.of("error", "Missing or invalid " + HEADER + " header"));
    }
}
