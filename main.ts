const ARM_MOTOR = motors.mediumA; // Ссылка на объект мотора манипулятора
const CLAW_MOTOR = motors.mediumD; // Ссылка на объект мотора манипулятора

let currentState = RobotState.None; // Переменная для хранения состояния робота

function Main() { // Определение главной функции
    chassis.setSeparatelyChassisMotors(motors.mediumB, motors.mediumC, true, false); // Установить моторы в шасси и установить свойства инверсии
    chassis.setWheelRadius(62.4, MeasurementUnit.Millimeters); // Установить радиус колёс в шасси
    chassis.setBaseLength(195); // Расстояние между центрами колёс в мм
    chassis.setSyncRegulatorGains(0.01, 0, 0.5); // Установить параметры регулирования синхронизации моторов шасси

    sensors.SetColorSensorsAsLineSensors(sensors.color2, sensors.color3); // Установить датчики цвета в качестве датчиков линии
    sensors.SetLineSensorsRawRefValues(628, 553, 634, 561); // Установить значения отражения на белом и чёрном для датчика линии

    motions.SetLineFollowRefTreshold(40); // Установить пороговое значение отражения при движении по линии
    motions.SetDistRollingAfterInsetsection(35); // Установить дистанцию проезда после определения перекрёстка для прокатки в мм
    motions.SetDistRollingAfterIntersectionMoveOut(20); // Установить дистанцию для прокатки на перекрёстке без торможения, чтобы не определять повторно линию
    motions.SetLineFollowLoopDt(10); // Установить dt для циклов регулирования при движении по линии

    brick.printValue("V", brick.batteryInfo(BatteryProperty.Voltage), 1, 1);
    brick.printString("PRESS TO RUN", 6, 9);
    brick.printString("left btn to start Master mode", 8, 1);
    brick.printString("right btn to start Slave mode", 9, 1);
    const pressedBtnAtStartup = custom.WaitBtnPressed(); // Ждём нажатия кнопки и записываем какая кнопка была нажата
    brick.clearScreen(); // Очистить экран

    if (pressedBtnAtStartup == DAL.BUTTON_ID_LEFT) { // Если на старте была нажата левая кнопка
        currentState = RobotState.Master;
        // motors.mediumA.pauseUntilStalled()
        // motors.mediumA.stop();
        // motors.mediumA.run(-30);
        motions.LineFollowToDistance(1400, AfterMotion.BreakStop, {Kp: 0.5, Kd: 2.9, speed: 70});

        // motions.LineFollowToIntersaction(false);
        // motions.LineFollowToDist(500, 70, AfterMotion.NoStop, false);
        // motions.LineFollowToIntersaction(false);
        // motions.LineFollowToDist(300, 70, AfterMotion.NoStop, false);

        // motions.LineFollowToIntersaction(false)
    } else if (pressedBtnAtStartup == DAL.BUTTON_ID_DOWN) { // Если на старте была нажата кнопка вниз
        custom.FunctionsTune(0);
    }
}

Main(); // Запуск главной функции