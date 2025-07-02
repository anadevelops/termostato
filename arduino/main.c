#include <LiquidCrystal.h>

// Definindo os pinos do LCD
#define LCD_RS 11
#define LCD_E  10
#define LCD_D4 3
#define LCD_D5 4
#define LCD_D6 7
#define LCD_D7 8

// Definindo o pino do sensor
#define SENSOR_PIN A4

// Pinos de alimentação
#define LED_VERDE 6
#define LED_VERMELHO 5

// Botão
#define BOTAO 12

// Inicializa o objeto do LCD
LiquidCrystal lcd(LCD_RS, LCD_E, LCD_D4, LCD_D5, LCD_D6, LCD_D7);

// Variável de estado do botão
bool botaoToggled = false;
bool estadoAnteriorBotao = HIGH;

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);

  lcd.setCursor(0, 0);
  lcd.print("Temp Reader");
  delay(1000);
  lcd.clear();

  pinMode(LED_VERMELHO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(BOTAO, INPUT_PULLUP);
}

void loop() {
  // Leitura do botão com detecção de borda
  bool estadoAtualBotao = digitalRead(BOTAO);

  if (estadoAnteriorBotao == HIGH && estadoAtualBotao == LOW) {
    botaoToggled = !botaoToggled;
    Serial.print("Botao Toggled: ");
    Serial.println(botaoToggled ? "TRUE" : "FALSE");
  }

  estadoAnteriorBotao = estadoAtualBotao;

  // Leitura do sensor de temperatura
  int sensorValue = analogRead(SENSOR_PIN);
  float voltage = sensorValue * (5.0 / 1024.0);
  float temperatureC = voltage * 10.0;

  Serial.print("Leitura Analogica: ");
  Serial.print(sensorValue);
  Serial.print(" | Tensão: ");
  Serial.print(voltage);
  Serial.print(" V | Temperatura: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  // Exibe temperatura na 1ª linha
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temp:");
  lcd.setCursor(6, 0);
  lcd.print(temperatureC);
  lcd.print(" C");

  // Exibe estado do botão na 2ª linha
  lcd.setCursor(0, 1);
  lcd.print("Tolerance: ");
  lcd.print(botaoToggled ? "Low " : "High");

  // LEDs conforme a temperatura
  int temperatureMax = botaoToggled ? 30 : 20;
  if (temperatureC >= temperatureMax) {
    digitalWrite(LED_VERMELHO, HIGH);
    digitalWrite(LED_VERDE, LOW);
  } else {
    digitalWrite(LED_VERMELHO, LOW);
    digitalWrite(LED_VERDE, HIGH);
  }

  delay(100);  // Delay leve para debounce e leitura
}
