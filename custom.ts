namespace custom {

    // Вспомогательная фунция ожидания нажатия кнопки
    export function WaitBtnPressed(): number {
        let pressedBtn: number = -1;
        while (true) {
            if (brick.buttonEnter.isPressed()) {
                pressedBtn = DAL.BUTTON_ID_ENTER;
                break;
            } else if (brick.buttonLeft.isPressed()) {
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
