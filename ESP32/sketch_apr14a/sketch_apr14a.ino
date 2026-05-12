#include <Servo.h>

Servo myServo;

int servoPin = 9;

void setup() {
  myServo.attach(servoPin);
}

void loop() {
  // يروح لأقصى جهة
  myServo.write(0);
  delay(500);

  // يرجع لأقصى جهة ثانية
  myServo.write(180);
  delay(500);
}