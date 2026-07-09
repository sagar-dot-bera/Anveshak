package com.anveshak.Exception;

public class GoogleIdTokenNotValidException extends RuntimeException {
    public GoogleIdTokenNotValidException(String idToken) {
        super("google_id_token is not valid: " + idToken);
    }

}
