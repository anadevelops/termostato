#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

#define LED_VERDE D0 
#define LED_VERMELHO D2 

// Configurações de rede
const char* ssid = "Ana_Karen";
const char* password = "AnaKaren@25";

// Configurações do servidor
const char* serverAddress = "192.168.15.10";
const int serverPort = 8000;
const int deviceId = 1;

// Variáveis para os dados recebidos do servidor
int receivedTempDesejada;

void setup() {
  Serial.begin(9600);
  delay(10);

  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_VERMELHO, OUTPUT);

  digitalWrite(LED_VERDE, LOW);  
  digitalWrite(LED_VERMELHO, LOW);

  Serial.println();
  Serial.print("Conectando-se a ");
  Serial.print(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("Wi-Fi conectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Fórmula para obter o retorno correto de temperatura do sensor
  int sensorValue = analogRead(A0);
  float voltage = sensorValue * (5.0 / 1024.0); 
  float temperatureC = voltage * 10.0;

  Serial.print("Temperatura Lida: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  // --- Requisição GET para buscar a temperatura desejada do servidor ---
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    String getUrl = "http://" + String(serverAddress) + ":" + String(serverPort) + "/config/tempDesejada/" + String(deviceId);
    Serial.print("Buscando temperatura desejada em: ");
    Serial.println(getUrl);

    http.begin(client, getUrl);
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      Serial.print("GET Response Code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.print("GET Response Payload: ");
      Serial.println(payload);

      // Deserializa o JSON recebido
      const size_t capacity = JSON_OBJECT_SIZE(1) + 100;
      DynamicJsonDocument doc(capacity);

      DeserializationError error = deserializeJson(doc, payload);

      if (error) {
        Serial.print(F("deserializeJson() falhou: "));
        Serial.println(error.f_str());
      } else {
        receivedTempDesejada = doc["tempDesejada"]; 
        Serial.print("Temperatura Desejada recebida: ");
        Serial.println(receivedTempDesejada);

        if (temperatureC > receivedTempDesejada) {
          digitalWrite(LED_VERDE, HIGH);    
          digitalWrite(LED_VERMELHO, LOW); 
          Serial.println("Temperatura maior que a desejada! Esfriando.");
        } else if (temperatureC < receivedTempDesejada) {
          digitalWrite(LED_VERDE, LOW);   
          digitalWrite(LED_VERMELHO, HIGH);  
          Serial.println("Temperatura menor que a desejada! Esfriando.");
        } else {
          digitalWrite(LED_VERDE, LOW);
          digitalWrite(LED_VERMELHO, LOW); 
          Serial.println("Temperatura dentro da faixa desejada. LEDs desligados.");
        }
      }
    } else {
      Serial.print("Erro na requisição GET: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi não conectado. Não foi possível buscar configuracoes.");
  }

  // --- Envia a Temperatura Atual (PATCH) para o servidor ---
  if (WiFi.status() == WL_CONNECTED){
    WiFiClient client;
    HTTPClient http;

    String url = "http://" + String(serverAddress) + ":" + String(serverPort) + "/config/tempAtual/" + String(deviceId);
    Serial.print("Enviando PATCH para: ");
    Serial.println(url);

    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");

    String httpRequestData = "{\"tempAtual\": " + String(temperatureC) + "}";

    Serial.print("Payload PATCH: ");
    Serial.println(httpRequestData);

    int httpResponseCode = http.PATCH(httpRequestData);

    if (httpResponseCode > 0){
      Serial.print("PATCH Response Code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.print("Erro na requisição PATCH: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("Wi-Fi não conectado. Não foi possível enviar a temperatura atual.");
  }

  delay(5000);
}