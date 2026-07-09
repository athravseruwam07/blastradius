package com.blastradius.repository;

import com.blastradius.domain.Deploy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeployRepository extends JpaRepository<Deploy, Long> {

    List<Deploy> findAllByOrderByTimestampDesc();

    List<Deploy> findByServiceNameOrderByTimestampDesc(String serviceName);
}
