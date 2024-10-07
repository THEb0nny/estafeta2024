const MASTER_B_RAW_REF_LCS = 2372; // Чёрный для левого датчика
const MASTER_B_RAW_REF_RCS = 2126; // Чёрный для правого датчика
const MASTER_W_RAW_REF_LCS = 1728; // Белый для левого датчика
const MASTER_W_RAW_REF_RCS = 1644; // Белый для правого датчика

const SLAVE_B_RAW_REF_LCS = 2316; // Чёрный для левого датчика
const SLAVE_B_RAW_REF_RCS = 2164; // Чёрный для правого датчика
const SLAVE_W_RAW_REF_LCS = 1752; // Белый для левого датчика
const SLAVE_W_RAW_REF_RCS = 1646; // Белый для правого датчика

const ARM_MOTOR = motors.mediumD; // Ссылка на объект мотора манипулятора
const CLAW_MOTOR = motors.mediumA; // Ссылка на объект мотора манипулятора

let currentState = RobotState.None; // Переменная для хранения состояния робота

// Фунция установки стрелы в стартовую позицию
function SetArmMotor(state: ArmState, hold: boolean, speed?: number, stalledDetectionDelay: number = 10, timeOut?: number) {
    if (!speed) speed = 50; // Если аргумент не был передан, то за скорость установится значение по умолчанию
    else speed = Math.abs(speed);

    if (!timeOut) timeOut = 2000; // Если аргумент не был передан, то за максимальное время ожидания остановки устанавливается это значение
    else timeOut = Math.abs(timeOut);

    if (state == ArmState.Front) ARM_MOTOR.run(speed);
    else if (state == ArmState.Behind) ARM_MOTOR.run(-speed);
    else return;

    pause(stalledDetectionDelay);
    ARM_MOTOR.pauseUntilStalled(timeOut);
    ARM_MOTOR.setBrake(hold);
    ARM_MOTOR.stop();
}

// Функция установки захвата в нужную позицию
function SetClawPosition(state: ClawState, hold: boolean, speed?: number, stalledDetectionDelay: number = 10, timeOut?: number) {
    if (!speed) speed = 50; // Если аргумент не был передан, то за скорость установится значение по умолчанию
    else speed = Math.abs(speed);

    if (!timeOut) timeOut = 2000; // Если аргумент не был передан, то за максимальное время ожидания остановки устанавливается это значение
    else timeOut = Math.abs(timeOut);

    if (state == ClawState.Open) CLAW_MOTOR.run(-speed);
    else if (state == ClawState.Close) CLAW_MOTOR.run(speed);
    else return;

    pause(stalledDetectionDelay);
    CLAW_MOTOR.pauseUntilStalled(timeOut);
    CLAW_MOTOR.setBrake(hold);
    CLAW_MOTOR.stop();
}

function Main() { // Определение главной функции
    chassis.setSeparatelyChassisMotors(motors.mediumB, motors.mediumC, true, false); // Установить моторы в шасси и установить свойства инверсии
    chassis.setSpeedRegulated(false); // Установить регулирование скоростей шасси
    chassis.setWheelRadius(62.4, MeasurementUnit.Millimeters); // Установить радиус колёс в шасси
    chassis.setBaseLength(203, MeasurementUnit.Millimeters); // Расстояние между центрами колёс в мм
    chassis.setSyncRegulatorGains(0.01, 0, 0.5); // Установить параметры регулирования синхронизации моторов шасси

    sensors.SetNxtLightSensorsAsLineSensors(sensors.nxtLight2, sensors.nxtLight3); // Установить датчики отражения nxt в качестве датчиков линии
    // sensors.SetColorSensorsAsLineSensors(sensors.color2, sensors.color3); // Установить датчики цвета в качестве датчиков линии

    motions.SetLineFollowRefTreshold(40); // Установить пороговое значение отражения при движении по линии
    motions.SetDistRollingAfterInsetsection(35); // Установить дистанцию проезда после определения перекрёстка для прокатки в мм
    motions.SetDistRollingAfterIntersectionMoveOut(35); // Установить дистанцию для прокатки на перекрёстке без торможения, чтобы не определять повторно линию
    motions.SetLineFollowLoopDt(1); // Установить dt для циклов регулирования при движении по линии

    // Устанавливаем захват и стрелу в стартовое положение
    control.runInParallel(function () {
        SetClawPosition(ClawState.Open, false, 60);
        pause(100);
        SetArmMotor(ArmState.Front, false, 30);

    });

    brick.printValue("V", brick.batteryInfo(BatteryProperty.Voltage), 1, 1);
    brick.printString("PRESS TO RUN", 6, 9);
    brick.printString("left btn to start Master mode", 8, 1);
    brick.printString("right btn to start Slave mode", 9, 1);
    const pressedBtnAtStartup = custom.WaitBtnPressed(); // Ждём нажатия кнопки и записываем какая кнопка была нажата
    brick.clearScreen(); // Очистить экран

    if (pressedBtnAtStartup == DAL.BUTTON_ID_LEFT || pressedBtnAtStartup == DAL.BUTTON_ID_RIGHT) { // Если на старте была нажата левая кнопка
        if (pressedBtnAtStartup == DAL.BUTTON_ID_LEFT) {
            currentState = RobotState.Master; // Установить на старте текущий режим робота - мастер
            sensors.SetLineSensorsRawRefValues(MASTER_B_RAW_REF_LCS, MASTER_W_RAW_REF_LCS, MASTER_B_RAW_REF_RCS, MASTER_W_RAW_REF_RCS); // Установить значения отражения на белом и чёрном для датчика линии
        } else if (pressedBtnAtStartup == DAL.BUTTON_ID_RIGHT) {
            currentState = RobotState.Slave; // Установить на старте текущий режим робота - мастер
            sensors.SetLineSensorsRawRefValues(SLAVE_B_RAW_REF_LCS, SLAVE_W_RAW_REF_LCS, SLAVE_B_RAW_REF_RCS, SLAVE_W_RAW_REF_RCS); // Установить значения отражения на белом и чёрном для датчика линии
            pause(3000);
        }
        while (true) {
            if (currentState == RobotState.Master) {
                SetClawPosition(ClawState.Close, true);
                // pause(100);
                control.runInParallel(function () {
                    // ARM_MOTOR.clearCounts();
                    ARM_MOTOR.setBrake(true);
                    ARM_MOTOR.run(-100, 200, MoveUnit.Degrees);
                });
                pause(200);
            } else if (currentState == RobotState.Slave) {
                SetArmMotor(ArmState.Behind, false, 60);
                // chassis.LinearDistMove(50, -30, Braking.Hold);
                pause(1000);
                motions.LineFollowToCrossIntersection(AfterMotion.BreakStop, { Kp: 1, Kd: 0, speed: 30 });
                pauseUntil(() => sensors.ultrasonic4.distance() < 20);
                music.playToneInBackground(Note.C, music.beat(BeatFraction.Half));
                pause(7000);
                SetClawPosition(ClawState.Close, true);
                ARM_MOTOR.setBrake(true);
                ARM_MOTOR.run(60, 220, MoveUnit.Degrees);
                // motions.LineFollowToDistance(200, AfterMotion.BreakStop, { Kp: 0.2, Kd: 0.5, speed: 30 });
                currentState = RobotState.Master;
            }
            pause(1000);
            motions.RampLineFollowToDistance(1550, 100, 0, Braking.NoStop, { Kp: 1.4, Kd: 0.6, startingSpeed: 50, maxSpeed: 90 });
            motions.LineFollowToCrossIntersection(AfterMotion.NoStop, { Kp: 1.4, Kd: 0.8, speed: 90 });
            //motions.LineFollowToDistance(300, AfterMotion.NoStop, { Kp: 1.5, Kd: 1.9, speed: 90 });
            //pause(2000);
            //motions.LineFollowToDistance(4800, AfterMotion.NoStop, { Kp: 1.6, Kd: 1.9, speed: 90 });
            //motions.LineFollowToCrossIntersection(AfterMotion.NoStop, { Kp: 2, Kd: 3, speed: 90 });
            motions.LineFollowToDistance(2700, AfterMotion.NoStop, { Kp: 1.2, Kd: 0.8, speed: 90 });
            motions.LineFollowToCrossIntersection(AfterMotion.BreakStop, { Kp: 1.2, Kd: 0.8, speed: 60 });
            motions.LineFollowToDistance(250, AfterMotion.BreakStop, { Kp: 0.5, Kd: 0, speed: 30 });
            pause(200);
            SetArmMotor(ArmState.Front, false, 20);
            pause(1000);
            CLAW_MOTOR.run(-50, 15, MoveUnit.Degrees);
            pause(1000);
            motions.LineFollowToDistance(50, AfterMotion.BreakStop, { Kp: 0.3, Kd: 0, speed: 30 });
            SetClawPosition(ClawState.Open, true);
            chassis.LinearDistMove(80, -30, Braking.Hold);
            pause(7000);
            currentState = RobotState.Slave; // Новый текущий режим - раб
            motions.LineFollowToCrossIntersection(AfterMotion.BreakStop);
            ARM_MOTOR.setBrake(true);
            // ARM_MOTOR.run(-60, 360, MoveUnit.Degrees);
            pause(2000);
            // SetClawPosition(ClawState.Close, true);
            SetArmMotor(ArmState.Front, false, 60);
            ARM_MOTOR.clearCounts();
            pause(3000);
        }
    } else if (pressedBtnAtStartup == DAL.BUTTON_ID_DOWN) { // Если на старте была нажата кнопка вниз
        custom.FunctionsTune(0);
    }

}

Main(); // Запуск главной функции