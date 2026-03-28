package com.example.notification.adapter.in.rest;

import com.example.notification.adapter.in.rest.dto.request.CreateTemplateRequest;
import com.example.notification.adapter.in.rest.dto.request.UpdateTemplateRequest;
import com.example.notification.adapter.in.rest.dto.response.TemplateIdResponse;
import com.example.notification.adapter.in.rest.dto.response.TemplateListResponse;
import com.example.notification.application.command.CreateTemplateCommand;
import com.example.notification.application.command.UpdateTemplateCommand;
import com.example.notification.application.result.TemplateResult;
import com.example.notification.application.service.TemplateService;
import com.example.notification.domain.model.NotificationChannel;
import com.example.notification.domain.model.NotificationTemplate;
import com.example.notification.domain.model.TemplateType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications/templates")
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<TemplateListResponse> getTemplates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<NotificationTemplate> templates = templateService.getTemplates(PageRequest.of(page, size));
        return ResponseEntity.ok(TemplateListResponse.from(templates));
    }

    @PostMapping
    public ResponseEntity<TemplateIdResponse> createTemplate(
            @Valid @RequestBody CreateTemplateRequest request
    ) {
        CreateTemplateCommand command = new CreateTemplateCommand(
                TemplateType.valueOf(request.type()),
                NotificationChannel.valueOf(request.channel()),
                request.subject(),
                request.body()
        );
        TemplateResult result = templateService.createTemplate(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(TemplateIdResponse.from(result));
    }

    @PutMapping("/{templateId}")
    public ResponseEntity<TemplateIdResponse> updateTemplate(
            @PathVariable String templateId,
            @Valid @RequestBody UpdateTemplateRequest request
    ) {
        UpdateTemplateCommand command = new UpdateTemplateCommand(
                templateId, request.subject(), request.body());
        TemplateResult result = templateService.updateTemplate(command);
        return ResponseEntity.ok(TemplateIdResponse.from(result));
    }
}
