package com.anveshak.service;

import java.time.LocalDate;

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.springframework.stereotype.Service;

import com.anveshak.DTOs.GlobalPaperDTO;

@Service
public class XMLParser {

    public GlobalPaperDTO parseRecord(XMLStreamReader reader) throws XMLStreamException {

        GlobalPaperDTO paper = new GlobalPaperDTO();

        String forenames = null;
        String keyname = null;

        while (reader.hasNext()) {

            int event = reader.next();

            if (event == XMLStreamConstants.START_ELEMENT) {

                switch (reader.getLocalName()) {

                    case "id":
                        paper.setPaperId(reader.getElementText());
                        break;

                    case "created":
                        paper.setCreated(LocalDate.parse(reader.getElementText()));
                        break;

                    case "updated":
                        paper.setUpdated(LocalDate.parse(reader.getElementText()));
                        break;

                    case "title":
                        paper.setTitle(reader.getElementText().trim());
                        break;

                    case "abstract":
                        paper.setAbstractText(reader.getElementText().trim());
                        break;

                    case "categories":
                        paper.setCategories(reader.getElementText());
                        break;

                    case "license":
                        paper.setLicense(reader.getElementText());
                        break;

                    case "forenames":
                        forenames = reader.getElementText();
                        break;

                    case "keyname":
                        keyname = reader.getElementText();
                        break;
                }
            }

            if (event == XMLStreamConstants.END_ELEMENT) {

                if (reader.getLocalName().equals("author")) {
                    String name = forenames + " " + keyname + ",";
                    if (paper.getAuthors() == null) {
                        paper.setAuthors(name);
                    } else {
                        paper.setAuthors(paper.getAuthors() + forenames + " " + keyname + ",");
                    }

                    forenames = null;
                    keyname = null;
                    name = null;
                }

                if (reader.getLocalName().equals("record")) {
                    break;
                }
            }
        }

        return paper;
    }
}
