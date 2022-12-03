import {
  AnimationInterface, BaseHtmlBuilderInterface,
  CallbackArgType,
  CarType, ControlRulesDivEnum,
  ModelInterface,
  ViewInterface,
  WinnersInterface,
} from '../types/types';
import BaseHtmlBuilder from './base-html-builder';
import EventEmitter from '../event-emitter';
import { MAX_CAR_PER_PAGE, STARTING_PAGE } from '../constants';
import {
  controlAllStartBtns,
  controlRaceBtn,
  controlResetBtn,
  controlRulesDiv,
  controlStartBtn,
  disableOtherBtnsWhileRacing,
  switchPages,
} from '../functions';
import WinnersView from './winnersView';
import AnimationView from './animationView';

export default class View extends EventEmitter implements ViewInterface {
  htmlBuilder: BaseHtmlBuilderInterface;

  winners: WinnersInterface;

  animation: AnimationInterface;

  model: ModelInterface;

  constructor(model: ModelInterface) {
    super();
    this.htmlBuilder = new BaseHtmlBuilder();
    this.winners = new WinnersView(model, this);
    this.animation = new AnimationView(model);
    this.model = model;

    model.on('carAdded', () => this.rebuildList())
      .on('carDeleted', () => this.rebuildList())
      .on('carSelected', (carName) => this.updateInputOnCarSelection(carName))
      .on('carUpdated', () => this.rebuildList())
      .on('carsGenerated', () => this.rebuildList())
      .on('nextPage', () => this.rebuildList())
      .on('prevPage', () => this.rebuildList())
      .on('runCar', (args) => this.animation.startAnimation(args))
      .on('stopCar', (id) => this.animation.stopAnimation(id))
      .on('returnCarToStart', (id) => this.animation.returnCarToStart(id))
      .on('showWinners', () => this.winners.rebuildWinners())
      .on('showWinners', (sortArgs) => this.winners.showSortArrow(sortArgs))
      .on('showMsg', (text) => BaseHtmlBuilder.showMsgModal(text));
  }

  rebuildList(): void {
    const createCarName = document.getElementsByClassName('js-choose-car-name')[0] as HTMLInputElement;
    const updateCarName = document.getElementsByClassName('js-update-car-name')[0] as HTMLInputElement;
    createCarName.value = '';
    updateCarName.value = '';

    const contentBlock = document.getElementsByClassName('content')[0] as HTMLDivElement;
    contentBlock.innerHTML = '';
    contentBlock.append(...this.createContentBlock(this.model.carsTotalCount, this.model.page));

    const raceBlock = document.getElementsByClassName('race')[0] as HTMLDivElement;
    raceBlock.innerHTML = '';
    this.model.cars.forEach((car) => raceBlock.append(
      ...this.createRaceBlock({
        color: car.color,
        name: car.name,
        id: car.id,
      }),
    ));
    this.checkActivePaginationBtns();
    controlRaceBtn(false);
    controlResetBtn(true);
  }

  combineView(): void {
    this.htmlBuilder.combineBaseHtmlParts();
    const main = document.getElementsByClassName('main')[0] as HTMLElement;
    const raceView = BaseHtmlBuilder.createDefaultDiv(['race-block']);
    const contentBlock = BaseHtmlBuilder.createDefaultDiv(['content']);
    const raceBlock = BaseHtmlBuilder.createDefaultDiv(['race']);
    const winnersBlock = BaseHtmlBuilder.createDefaultDiv(['winners']);

    raceView.append(this.createControlsWrapper(), contentBlock, raceBlock, this.createPagination());
    main.append(
      this.createGarageWinnersBlock(),
      raceView,
      winnersBlock,
      WinnersView.createWinnerSign(),
      BaseHtmlBuilder.createModalWrapper(),
    );
  }

  createControlsWrapper(): HTMLDivElement {
    const mainControlsWrapper = BaseHtmlBuilder.createDefaultDiv(['controls-wrapper']);
    mainControlsWrapper.append(
      this.createCreateCarBlock(),
      this.createUpdateCarBlock(),
      this.createRaceAllResetBlock(),
    );
    return mainControlsWrapper;
  }

  createGarageWinnersBlock(): HTMLDivElement {
    const garageWinnersBtnBlock = BaseHtmlBuilder.createDefaultDiv(['garage-winners']);
    garageWinnersBtnBlock.append(this.createGarageBtn(), this.createWinnersBtn());
    return garageWinnersBtnBlock;
  }

  createGarageBtn(): HTMLButtonElement {
    const garageBtn = BaseHtmlBuilder.createDefaultBtn('js-garage-btn', 'to garage'.toUpperCase());
    garageBtn.disabled = true;
    garageBtn.addEventListener('click', () => {
      switchPages();
      controlRulesDiv(ControlRulesDivEnum.Show);
    });
    return garageBtn;
  }

  createWinnersBtn(): HTMLButtonElement {
    const winnersBtn = BaseHtmlBuilder.createDefaultBtn('js-winners-btn', 'to winners'.toUpperCase());
    winnersBtn.addEventListener('click', () => {
      controlRulesDiv(ControlRulesDivEnum.Hide);
      this.emit('winnersBtnClicked');
      switchPages();
    });
    return winnersBtn;
  }

  createCreateCarBlock(): HTMLDivElement {
    const div = BaseHtmlBuilder.createDefaultDiv(['create-car']);
    const inputCarName = BaseHtmlBuilder.createDefaultInput('js-choose-car-name', 'text', 'Car Name');
    const inputCarColor = BaseHtmlBuilder.createDefaultInput('js-choose-car-color', 'color');
    const createCarBtn = BaseHtmlBuilder.createDefaultBtn('js-create-car-btn', 'create'.toUpperCase());
    createCarBtn.addEventListener('click', () => this.emit('createBtnClicked'));

    div.append(
      inputCarName,
      inputCarColor,
      createCarBtn,
      BaseHtmlBuilder.createAddCarErrMsg(),
    );
    return div;
  }

  createUpdateCarBlock(): HTMLDivElement {
    const div = BaseHtmlBuilder.createDefaultDiv(['update-car']);
    const inputCarName = BaseHtmlBuilder.createDefaultInput('js-update-car-name', 'text', 'Car Name');
    const inputCarColor = BaseHtmlBuilder.createDefaultInput('js-update-car-color', 'color');
    const updateCarBtn = BaseHtmlBuilder.createDefaultBtn('js-update-car-btn', 'update'.toUpperCase());
    updateCarBtn.addEventListener('click', () => this.emit('updateBtnClicked'));

    div.append(inputCarName, inputCarColor, updateCarBtn, BaseHtmlBuilder.createUpdateCarErrMsg());
    return div;
  }

  createRaceAllResetBlock(): HTMLDivElement {
    const raceResetBlock = BaseHtmlBuilder.createDefaultDiv(['race-reset']);
    raceResetBlock.append(this.createRaceBtn(), this.createResetBtn(), this.createGenerateBtn());
    return raceResetBlock;
  }

  createRaceBtn(): HTMLButtonElement {
    const raceBtn = BaseHtmlBuilder.createDefaultBtn('js-race-btn', 'race'.toUpperCase());
    raceBtn.addEventListener('click', () => {
      controlRaceBtn(true);
      controlResetBtn(true);
      controlAllStartBtns(true);
      disableOtherBtnsWhileRacing(true);
      this.emit('raceBtnClicked');
    });
    return raceBtn;
  }

  createResetBtn(): HTMLButtonElement {
    const resetBtn = BaseHtmlBuilder.createDefaultBtn('js-reset-btn', 'reset'.toUpperCase());
    resetBtn.disabled = true;
    resetBtn.addEventListener('click', () => {
      controlRaceBtn(false);
      controlResetBtn(true);
      this.emit('resetBtnClicked');
    });
    return resetBtn;
  }

  createGenerateBtn(): HTMLButtonElement {
    const generateCarsBtn = BaseHtmlBuilder.createDefaultBtn('js-generate-btn', 'generate cars'.toUpperCase());
    generateCarsBtn.addEventListener('click', () => this.emit('generateBtnClicked'));
    return generateCarsBtn;
  }

  createContentBlock(carsTotalCount: number, page: number):
  Array<HTMLHeadingElement & HTMLDivElement> {
    const garageTitle = document.createElement('h2');
    garageTitle.classList.add('content__title');
    garageTitle.textContent = `Garage (${carsTotalCount})`;

    const pageElem = BaseHtmlBuilder.createDefaultDiv(['content__page']);
    pageElem.textContent = `Page № ${page} of ${Math.ceil(carsTotalCount / MAX_CAR_PER_PAGE) || STARTING_PAGE}`;
    return [garageTitle, pageElem];
  }

  createRaceBlock({ color, name, id }: CarType): HTMLDivElement[] {
    const btnsAndCarNameBlock = BaseHtmlBuilder.createDefaultDiv(['btns-and-car-name']);

    const selectBtn = BaseHtmlBuilder.createDefaultBtn('js-select-btn', 'select'.toUpperCase());
    selectBtn.addEventListener('click', () => this.emit('selectBtnClicked', id));
    const removeBtn = BaseHtmlBuilder.createDefaultBtn('js-remove-btn', 'remove'.toUpperCase());
    removeBtn.addEventListener('click', () => this.emit('removeBtnClicked', id));
    const carNameDiv = BaseHtmlBuilder.createDefaultDiv([`js-car-name-${id}`, 'car-name'], name);

    const raceViewControlBlock = BaseHtmlBuilder.createDefaultDiv(['race-view']);
    const engineStartBtn = BaseHtmlBuilder.createDefaultBtn('js-engine-start-btn', '▶'.toUpperCase());
    engineStartBtn.addEventListener('click', () => {
      controlStartBtn(id, true);
      this.emit('runBtnClicked', id);
    });

    const engineStopBtn = BaseHtmlBuilder.createDefaultBtn('js-engine-stop-btn', '■'.toUpperCase());
    engineStopBtn.addEventListener('click', () => this.emit('stopBtnClicked', id));
    engineStopBtn.disabled = true;

    const carImgDiv = BaseHtmlBuilder.createDefaultDiv(['js-car-svg-container', 'car-svg-container']);
    carImgDiv.id = `car-${id}`;
    carImgDiv.innerHTML = BaseHtmlBuilder.createCarSvg(color);
    const flagDiv = BaseHtmlBuilder.createDefaultDiv(['js-flag', 'flag'], '🏁');

    BaseHtmlBuilder.setIDs([engineStartBtn, engineStopBtn, flagDiv], id);
    btnsAndCarNameBlock.append(selectBtn, removeBtn, carNameDiv);
    raceViewControlBlock.append(engineStartBtn, engineStopBtn, carImgDiv, flagDiv);
    return [btnsAndCarNameBlock, raceViewControlBlock];
  }

  createPagination(): HTMLDivElement {
    const div = BaseHtmlBuilder.createDefaultDiv(['pagination']);
    const prevBtn = BaseHtmlBuilder.createDefaultBtn('js-prev-btn', 'prev'.toUpperCase());
    prevBtn.addEventListener('click', () => {
      controlRaceBtn(false);
      controlResetBtn(true);
      this.emit('prevPageClicked');
    });

    const nextBtn = BaseHtmlBuilder.createDefaultBtn('js-next-btn', 'next'.toUpperCase());
    nextBtn.addEventListener('click', () => {
      controlRaceBtn(false);
      controlResetBtn(true);
      this.emit('nextPageClicked');
    });

    div.append(prevBtn, nextBtn);
    return div;
  }

  updateInputOnCarSelection(carName: CallbackArgType): void {
    const input = document.getElementsByClassName('js-update-car-name')[0] as HTMLInputElement;
    if (typeof carName === 'string') {
      input.value = carName;
    }
  }

  checkActivePaginationBtns(): void {
    const maxPages = Math.ceil(this.model.carsTotalCount / MAX_CAR_PER_PAGE);
    const currentPage = this.model.page;
    const nextBtn = document.getElementsByClassName('js-next-btn')[0] as HTMLButtonElement;
    const prevBtn = document.getElementsByClassName('js-prev-btn')[0] as HTMLButtonElement;
    nextBtn.disabled = currentPage >= maxPages;
    prevBtn.disabled = currentPage === 1;
  }
}
