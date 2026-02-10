package com.uniconnect.repository;

import com.uniconnect.model.OpportunityApplication;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface OpportunityApplicationRepository extends MongoRepository<OpportunityApplication, String> {
    Optional<OpportunityApplication> findByApplicantEmailAndOpportunityId(String applicantEmail, String opportunityId);
    List<OpportunityApplication> findByApplicantEmail(String applicantEmail);
    List<OpportunityApplication> findByOpportunityId(String opportunityId);
}
