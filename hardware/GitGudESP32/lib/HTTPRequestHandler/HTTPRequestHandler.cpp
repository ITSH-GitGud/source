#include "HTTPRequestHandler.h"

HTTPRequestHandler::HTTPRequestHandler(const char* serverUrl) {
    _serverUrl = serverUrl;
}

void HTTPRequestHandler::sendGetRequest() {
    HTTPClient http;
    
    Serial.println("\n--- Sending GET Request ---");
    
    // Specify the URL
    http.begin(_serverUrl);
    
    // Optional: Add headers
    http.addHeader("Content-Type", "application/json");
    
    // Send GET request
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
        String response = http.getString();
        printResponse(httpResponseCode, response);
    } else {
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
    }
    
    // Free resources
    http.end();
}

void HTTPRequestHandler::sendPostRequest(const String& jsonPayload) {
    HTTPClient http;
    
    Serial.println("\n--- Sending POST Request ---");
    
    // Specify the URL
    http.begin(_serverUrl);
    
    // Add headers
    http.addHeader("Content-Type", "application/json");
    
    // Send POST request
    int httpResponseCode = http.POST(jsonPayload);
    
    Serial.print("Payload: ");
    Serial.println(String(httpResponseCode));
    if (httpResponseCode > 0) {
        String response = http.getString();
        printResponse(httpResponseCode, response);
    } else {
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
    }
    
    // Free resources
    http.end();
}

void HTTPRequestHandler::printResponse(int httpResponseCode, const String& response) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.println("Response:");
    Serial.println(response);
}
