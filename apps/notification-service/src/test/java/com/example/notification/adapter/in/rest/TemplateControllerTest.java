package com.example.notification.adapter.in.rest;

import com.example.notification.application.result.TemplateResult;
import com.example.notification.application.service.TemplateService;
import com.example.notification.domain.exception.TemplateAlreadyExistsException;
import com.example.notification.domain.exception.TemplateNotFoundException;
import com.example.notification.domain.model.NotificationChannel;
import com.example.notification.domain.model.NotificationTemplate;
import com.example.notification.domain.model.TemplateType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TemplateController.class)
@DisplayName("TemplateController 슬라이스 테스트")
class TemplateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TemplateService templateService;

    @Test
    @DisplayName("GET /api/notifications/templates - 템플릿 목록 조회 성공")
    void getTemplates_returns200() throws Exception {
        NotificationTemplate template = NotificationTemplate.create(
                TemplateType.ORDER_PLACED, NotificationChannel.EMAIL,
                "Subject", "Body");

        given(templateService.getTemplates(any()))
                .willReturn(new PageImpl<>(List.of(template), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/notifications/templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type").value("ORDER_PLACED"))
                .andExpect(jsonPath("$.content[0].channel").value("EMAIL"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("POST /api/notifications/templates - 템플릿 생성 성공")
    void createTemplate_returns201() throws Exception {
        given(templateService.createTemplate(any()))
                .willReturn(new TemplateResult("template-1"));

        mockMvc.perform(post("/api/notifications/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"ORDER_PLACED\",\"channel\":\"EMAIL\"," +
                                "\"subject\":\"Order confirmed\",\"body\":\"Your order has been placed.\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.templateId").value("template-1"));
    }

    @Test
    @DisplayName("POST /api/notifications/templates - 중복 템플릿 생성 시 409")
    void createTemplate_duplicate_returns409() throws Exception {
        given(templateService.createTemplate(any()))
                .willThrow(new TemplateAlreadyExistsException("ORDER_PLACED", "EMAIL"));

        mockMvc.perform(post("/api/notifications/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"ORDER_PLACED\",\"channel\":\"EMAIL\"," +
                                "\"subject\":\"Subject\",\"body\":\"Body\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TEMPLATE_ALREADY_EXISTS"));
    }

    @Test
    @DisplayName("PUT /api/notifications/templates/{id} - 템플릿 수정 성공")
    void updateTemplate_returns200() throws Exception {
        given(templateService.updateTemplate(any()))
                .willReturn(new TemplateResult("template-1"));

        mockMvc.perform(put("/api/notifications/templates/template-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"subject\":\"Updated subject\",\"body\":\"Updated body\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.templateId").value("template-1"));
    }

    @Test
    @DisplayName("PUT /api/notifications/templates/{id} - 존재하지 않는 템플릿 수정 시 404")
    void updateTemplate_notFound_returns404() throws Exception {
        given(templateService.updateTemplate(any()))
                .willThrow(new TemplateNotFoundException("template-999"));

        mockMvc.perform(put("/api/notifications/templates/template-999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"subject\":\"Subject\",\"body\":\"Body\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TEMPLATE_NOT_FOUND"));
    }

    @Test
    @DisplayName("POST /api/notifications/templates - 필수 필드 누락 시 400")
    void createTemplate_missingField_returns400() throws Exception {
        mockMvc.perform(post("/api/notifications/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"ORDER_PLACED\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
