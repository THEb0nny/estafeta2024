const ARM_MOTOR = motors.mediumD; // Ссылка на объект мотора манипулятора
const CLAW_MOTOR = motors.mediumA; // Ссылка на объект мотора манипулятора

let currentState = RobotState.None; // Переменная для хранения состояния робота

// Фунция установки стрелы в стартовую позицию
function ResetArmMotor() {
    ARM_MOTOR.run(30);
    pause(10);
    ARM_MOTOR.pauseUntilStalled(2000);
    ARM_MOTOR.setBrake(false);
    ARM_MOTOR.stop();
    ARM_MOTOR.setBrake(true);
    pause(10);
    ARM_MOTOR.clearCounts();
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
    chassis.setWheelRadius(62.4, MeasurementUnit.Millimeters); // Установить радиус колёс в шасси
    chassis.setBaseLength(195, MeasurementUnit.Millimeters); // Расстояние между центрами колёс в мм
    chassis.setSyncRegulatorGains(0.01, 0, 0.5); // Установить параметры регулирования синхронизации моторов шасси

    sensors.SetNxtLightSensorsAsLineSensors(sensors.nxtLight2, sensors.nxtLight3); // Установить датчики отражения nxt в качестве датчиков линии
    // sensors.SetColorSensorsAsLineSensors(sensors.color2, sensors.color3); // Установить датчики цвета в качестве датчиков линии
    sensors.SetLineSensorsRawRefValues(2340, 1684, 2320, 1688); // Установить значения отражения на белом и чёрном для датчика линии

    motions.SetLineFollowRefTreshold(40); // Установить пороговое значение отражения при движении по линии
    motions.SetDistRollingAfterInsetsection(35); // Установить дистанцию проезда после определения перекрёстка для прокатки в мм
    motions.SetDistRollingAfterIntersectionMoveOut(20); // Установить дистанцию для прокатки на перекрёстке без торможения, чтобы не определять повторно линию
    motions.SetLineFollowLoopDt(2); // Установить dt для циклов регулирования при движении по линии

    // Устанавливаем захват и стрелу в стартовое положение
    control.runInParallel(function () {
        SetClawPosition(ClawState.Open, false);
        pause(100);
        ResetArmMotor();
    });

    brick.printValue("V", brick.batteryInfo(BatteryProperty.Voltage), 1, 1);
    brick.printString("PRESS TO RUN", 6, 9);
    brick.printString("left btn to start Master mode", 8, 1);
    brick.printString("right btn to start Slave mode", 9, 1);
    const pressedBtnAtStartup = custom.WaitBtnPressed(); // Ждём нажатия кнопки и записываем какая кнопка была нажата
    brick.clearScreen(); // Очистить экран

    if (pressedBtnAtStartup == DAL.BUTTON_ID_LEFT) { // Если на старте была нажата левая кнопка
        currentState = RobotState.Master; // Установить на старте текущий режим робота - мастер
        SetClawPosition(ClawState.Close, true);
        pause(100);
        control.runInParallel(function () {
            ARM_MOTOR.run(-20, 180, MoveUnit.Degrees);
        });
        pause(200);
        motions.RampLineFollowToDistance(1400, 100, 0, Braking.NoStop, { Kp: 1.6, Kd: 1.9, startingSpeed: 20, maxSpeed: 90 });
        motions.LineFollowToCrossIntersection(AfterMotion.NoStop);
        motions.LineFollowToDistance(500, AfterMotion.NoStop, { Kp: 1.3, Kd: 1.7, speed: 60 });
        motions.LineFollowToDistance(4500, AfterMotion.NoStop, { Kp: 1.6, Kd: 1.9, speed: 95 });
        motions.LineFollowToCrossIntersection(AfterMotion.NoStop, { Kp: 1, Kd: 1, speed: 70 });
        motions.LineFollowToDistance(200, AfterMotion.BreakStop, { Kp: 0.2, Kd: 0.5, speed: 30 });
        ARM_MOTOR.run(20, 180, MoveUnit.Degrees);
        pause(100);
        SetClawPosition(ClawState.Open, true);
        pause(2000);
        motions.LineFollowToCrossIntersection(AfterMotion.BreakStop);
        ARM_MOTOR.run(-20, 360, MoveUnit.Degrees);
        chassis.LinearDistMove(50, -50, Braking.Hold);
        currentState = RobotState.Slave; // Новый текущий режим - раб
    } else if (pressedBtnAtStartup == DAL.BUTTON_ID_DOWN) { // Если на старте была нажата кнопка вниз
        custom.FunctionsTune(0);
    }

}

Main(); // Запуск главной функции