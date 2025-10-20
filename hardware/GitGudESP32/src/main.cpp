#include <Arduino.h>
#include <WiFiManager.h>
#include <HTTPRequestHandler.h>
#include <cstdlib> // For rand() and srand()
#include <ctime>   // For time()

// WiFi credentials
const char* ssid = "MonkataNet"; //TODO: Change for the presentation
const char* password = "parolanasimozanet"; //TODO: Change for the presentation

// Server URL
const char* serverUrl = "https://bc7lmt4t-3000.euw.devtunnels.ms/api/esp32/info"; //TODO: FOrward a port

//id for device
const char* deviceId = "esp32_device_001";

// Create instances
WiFiManager wifiManager(ssid, password);
HTTPRequestHandler httpHandler(serverUrl);

void setup() {
  Serial.begin(115200);
  
  delay(1000);
  
  // Connect to WiFi
  wifiManager.connect();
}

void loop() {
  // Check WiFi connection
  if (wifiManager.isConnected()) {
    
    //Simulate data
    //Random seed
    srand(time(0));

    int volts = 24 + (rand() % 5);

    delay(1000); //Delay before requests
    
    //POST Request with JSON
    String jsonPayload = "{\"id\":\"" + String(deviceId) + "\",\"volts\":" + volts + "}";
    httpHandler.sendPostRequest(jsonPayload);
    
  } else {
    Serial.println("WiFi disconnected");
  }

  delay(3000); // Wait 5 seconds before next request
}
