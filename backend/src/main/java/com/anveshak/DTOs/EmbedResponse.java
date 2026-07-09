package com.anveshak.DTOs;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record EmbedResponse(
        @JsonProperty("embedding") List<Float> embedding,

        @JsonProperty("dimension") int dimension) {

}
