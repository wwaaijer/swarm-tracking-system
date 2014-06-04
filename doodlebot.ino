#include <Servo.h>

Servo myservo;

int EnablePinL = 3;
int EnablePinR = 11;
int ControlPinL1 = 2; 
int ControlPinL2 = 7;
int ControlPinR1 = 12;
int ControlPinR2 = A3;

int counter1 = 0;
char SpeedMotorL = 0;
char SpeedMotorR = 0;
byte DataIn[5];
unsigned int Write = 0;
unsigned int TimeToDrive = 0;
unsigned long prevmillis;

void Serial (unsigned int Write, char SpeedMotorL, char SpeedMotorR, unsigned int TimeToDrive){
	// this function is used to control the Doodle Bot with commands received from the Serial communication
  if (Write == 0){			// Here we check if the doodle bot has not received the command to write 

    myservo.write(45);     //If not then he will put his servo in the level position

  } 
  else {					// If he has then he will put his servo in writing position and notify the commander he is writing 

    myservo.write(90);
    Serial.println("I am writing");	//handy for debugging
    delay(100);						// this delay is here so that the servo is down before the motors start turning

  }

  if (SpeedMotorL > 0){ 		// here we check for the motor commands if its higher than zero the motor will start to turn forward in the speed given

    digitalWrite(ControlPinL1, HIGH);
    digitalWrite(ControlPinL2, LOW);
    analogWrite(EnablePinL, SpeedMotorL*2);
    Serial.print(SpeedMotorL*2);
    Serial.println("My left motor is turning");

  } 
  else if (SpeedMotorL == 0){	// if its zero the motor does not turn

    digitalWrite(ControlPinL1, LOW);
    digitalWrite(ControlPinL2, LOW);
    digitalWrite(EnablePinL, LOW);
    Serial.println("My left motor is stopped");

  } 
  else if (SpeedMotorL < 0){	// if lower then zero the motor will turn backward with the speed given

    digitalWrite(ControlPinL1, LOW);
    digitalWrite(ControlPinL2, HIGH);
    analogWrite(EnablePinL, SpeedMotorL*-2);
    Serial.print((SpeedMotorL*-2));
    Serial.println("My left motor is reversing");

  } 

  if (SpeedMotorR > 0){			// idem

    digitalWrite(ControlPinR1, HIGH);
    digitalWrite(ControlPinR2, LOW);
    analogWrite(EnablePinR, (SpeedMotorR*2) );
    Serial.print(SpeedMotorR*2);
    Serial.println("My right motor is turning");

  } 
  else if (SpeedMotorR == 0){	// idem

    digitalWrite(ControlPinR1, LOW);
    digitalWrite(ControlPinR2, LOW);
    digitalWrite(EnablePinR, LOW);
    Serial.println("My right motor is stopped");

  } 
  else if (SpeedMotorR < 0){	// idem

    digitalWrite(ControlPinR1, LOW);
    digitalWrite(ControlPinR2, HIGH);
    analogWrite(EnablePinR, (SpeedMotorR*-2) );
    Serial.print((SpeedMotorR*-2));
    Serial.println("My right motor is reversing");

  } 

  Serial.println(TimeToDrive);	//This is for debugging sake to show how long in ms the operation will continue 

  prevmillis = millis();

  while(millis() <= (prevmillis+TimeToDrive)){	//when this while checks the time has been completed

    if (Serial.available()){					// during the while the bot will check for the STOP command

      DataIn[counter1++] = Serial.read();
      Serial.print("byte ");
      Serial.println(counter1);

      if (counter1 >= 4){
        counter1 = 0;
        if (DataIn[0] == 'S') {
          if (DataIn[1] == 'T') {
            if (DataIn[2] == 'O') {
              if (DataIn[3] == 'P') {
                Serial.println("I am stopping current operations");
                break;
              }
            }
          }
        }
      }
    }
  }

  Serial.println("My current tasks have been comlpeted");

  digitalWrite(EnablePinL, LOW);			// reset
  digitalWrite(EnablePinR, LOW);
  digitalWrite(ControlPinL1, LOW);
  digitalWrite(ControlPinR1, LOW);
  digitalWrite(ControlPinL2, LOW);
  digitalWrite(ControlPinR2, LOW);
  
  delay(100);
  
  myservo.write(45);
  
  delay(500);
}

void setup (){					// during setup the bot attaches the servo starts the serial interface an resets everything

  myservo.attach(9);

  Serial.begin(115200);

  pinMode(EnablePinL, OUTPUT);
  pinMode(EnablePinR, OUTPUT);
  pinMode(ControlPinL1, OUTPUT);
  pinMode(ControlPinL2, OUTPUT);
  pinMode(ControlPinR1, OUTPUT);
  pinMode(ControlPinR2, OUTPUT);

  myservo.write(45);
  digitalWrite(EnablePinL, LOW);
  digitalWrite(EnablePinR, LOW);
  digitalWrite(ControlPinL1, LOW);
  digitalWrite(ControlPinR1, LOW);
  digitalWrite(ControlPinL2, LOW);
  digitalWrite(ControlPinR2, LOW);
}

void loop (){

  if (Serial.available() > 0){	// here the bot will check for commands whenever it received 5 bytes it will start its Serial function
    DataIn[counter1++] = Serial.read();
    Serial.print("byte ");
    Serial.print(counter1);
    Serial.println(" value: ");
    Serial.println(/*(unsigned int)*/DataIn[counter1-1]);
  }

  if (counter1 >= 5){
    counter1 = 0;
    SpeedMotorL = DataIn[0];
    SpeedMotorR = DataIn[1];
    TimeToDrive = DataIn[2];
    TimeToDrive <<= 8;
    TimeToDrive += DataIn[3];
    Write = DataIn[4];
    Serial(Write,SpeedMotorL,SpeedMotorR,TimeToDrive);
  }

}

