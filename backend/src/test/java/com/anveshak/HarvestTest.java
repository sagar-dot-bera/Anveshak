package com.anveshak;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestTemplate;

import com.anveshak.DTOs.HarvestResult;
import com.anveshak.client.EmbeddingServiceClient;
import com.anveshak.controller.HarvestController;
import com.anveshak.model.GlobalPaper;
import com.anveshak.repository.GlobalPaperRepository;
import com.anveshak.service.GlobalPaperService;
import com.anveshak.service.XMLParser;

@ExtendWith(MockitoExtension.class)
public class HarvestTest {

    @Mock
    GlobalPaperService mockGlobalPaperService;

    @Mock
    RestTemplate restTemplate;

    @Mock
    GlobalPaperRepository globalPaperRepository;

    @Mock
    EmbeddingServiceClient embeddingServiceClient;

    // ---- HarvestController: shared-secret guard ----

    @Test
    void shouldDisableEndpointWhenNoSecretConfigured() {
        HarvestController controller = new HarvestController(mockGlobalPaperService, "");

        assertEquals(HttpStatus.NOT_FOUND, controller.harvestArxivPapers("anything").getStatusCode());
        verifyNoInteractions(mockGlobalPaperService);
    }

    @Test
    void shouldRejectMissingOrWrongSecret() {
        HarvestController controller = new HarvestController(mockGlobalPaperService, "s3cret");

        assertEquals(HttpStatus.UNAUTHORIZED, controller.harvestArxivPapers(null).getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, controller.harvestArxivPapers("wrong").getStatusCode());
        verifyNoInteractions(mockGlobalPaperService);
    }

    @Test
    void shouldStartHarvestWithCorrectSecret() {
        HarvestController controller = new HarvestController(mockGlobalPaperService, "s3cret");
        when(mockGlobalPaperService.startHarvest()).thenReturn(true, false);

        assertEquals(HttpStatus.ACCEPTED, controller.harvestArxivPapers("s3cret").getStatusCode());
        assertEquals(HttpStatus.CONFLICT, controller.harvestArxivPapers("s3cret").getStatusCode());
    }

    // ---- GlobalPaperService.processPapers: dedup, final batch, end of list ----

    private static String record(String id) {
        return """
                <record>
                  <header><identifier>oai:arXiv.org:%1$s</identifier></header>
                  <metadata><arXiv>
                    <id>%1$s</id>
                    <title>Paper %1$s</title>
                    <abstract>Abstract %1$s</abstract>
                  </arXiv></metadata>
                </record>
                """.formatted(id);
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldSkipKnownPapersAndSaveFinalPartialBatch() throws Exception {
        String xml = "<OAI-PMH><ListRecords>"
                + record("2401.00001") + record("2401.00002") + record("2401.00002")
                + "<resumptionToken cursor=\"0\" completeListSize=\"3\"/>"
                + "</ListRecords></OAI-PMH>";

        when(globalPaperRepository.existsBySourceAndExternalId("Arxiv", "2401.00001")).thenReturn(true);
        when(globalPaperRepository.existsBySourceAndExternalId("Arxiv", "2401.00002")).thenReturn(false);
        when(embeddingServiceClient.getEmbedding(anyString())).thenReturn(new float[384]);

        GlobalPaperService service = new GlobalPaperService(new XMLParser(), restTemplate, globalPaperRepository,
                embeddingServiceClient);
        HarvestResult result = service.processPapers(
                new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

        // Already-stored and duplicate records are never embedded.
        verify(embeddingServiceClient, times(1)).getEmbedding(any());

        // A page with fewer than 100 new papers is still saved.
        ArgumentCaptor<List<GlobalPaper>> saved = ArgumentCaptor.forClass(List.class);
        verify(globalPaperRepository).saveAll(saved.capture());
        assertEquals(1, saved.getValue().size());
        assertEquals("2401.00002", saved.getValue().get(0).getExternalId());

        // An empty <resumptionToken/> means the list is complete.
        assertNull(result.resumptionToken());
    }
}
