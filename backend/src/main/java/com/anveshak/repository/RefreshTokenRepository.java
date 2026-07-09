package com.anveshak.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anveshak.model.RefreshToken;
import com.anveshak.model.User;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    boolean existsByTokenAndRevokedFalse(String refreshToken);

    Optional<RefreshToken> findByTokenAndRevokedFalse(String refreshToken);

    List<RefreshToken> findAllByUserAndRevokedFalse(User user);

    Optional<RefreshToken> findByIdAndUser(UUID id, User user);

    void deleteAllByUser(User user);

}


