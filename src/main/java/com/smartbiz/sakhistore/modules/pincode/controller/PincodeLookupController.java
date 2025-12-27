package com.smartbiz.sakhistore.modules.pincode.controller;

import org.apache.hc.core5.http.HttpStatus; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartbiz.sakhistore.modules.pincode.service.LivePincodeLookupService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pincode")
@RequiredArgsConstructor
public class PincodeLookupController {

        private final LivePincodeLookupService service;

		@GetMapping("/{pincode}")
        @Operation(
                summary = "Get live pincode details",
                responses = {
                        @ApiResponse(responseCode = "200", description = "Success"),
                        @ApiResponse(
                                responseCode = "503",
                                description = "India Post API failed",
                                content = @Content(mediaType = "application/json",
                                        schema = @Schema(example = "{\"message\":\"India Post API is not responding. Please try again later.\"}")
                                )
                        )
                }
        )
        public ResponseEntity<?> getPincode(@PathVariable String pincode) {
            try {
                return ResponseEntity.ok(service.getLiveDetails(pincode));
            } catch (Exception ex) {

                // DIRECT RESPONSE FROM CONTROLLER
                return ResponseEntity
                        .status(HttpStatus.SC_SERVICE_UNAVAILABLE)
                        .body(new ErrorMessage("India Post API is not responding. Please try again later."));
            }
        }

		
        // SIMPLE DTO FOR ERROR RESPONSE
        record ErrorMessage(String message) {}
}
