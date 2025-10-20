#include "WiFiManager.h"

WiFiManager::WiFiManager(const char* ssid, const char* password) {
    _ssid = ssid;
    _password = password;
}

void WiFiManager::connect() {
    Serial.println();
    Serial.print("Connecting to WiFi");
    WiFi.begin(_ssid, _password);
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
}

bool WiFiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

String WiFiManager::getIPAddress() {
    return WiFi.localIP().toString();
}
