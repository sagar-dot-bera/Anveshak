package com.anveshak.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class RestExceptionHandler {

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException exception) {
                HttpStatus status = HttpStatus.BAD_REQUEST;

                return ResponseEntity.status(status)
                                .body(Map.of("message", exception.getMessage(), "code", status.value()));
        }

        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException exception) {
                HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
                return ResponseEntity.status(status)
                                .body(Map.of("message", exception.getReason(), "code", status.value()));
        }
}
