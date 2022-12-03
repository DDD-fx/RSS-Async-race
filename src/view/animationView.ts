import EventEmitter from '../event-emitter';
import {
  AnimationInterface,
  AnimType,
  CallbackArgType,
  ModelInterface, StartEngineArgsType, StoreType,
} from '../types/types';
import {
  controlRaceBtn,
  controlStopBtn, isAnyStopBtnActive,
} from '../functions';

export default class AnimationView extends EventEmitter implements AnimationInterface {
  model: ModelInterface;

  store: StoreType;

  constructor(model: ModelInterface) {
    super();
    this.model = model;
    this.store = {};
  }

  getDistanceBetweenElems(car: HTMLElement, flag: HTMLDivElement): number {
    const carPosition = car.getBoundingClientRect().left;
    const flagPosition = flag.getBoundingClientRect().right;
    return Math.floor(flagPosition - carPosition);
  }

  startAnimation(args: CallbackArgType): void {
    const { time, id } = args as StartEngineArgsType;
    const car = document.getElementById(`car-${id}`) as HTMLDivElement;
    const flag = document.getElementById(`js-flag-${id}`) as HTMLDivElement;
    const distance = this.getDistanceBetweenElems(car, flag);

    controlStopBtn(id, false);
    controlRaceBtn(true);

    this.store[id] = this.animation(car, distance, time);
  }

  animation(car: HTMLElement, distance: number, animationTime: number): AnimType {
    let start = 0;
    const requestID = { id: 0 };

    function step(timeStamp: number): void {
      if (!start) start = timeStamp;
      const progress = timeStamp - start;
      const passed = Math.round(progress * (distance / animationTime));
      const carElem = car;
      carElem.style.transform = `translateX(${Math.min(passed, distance)}px)`;

      if (passed < distance) {
        requestID.id = window.requestAnimationFrame(step);
      }
    }
    requestID.id = window.requestAnimationFrame(step);
    return requestID;
  }

  stopAnimation(id: CallbackArgType): void {
    window.cancelAnimationFrame(this.store[`${id}`].id);
  }

  returnCarToStart(id: CallbackArgType): void {
    const car: HTMLElement | null = document.getElementById(`car-${id}`);
    if (car) {
      car.style.transform = 'translateX(0px)';
      const startBtn = document.getElementById(`js-engine-start-btn-${id}`) as HTMLButtonElement;
      startBtn.disabled = false;
      const stopBtn = document.getElementById(`js-engine-stop-btn-${id}`) as HTMLButtonElement;
      stopBtn.disabled = true;
      if (!isAnyStopBtnActive()) {
        controlRaceBtn(false);
      }
    }
  }
}
