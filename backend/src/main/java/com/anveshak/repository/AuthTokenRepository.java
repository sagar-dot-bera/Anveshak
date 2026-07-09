package com.anveshak.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anveshak.model.AuthToken;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken, UUID> {

    AuthToken findByTokenHash(String hashedToken);

    AuthToken findByTokenHashAndType(String hashedToken, String type);

}
