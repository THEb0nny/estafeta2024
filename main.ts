const ARM_MOTOR = motors.mediumA; // Ссылка на объект мотора манипулятора
const CLAW_MOTOR = motors.mediumD; // Ссылка на объект мотора манипулятора

function Main() { // Определение главной функции
    chassis.setSeparatelyChassisMotors(motors.mediumB, motors.mediumC, true, false); // Установить моторы в шасси и установить свойства инверсии
    chassis.setWheelRadius(62.4, MeasurementUnit.Millimeters); // Установить радиус колёс в шасси
    sensors.SetColorSensorsAsLineSensors(sensors.color2, sensors.color3); // Установить датчики цвета в качестве датчиков линии
    sensors.SetLineSensorsRawRefValues(628, 553, 634, 561); // Установить значения отражения на белом и чёрном для датчика линии
    chassis.setBaseLength(195); // Расстояние между центрами колёс в мм
    chassis.setSyncRegulatorGains(0.01, 0, 0.5); // Установить параметры регулирования синхронизации моторов шасси

    motions.SetLineFollowRefTreshold(40); // Установить пороговое значение отражения при движении по линии
    motions.SetDistRollingAfterInsetsection(35); // Установить дистанцию проезда после определения перекрёстка для прокатки в мм
    motions.SetDistRollingAfterIntersectionMoveOut(20); // Установить дистанцию для прокатки на перекрёстке без торможения, чтобы не определять повторно линию
    motions.SetLineFollowLoopDt(10); // Установить dt для циклов регулирования при движении по линии

    brick.printString("RUN", 6, 14);
    const pressedBtnAtStartup = custom.WaitBtnPressed(); // Ждём нажатия кнопки и записываем какая кнопка была нажата
    brick.clearScreen();

    if (pressedBtnAtStartup == DAL.BUTTON_ID_ENTER) {
        // motors.mediumA.pauseUntilStalled()
        // motors.mediumA.stop();
        // motors.mediumA.run(-30);
        motions.LineFollowToDistance(1400, AfterMotion.BreakStop, {Kp: 0.5, Kd: 2.9, speed: 70});

        // motions.LineFollowToIntersaction(false);
        // motions.LineFollowToDist(500, 70, AfterMotion.NoStop, false);
        // motions.LineFollowToIntersaction(false);
        // motions.LineFollowToDist(300, 70, AfterMotion.NoStop, false);

        // motions.LineFollowToIntersaction(false)

    } else if (pressedBtnAtStartup == DAL.BUTTON_ID_LEFT) {
        custom.FunctionsTune(0);
    }
}

Main(); // Запуск главной функции