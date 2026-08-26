package com.anveshak.model;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

import org.checkerframework.checker.units.qual.A;
import org.hibernate.annotations.ColumnDefault;

import com.anveshak.DTOs.RegisterRequest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @NotBlank
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @NotBlank
    @Column(name = "username", nullable = false)
    private String username;

    @NotBlank
    @Size(max = 255)
    @Column(name = "email", nullable = false)
    private String email;

    @NotNull
    @ColumnDefault("false")
    @Column(name = "email_verified")
    private Boolean isEmailVerified;

    @NotNull
    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("now()")
    @Column(name = "updated_at ", nullable = false)
    private Instant updatedAt;

    public User(RegisterRequest registerRequest) {
        firstName = registerRequest.firstName();
        lastName = registerRequest.lastName();
        email = registerRequest.email();
        username = registerRequest.username();
        isEmailVerified = false;
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    public User(String firstName, String lastName, String username, String email, boolean isVerified) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.isEmailVerified = isVerified;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

}
