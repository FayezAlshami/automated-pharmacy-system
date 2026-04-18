/*
  ============================================================
  Smart Pharmacy ESP32 Controller - V2
  ============================================================
  الوظائف:
  1) استقبال رقم عملية من:
     - ESP32-CAM عبر UART
     - Serial Monitor يدويًا
  2) إرسال رقم العملية إلى السيرفر عبر WebSocket
  3) استقبال أمر صرف من السيرفر يحتوي أكثر من دواء (1 إلى 4)
  4) تنفيذ الصرف لكل دواء حسب:
     - cabinet_id
     - count
  5) تشغيل محرك الكبينة حتى يتحسس IR تحت الكبينة
  6) رجوع المحرك للخلف بزمن محدد
  7) بعد انتهاء جميع الأدوية، تشغيل خط السير
  8) عند وصول الدواء لنقطة التسليم، إرسال نجاح للسيرفر
  ============================================================
*/

#include <WiFi.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>

// تمييز نواة Arduino-ESP32: 2.x تستخدم ledcSetup+ledcAttachPin+ledcWrite(channel)،
// و3.x+ تستخدم ledcAttach+ledcWrite(pin)
#if __has_include(<esp_arduino_version.h>)
#include <esp_arduino_version.h>
#endif
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
#define ESP32_LEDC_API_V3 1
#endif

// ============================================================
// WiFi + WebSocket settings
// ============================================================
const char* WIFI_SSID     = "FayezAlshami";
const char* WIFI_PASSWORD = "00000000";

// عنوان السيرفر (لابتوبك) — نفس شبكة الـ WiFi مع الـ ESP. المنفذ = الباك اند (uvicorn / dev-all.sh).
// مهم: لا تستخدم عنوان الـ VPN (مثل 10.2.x) — خُذ IPv4 من: ipconfig → "Wireless LAN adapter Wi-Fi"
// محدّث حسب الشبكة الحالية:
const char* WS_HOST = "10.239.108.178";
const uint16_t WS_PORT = 8080;

// يجب أن يطابق مسار FastAPI في backend/main.py
const char* WS_PATH = "/ws/esp32";

// ============================================================
// UART from ESP32-CAM
// ============================================================
// ESP32-CAM TX -> ESP32 RX2(GPIO16)
HardwareSerial CamSerial(2);
const int CAM_UART_RX_PIN = 16;
const int CAM_UART_TX_PIN = 17; // غير مستخدم فعلياً الآن

// ============================================================
// نظام النتائج
// ============================================================
const int RESULT_SUCCESS        = 210;
const int RESULT_TIMEOUT        = 211;
const int RESULT_MOTOR_FAIL     = 212;
const int RESULT_SENSOR_FAIL    = 213;
const int RESULT_JAM            = 214;
const int RESULT_INVALID_CAB    = 215;
const int RESULT_BUSY           = 216;
const int RESULT_UART_ERROR     = 217;
const int RESULT_SERVER_ERROR   = 218;
const int RESULT_CONVEYOR_FAIL  = 219;

// ============================================================
// الحساسات
// ============================================================
// إذا IR عندك يتحسس ويعطي LOW -> اتركها LOW
// إذا اكتشفت أنه بالعكس، بدّلها إلى HIGH
const int IR_ACTIVE_STATE = LOW;

// ============================================================
// تعريف محرك الكبينة
// ============================================================
// cabinet_id = الرقم المنطقي القادم من السيرفر
// in1/in2 = اتجاه المحرك
// enPin = PWM للتحكم بالسرعة
// irPin = حساس تحت الكبينة
// reverseTimeMs = زمن الرجوع للخلف بعد إسقاط كل عبوة واحدة
// speedForward / speedReverse من 0 إلى 255
struct CabinetMotor {
  int cabinetId;
  int in1Pin;
  int in2Pin;
  int enPin;
  int pwmChannel; // Arduino 2.x: قناة PWM — Arduino 3.x+: غير مستخدم (PWM عبر enPin)
  int irPin;
  int speedForward;
  int speedReverse;
  unsigned long reverseTimeMs;
};

// ============================================================
// تعريف 4 كبائن
// ============================================================
// هذه pins مثال منظم، ويمكنك تعديلها حسب توصيلك الفعلي.
// ملاحظة: بعض أرجل ESP32 حساسة وقت الإقلاع مثل 2 و 12 و 15.
// إذا ظهرت مشاكل boot لاحقًا، انقلها إلى أرجل أخرى.
CabinetMotor cabinets[4] = {
  // cabinetId, in1, in2, en, pwmCh, ir, speedF, speedR, reverseMs
  {1, 25, 26, 27, 0, 34, 180, 140, 450},
  {2, 14, 13, 12, 1, 35, 180, 140, 450},
  {3, 32, 33, 21, 2, 36, 180, 140, 450},
  {4, 18, 19, 22, 3, 39, 180, 140, 450}
};

// ============================================================
// تعريف محرك خط السير
// ============================================================
// هذا المحرك عبر L298N ثانية
const int CONVEYOR_IN1_PIN      = 23;
const int CONVEYOR_IN2_PIN      = 5;
const int CONVEYOR_EN_PIN       = 4;
#if !defined(ESP32_LEDC_API_V3)
const int CONVEYOR_PWM_CHANNEL  = 4;
#endif
const int CONVEYOR_END_IR_PIN   = 15;

// سرعة خط السير
int conveyorSpeed = 170;

// ============================================================
// الأزمنة المهمة
// ============================================================

// أقصى زمن يسمح لمحرك الكبينة أن يبقى للأمام حتى يسقط دواء
// إذا لم يتحسس IR خلاله -> فشل
unsigned long cabinetDropTimeoutMs = 5000;

// تأخير بسيط بعد سقوط الدواء
unsigned long cabinetSettleDelayMs = 200;

// أقصى زمن لخط السير حتى يصل الدواء إلى نقطة التسليم
unsigned long conveyorTimeoutMs = 8000;

// ============================================================
// هيكل عنصر صرف
// ============================================================
struct DispenseItem {
  int cabinetId;
  int count;
};

// أقصى عدد أدوية في الأمر الواحد
const int MAX_ITEMS = 4;

// ============================================================
// WebSocket client
// ============================================================
WebSocketsClient webSocket;

// ============================================================
// حالة النظام
// ============================================================
bool systemBusy = false;
int currentJobId = -1;

// buffers للإدخال من UART أو المونيتور
String camBuffer = "";
String pcBuffer  = "";

// queue بسيطة لأمر الصرف الحالي
DispenseItem currentItems[MAX_ITEMS];
int currentItemsCount = 0;

// ============================================================
// دوال مساعدة
// ============================================================

bool isDigitsOnly(const String &s) {
  if (s.length() == 0) return false;
  for (size_t i = 0; i < s.length(); i++) {
    if (!isDigit(s[i])) return false;
  }
  return true;
}

bool isIrTriggered(int pin) {
  return digitalRead(pin) == IR_ACTIVE_STATE;
}

void stopMotorRaw(int in1, int in2, int pwmPin) {
  digitalWrite(in1, LOW);
  digitalWrite(in2, LOW);
  ledcWrite(pwmPin, 0);
}

void runMotorForwardRaw(int in1, int in2, int pwmPin, int speedValue) {
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
  ledcWrite(pwmPin, speedValue);
}

void runMotorBackwardRaw(int in1, int in2, int pwmPin, int speedValue) {
  digitalWrite(in1, LOW);
  digitalWrite(in2, HIGH);
  ledcWrite(pwmPin, speedValue);
}

CabinetMotor* findCabinetById(int cabinetId) {
  for (int i = 0; i < 4; i++) {
    if (cabinets[i].cabinetId == cabinetId) return &cabinets[i];
  }
  return nullptr;
}

// ============================================================
// دوال إرسال رسائل WebSocket
// ============================================================

void sendJsonMessage(JsonDocument &doc) {
  String out;
  serializeJson(doc, out);
  webSocket.sendTXT(out);
  Serial.println("WS SEND:");
  Serial.println(out);
}

void sendQrOperationToServer(int orderId) {
  StaticJsonDocument<192> doc;
  doc["type"] = "qr_operation";
  doc["order_id"] = orderId;
  sendJsonMessage(doc);
}

/** نفس المسار عبر operation_id (مثل OP-22035 من QR الطبيب) */
void sendQrOperationToServerByOperationId(const String& operationId) {
  StaticJsonDocument<384> doc;
  doc["type"] = "qr_operation";
  doc["operation_id"] = operationId;
  sendJsonMessage(doc);
}

static bool stringStartsWithOpPrefix(const String& s) {
  if (s.length() < 4) return false;
  char c0 = s.charAt(0);
  char c1 = s.charAt(1);
  char c2 = s.charAt(2);
  return (c0 == 'O' || c0 == 'o') && (c1 == 'P' || c1 == 'p') && c2 == '-';
}

void sendBusyToServer() {
  StaticJsonDocument<128> doc;
  doc["type"] = "device_status";
  doc["result_code"] = RESULT_BUSY;
  doc["message"] = "controller_busy";
  sendJsonMessage(doc);
}

void sendDispenseResultToServer(int jobId, int resultCode, const char* message) {
  StaticJsonDocument<192> doc;
  doc["type"] = "dispense_result";
  doc["job_id"] = jobId;
  doc["result_code"] = resultCode;
  doc["message"] = message;
  sendJsonMessage(doc);
}

void sendProgressToServer(int jobId, const char* step, int cabinetId, int remaining) {
  StaticJsonDocument<192> doc;
  doc["type"] = "dispense_progress";
  doc["job_id"] = jobId;
  doc["step"] = step;
  doc["cabinet_id"] = cabinetId;
  doc["remaining"] = remaining;
  sendJsonMessage(doc);
}

// ============================================================
// WiFi
// ============================================================

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi connected, IP: ");
  Serial.println(WiFi.localIP());
}

// ============================================================
// WebSocket events
// ============================================================

void parseIncomingCommand(const String &payload);

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected");
      break;

    case WStype_CONNECTED:
      Serial.print("[WS] Connected to: ");
      Serial.println((char*)payload);

      // رسالة تعريف أولية للجهاز
      {
        StaticJsonDocument<128> doc;
        doc["type"] = "device_hello";
        doc["device"] = "esp32_pharmacy_controller";
        sendJsonMessage(doc);
      }
      break;

    case WStype_TEXT:
      Serial.println("[WS] Text received:");
      Serial.println((char*)payload);
      parseIncomingCommand(String((char*)payload));
      break;

    default:
      break;
  }
}

// ============================================================
// تهيئة PWM
// ============================================================

void setupPWM() {
  const int pwmFreq = 5000;
  const int pwmResolution = 8;

  for (int i = 0; i < 4; i++) {
#if defined(ESP32_LEDC_API_V3)
    ledcAttach((uint8_t)cabinets[i].enPin, (uint32_t)pwmFreq, (uint8_t)pwmResolution);
    ledcWrite((uint8_t)cabinets[i].enPin, 0);
#else
    ledcSetup(cabinets[i].pwmChannel, pwmFreq, pwmResolution);
    ledcAttachPin(cabinets[i].enPin, cabinets[i].pwmChannel);
    ledcWrite((uint8_t)cabinets[i].pwmChannel, 0);
#endif
  }

#if defined(ESP32_LEDC_API_V3)
  ledcAttach((uint8_t)CONVEYOR_EN_PIN, (uint32_t)pwmFreq, (uint8_t)pwmResolution);
  ledcWrite((uint8_t)CONVEYOR_EN_PIN, 0);
#else
  ledcSetup(CONVEYOR_PWM_CHANNEL, pwmFreq, pwmResolution);
  ledcAttachPin(CONVEYOR_EN_PIN, CONVEYOR_PWM_CHANNEL);
  ledcWrite((uint8_t)CONVEYOR_PWM_CHANNEL, 0);
#endif
}

// ============================================================
// تهيئة الأرجل
// ============================================================

void setupPins() {
  for (int i = 0; i < 4; i++) {
    pinMode(cabinets[i].in1Pin, OUTPUT);
    pinMode(cabinets[i].in2Pin, OUTPUT);
    pinMode(cabinets[i].irPin, INPUT);

    digitalWrite(cabinets[i].in1Pin, LOW);
    digitalWrite(cabinets[i].in2Pin, LOW);
  }

  pinMode(CONVEYOR_IN1_PIN, OUTPUT);
  pinMode(CONVEYOR_IN2_PIN, OUTPUT);
  pinMode(CONVEYOR_END_IR_PIN, INPUT);

  digitalWrite(CONVEYOR_IN1_PIN, LOW);
  digitalWrite(CONVEYOR_IN2_PIN, LOW);
}

// ============================================================
// دوال المحركات
// ============================================================

void stopCabinetMotor(CabinetMotor &cab) {
  digitalWrite(cab.in1Pin, LOW);
  digitalWrite(cab.in2Pin, LOW);
#if defined(ESP32_LEDC_API_V3)
  ledcWrite((uint8_t)cab.enPin, 0);
#else
  ledcWrite((uint8_t)cab.pwmChannel, 0);
#endif
}

void runCabinetForward(CabinetMotor &cab) {
  digitalWrite(cab.in1Pin, HIGH);
  digitalWrite(cab.in2Pin, LOW);
#if defined(ESP32_LEDC_API_V3)
  ledcWrite((uint8_t)cab.enPin, (uint32_t)cab.speedForward);
#else
  ledcWrite((uint8_t)cab.pwmChannel, (uint32_t)cab.speedForward);
#endif
}

void runCabinetBackward(CabinetMotor &cab) {
  digitalWrite(cab.in1Pin, LOW);
  digitalWrite(cab.in2Pin, HIGH);
#if defined(ESP32_LEDC_API_V3)
  ledcWrite((uint8_t)cab.enPin, (uint32_t)cab.speedReverse);
#else
  ledcWrite((uint8_t)cab.pwmChannel, (uint32_t)cab.speedReverse);
#endif
}

void stopConveyor() {
  digitalWrite(CONVEYOR_IN1_PIN, LOW);
  digitalWrite(CONVEYOR_IN2_PIN, LOW);
#if defined(ESP32_LEDC_API_V3)
  ledcWrite((uint8_t)CONVEYOR_EN_PIN, 0);
#else
  ledcWrite((uint8_t)CONVEYOR_PWM_CHANNEL, 0);
#endif
}

void runConveyorForward() {
  digitalWrite(CONVEYOR_IN1_PIN, HIGH);
  digitalWrite(CONVEYOR_IN2_PIN, LOW);
#if defined(ESP32_LEDC_API_V3)
  ledcWrite((uint8_t)CONVEYOR_EN_PIN, (uint32_t)conveyorSpeed);
#else
  ledcWrite((uint8_t)CONVEYOR_PWM_CHANNEL, (uint32_t)conveyorSpeed);
#endif
}

// ============================================================
// منطق صرف عبوة واحدة من كبينة واحدة
// ============================================================

bool dispenseOneItemFromCabinet(CabinetMotor &cab) {
  // شغل المحرك للأمام حتى يتحسس IR تحت الكبينة
  runCabinetForward(cab);

  unsigned long startTime = millis();

  while (true) {
    if (isIrTriggered(cab.irPin)) {
      stopCabinetMotor(cab);
      delay(cabinetSettleDelayMs);

      // رجوع للخلف حتى يعود المكان الأصلي
      // هنا نستخدم زمن رجوع ثابت
      // عدل reverseTimeMs حسب الميكانيك الحقيقي
      runCabinetBackward(cab);
      delay(cab.reverseTimeMs);
      stopCabinetMotor(cab);

      return true;
    }

    if (millis() - startTime > cabinetDropTimeoutMs) {
      stopCabinetMotor(cab);
      return false;
    }

    delay(10);
  }
}

// ============================================================
// صرف count من كبينة معينة
// ============================================================

bool dispenseCountFromCabinet(int cabinetId, int count) {
  CabinetMotor* cab = findCabinetById(cabinetId);

  if (cab == nullptr) {
    Serial.println("Invalid cabinet_id received");
    return false;
  }

  int remaining = count;

  while (remaining > 0) {
    sendProgressToServer(currentJobId, "cabinet_start", cabinetId, remaining);

    bool ok = dispenseOneItemFromCabinet(*cab);
    if (!ok) {
      Serial.println("Cabinet dispense timeout/fail");
      return false;
    }

    remaining--;

    sendProgressToServer(currentJobId, "cabinet_done_one", cabinetId, remaining);

    delay(150);
  }

  return true;
}

// ============================================================
// تشغيل خط السير حتى الوصول لنهاية الخط
// ============================================================

bool runConveyorUntilDelivered() {
  runConveyorForward();

  unsigned long startTime = millis();

  while (true) {
    if (isIrTriggered(CONVEYOR_END_IR_PIN)) {
      stopConveyor();
      return true;
    }

    if (millis() - startTime > conveyorTimeoutMs) {
      stopConveyor();
      return false;
    }

    delay(10);
  }
}

// ============================================================
// تنفيذ Job كامل يحتوي 1 إلى 4 أدوية
// ============================================================

void executeDispenseJob() {
  if (systemBusy) {
    Serial.println("System already busy");
    sendBusyToServer();
    return;
  }

  if (currentJobId <= 0 || currentItemsCount <= 0) {
    Serial.println("No valid job loaded");
    return;
  }

  systemBusy = true;

  Serial.println("========== EXECUTE JOB ==========");
  Serial.print("job_id = ");
  Serial.println(currentJobId);

  for (int i = 0; i < currentItemsCount; i++) {
    Serial.print("Item #");
    Serial.print(i + 1);
    Serial.print(" -> cabinet_id=");
    Serial.print(currentItems[i].cabinetId);
    Serial.print(", count=");
    Serial.println(currentItems[i].count);
  }
  Serial.println("================================");

  // صرف كل دواء
  for (int i = 0; i < currentItemsCount; i++) {
    int cabinetId = currentItems[i].cabinetId;
    int count     = currentItems[i].count;

    bool ok = dispenseCountFromCabinet(cabinetId, count);
    if (!ok) {
      sendDispenseResultToServer(currentJobId, RESULT_TIMEOUT, "cabinet_timeout_or_sensor_fail");
      systemBusy = false;
      currentJobId = -1;
      currentItemsCount = 0;
      return;
    }
  }

  // بعد انتهاء كل الأدوية، شغل خط السير
  sendProgressToServer(currentJobId, "conveyor_start", 0, 0);

  bool conveyorOk = runConveyorUntilDelivered();
  if (!conveyorOk) {
    sendDispenseResultToServer(currentJobId, RESULT_CONVEYOR_FAIL, "conveyor_timeout");
    systemBusy = false;
    currentJobId = -1;
    currentItemsCount = 0;
    return;
  }

  sendProgressToServer(currentJobId, "delivery_done", 0, 0);

  // نجاح نهائي
  sendDispenseResultToServer(currentJobId, RESULT_SUCCESS, "dispense_success");

  systemBusy = false;
  currentJobId = -1;
  currentItemsCount = 0;
}

// ============================================================
// Parsing incoming WebSocket JSON
// ============================================================

void loadDispenseItemsFromJson(JsonDocument &doc) {
  currentItemsCount = 0;
  currentJobId = doc["job_id"] | -1;

  JsonArray items = doc["items"].as<JsonArray>();

  for (JsonObject item : items) {
    if (currentItemsCount >= MAX_ITEMS) break;

    int cabinetId = item["cabinet_id"] | 0;
    int count     = item["count"] | 0;

    if (cabinetId > 0 && count > 0) {
      currentItems[currentItemsCount].cabinetId = cabinetId;
      currentItems[currentItemsCount].count = count;
      currentItemsCount++;
    }
  }
}

void parseIncomingCommand(const String &payload) {
  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, payload);

  if (err) {
    Serial.print("JSON parse failed: ");
    Serial.println(err.c_str());
    return;
  }

  String type = doc["type"] | "";

  if (type == "dispense_command") {
    if (systemBusy) {
      sendBusyToServer();
      return;
    }

    loadDispenseItemsFromJson(doc);

    if (currentJobId <= 0 || currentItemsCount <= 0) {
      Serial.println("Invalid dispense_command payload");
      sendDispenseResultToServer(0, RESULT_SERVER_ERROR, "invalid_dispense_command");
      return;
    }

    executeDispenseJob();
  }
  else if (type == "qr_operation_response") {
    // ============================================================
    // رد السيرفر على طلب qr_operation (بعد التحقق من قاعدة البيانات)
    // ============================================================
    int respondedOrderId = doc["order_id"] | -1;

    bool accepted = false;
    if (doc["accepted"].is<bool>()) {
      accepted = doc["accepted"].as<bool>();
    } else if (doc["accepted"].is<int>()) {
      accepted = doc["accepted"].as<int>() != 0;
    }

    String message = doc["message"] | "unknown";

    Serial.println("================================");
    if (accepted) {
      Serial.println("Server Response: ACCEPTED");
    } else {
      Serial.println("Server Response: REJECTED");
    }
    Serial.print("Order ID: ");
    Serial.println(respondedOrderId);
    Serial.print("Message: ");
    Serial.println(message);
    Serial.println("================================");
  }
  else if (type == "cancel_command") {
    // لاحقًا يمكن تطويرها إلى إيقاف آمن أثناء التنفيذ
    Serial.println("Cancel command received (not fully implemented yet)");
  }
  else if (type == "noop") {
    Serial.println("No operation command received");
  }
  else {
    Serial.println("Unknown command type");
  }
}

// ============================================================
// استقبال من الكاميرا عبر UART
// ============================================================

void processIncomingValue(String value, const char* source) {
  value.trim();
  if (value.length() == 0) return;

  Serial.println("================================");
  Serial.print("Source: ");
  Serial.println(source);
  Serial.print("Raw Value: ");
  Serial.println(value);

  if (!webSocket.isConnected()) {
    Serial.println("WebSocket not connected");
    Serial.println("================================");
    return;
  }

  if (systemBusy) {
    sendBusyToServer();
    Serial.println("================================");
    return;
  }

  // 1) رقم order_id فقط (أرقام)
  if (isDigitsOnly(value)) {
    int orderId = value.toInt();
    if (orderId <= 0) {
      Serial.println("Rejected: invalid order_id");
      Serial.println("================================");
      return;
    }
    Serial.print("Accepted order_id: ");
    Serial.println(orderId);
    Serial.println("================================");
    sendQrOperationToServer(orderId);
    return;
  }

  // 2) رمز عملية من QR الطبيب مثل OP-22035
  if (stringStartsWithOpPrefix(value)) {
    Serial.print("Accepted operation_id: ");
    Serial.println(value);
    Serial.println("================================");
    sendQrOperationToServerByOperationId(value);
    return;
  }

  Serial.println("Rejected: use numeric order_id or OP-xxxxxx (from QR)");
  Serial.println("================================");
}

void readFromCameraUART() {
  while (CamSerial.available()) {
    char c = (char)CamSerial.read();

    if (c == '\n') {
      processIncomingValue(camBuffer, "ESP32-CAM UART");
      camBuffer = "";
    } else if (c != '\r') {
      camBuffer += c;
    }
  }
}

void readFromSerialMonitor() {
  while (Serial.available()) {
    char c = (char)Serial.read();

    if (c == '\n') {
      processIncomingValue(pcBuffer, "Serial Monitor");
      pcBuffer = "";
    } else if (c != '\r') {
      pcBuffer += c;
    }
  }
}

// ============================================================
// setup
// ============================================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("Smart Pharmacy ESP32 Controller V2");
  Serial.println("Starting...");

  // UART from ESP32-CAM
  CamSerial.begin(115200, SERIAL_8N1, CAM_UART_RX_PIN, CAM_UART_TX_PIN);

  setupPins();
  setupPWM();
  connectWiFi();

  // WebSocket
  webSocket.begin(WS_HOST, WS_PORT, WS_PATH);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(3000);

  Serial.println("Ready.");
  Serial.println("You can type order_id manually in Serial Monitor.");
}

// ============================================================
// loop
// ============================================================

void loop() {
  webSocket.loop();
  readFromCameraUART();
  readFromSerialMonitor();
}
