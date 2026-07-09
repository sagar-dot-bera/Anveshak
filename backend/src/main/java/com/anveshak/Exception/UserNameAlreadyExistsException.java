package com.anveshak.Exception;

public class UserNameAlreadyExistsException extends RuntimeException {
    public UserNameAlreadyExistsException(String username) {
        super("Username '" + username + "' is already taken");
    }
}
