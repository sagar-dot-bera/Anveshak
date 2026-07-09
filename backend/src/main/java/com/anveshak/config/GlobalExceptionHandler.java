package com.anveshak.config;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.anveshak.DTOs.ErrorResponse;
import com.anveshak.Exception.CitationNotFoundException;
import com.anveshak.Exception.EmailAlreadyExistsException;
import com.anveshak.Exception.EmbeddingServiceException;
import com.anveshak.Exception.GoogleIdTokenNotValidException;
import com.anveshak.Exception.InvalidCredentialsException;
import com.anveshak.Exception.RefreshTokenNotFoundException;
import com.anveshak.Exception.ResearchCollectionNotFoundException;
import com.anveshak.Exception.ResearchPaperNotFoundException;
import com.anveshak.Exception.UserIdentityAlreadyExistsException;
import com.anveshak.Exception.UserNameAlreadyExistsException;
import com.anveshak.Exception.UserNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "User not found", ex.getMessage());
    }

    @ExceptionHandler(ResearchPaperNotFoundException.class)
    ResponseEntity<ErrorResponse> handleResearchPaperNotFound(ResearchPaperNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Research paper not found", ex.getMessage());
    }

    @ExceptionHandler(CitationNotFoundException.class)
    ResponseEntity<ErrorResponse> handleCitationNotFound(CitationNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Citation not found", ex.getMessage());
    }

    @ExceptionHandler(ResearchCollectionNotFoundException.class)
    ResponseEntity<ErrorResponse> handleResearchCollectionNotFound(ResearchCollectionNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Research collection not found", ex.getMessage());
    }

    @ExceptionHandler(RefreshTokenNotFoundException.class)
    ResponseEntity<ErrorResponse> handleRefreshTokenNotFound(RefreshTokenNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Refresh token not found", ex.getMessage());
    }

    @ExceptionHandler(UserNameAlreadyExistsException.class)
    ResponseEntity<ErrorResponse> handleUserNameAlreadyExists(UserNameAlreadyExistsException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, "Username already exists", ex.getMessage());
    }

    @ExceptionHandler(UserIdentityAlreadyExistsException.class)
    ResponseEntity<ErrorResponse> handleUserIdentityAlreadyExists(UserIdentityAlreadyExistsException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, "User identity already exists", ex.getMessage());
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    ResponseEntity<ErrorResponse> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, "Email already exists", ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage());
    }

    @ExceptionHandler(GoogleIdTokenNotValidException.class)
    ResponseEntity<ErrorResponse> handleInvalidGoogleToken(GoogleIdTokenNotValidException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Invalid Google token", ex.getMessage());
    }

    @ExceptionHandler(EmbeddingServiceException.class)
    ResponseEntity<ErrorResponse> handleEmbeddingService(EmbeddingServiceException ex) {
        return buildErrorResponse(HttpStatus.SERVICE_UNAVAILABLE, "Embedding service unavailable", ex.getMessage());
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(HttpStatus status, String error, String message) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(status.value(), error, message, Instant.now()));
    }
}
