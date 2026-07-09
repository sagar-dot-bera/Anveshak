package com.anveshak.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

import org.springframework.stereotype.Service;

import com.anveshak.Exception.GoogleIdTokenNotValidException;
import com.anveshak.config.GoogleProperties;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Service
public class GoogleTokenVerifier {

    GoogleProperties googleProperties;

    public GoogleTokenVerifier(GoogleProperties googleProperties) {
        this.googleProperties = googleProperties;
    }

    public GoogleIdToken.Payload verifyToken(String tokenId)
            throws GoogleIdTokenNotValidException, GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(List.of(googleProperties.clientId()))
                .build();

        GoogleIdToken idToken = verifier.verify(tokenId);
        if (idToken == null) {
            throw new GoogleIdTokenNotValidException(tokenId);
        }

        return idToken.getPayload();
    }

}
