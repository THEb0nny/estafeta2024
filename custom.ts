// Перечисление режимов робота
const enum RobotState {
    None = -1,
    Master = 0,
    Slave = 1
}

namespace custom {

    // Вспомогательная фунция ожидания нажатия кнопки
    export function WaitBtnPressed(): number {
        let pressedBtn: number = -1;
        while (true) {
            if (brick.buttonLeft.isPressed()) {
                pressedBtn = DAL.BUTTON_ID_LEFT;
                break;
            } else if (brick.buttonRight.isPressed()) {
                pressedBtn = DAL.BUTTON_ID_RIGHT;
                break;
            } else if (brick.buttonDown.isPressed()) {
                pressedBtn = DAL.BUTTON_ID_LEFT;
                break;
            }
            pause(5);
        }
        // Ждать выполнения события, что кнопка так же была отжата
        pauseUntil(() => brick.buttonUp.wasPressed() || brick.buttonDown.wasPressed() || brick.buttonLeft.wasPressed() || brick.buttonRight.wasPressed() || brick.buttonEnter.wasPressed());
        return pressedBtn;
    }

}
