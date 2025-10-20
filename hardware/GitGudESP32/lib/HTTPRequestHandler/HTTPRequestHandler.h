#ifndef HTTP_REQUEST_HANDLER_H
#define HTTP_REQUEST_HANDLER_H

#include <Arduino.h>
#include <HTTPClient.h>

class HTTPRequestHandler {
public:
    HTTPRequestHandler(const char* serverUrl);
    void sendGetRequest();
    void sendPostRequest(const String& jsonPayload);

private:
    const char* _serverUrl;
    void printResponse(int httpResponseCode, const String& response);
};

#endif
