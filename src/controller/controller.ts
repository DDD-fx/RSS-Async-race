import {
  ActionEnum,
  CallbackArgType,
  ControllerInterface, EngineStatusEnum,
  ModelInterface,
  ViewInterface,
} from '../types/types';
import {
  controlRaceBtn, controlResetBtn,
  createEngineQuery,
  createRandomCars,
  createWinnersQuery, disableOtherBtnsWhileRacing,
} from '../functions';
import WinnersView from '../view/winnersView';
import BaseHtmlBuilder from '../view/base-html-builder';

export default class Controller implements ControllerInterface {
  model: ModelInterface;

  view: ViewInterface;

  currentSelection: string;

  constructor(model: ModelInterface, view: ViewInterface) {
    this.currentSelection = '';
    this.model = model;
    this.view = view;
    view.on('createBtnClicked', () => this.addCar())
      .on('removeBtnClicked', (id) => this.removeCar(id))
      .on('selectBtnClicked', (id) => this.selectCar(id))
      .on('updateBtnClicked', () => this.updateCar())
      .on('generateBtnClicked', () => this.generateCars())
      .on('nextPageClicked', () => this.goToNextPage())
      .on('prevPageClicked', () => this.goToPrevPage())
      .on('runBtnClicked', (id) => this.startEngine(id))
      .on('stopBtnClicked', (id) => this.stopEngine(id))
      .on('raceBtnClicked', () => this.raceAll())
      .on('resetBtnClicked', () => this.resetAll())
      .on('winnersBtnClicked', () => this.getAllWinners())
      .on('sortByWinsBtnClicked', () => this.sortByWins())
      .on('sortByTimeBtnClicked', () => this.sortByTime())
      .on('nextWinnerPageClicked', () => this.goToNextWinnerPage())
      .on('prevWinnerPageClicked', () => this.goToPrevWinnerPage());
  }

  addCar(): void {
    const carNameInput = document.getElementsByClassName('js-choose-car-name')[0] as HTMLInputElement;
    const carName = carNameInput.value;
    if (this.isEmpty(carName, ActionEnum.Add)) return;

    const carColorInput = document.getElementsByClassName('js-choose-car-color')[0] as HTMLInputElement;
    const carColor = carColorInput.value;

    this.model.addCar({ name: carName, color: carColor }).catch((err) => console.error(err));
  }

  removeCar(id: CallbackArgType): void {
    this.model.removeCar(String(id)).catch((err) => console.error(err));
  }

  selectCar(id: CallbackArgType): void {
    this.currentSelection = String(id);
    this.model.selectCar(this.currentSelection).catch((err) => console.error(err));
  }

  updateCar(): void {
    const carNameInput = document.getElementsByClassName('js-update-car-name')[0] as HTMLInputElement;
    const carName = carNameInput.value;
    if (this.isEmpty(carName, ActionEnum.Update)) return;

    const carColorInput = document.getElementsByClassName('js-update-car-color')[0] as HTMLInputElement;
    const carColor = carColorInput.value;

    this.model.updateCar({ name: carName, color: carColor }, this.currentSelection)
      .catch((err) => console.error(err));
  }

  generateCars(): void {
    const generatedCars = createRandomCars();
    this.model.generateCars(generatedCars).catch((err) => console.error(err));
  }

  startEngine(id: CallbackArgType) {
    const query = createEngineQuery(String(id), EngineStatusEnum.Started);
    return this.model.startEngine(query, String(id)).catch((err) => console.error(err));
  }

  stopEngine(id: CallbackArgType): void {
    const query: string = createEngineQuery(String(id), EngineStatusEnum.Stopped);
    this.model.stopEngine(query, String(id)).catch((err) => console.error(err));
  }

  async raceAll(): Promise<void> {
    try {
      const res = await this.model.raceAll();
      if (res) {
        WinnersView.showWinnerSign({ id: res.id, time: res.time });
        await this.model.saveWinner({ id: res.id, time: res.time });
      }
    } catch (err) {
      console.error('All engines were broken');
    } finally {
      controlRaceBtn(true);
      controlResetBtn(false);
      disableOtherBtnsWhileRacing(false);
      this.view.checkActivePaginationBtns();
    }
  }

  resetAll(): void {
    this.model.resetAll().catch((err) => console.error(err));
  }

  goToNextPage(): void {
    this.model.goToNextPage().catch((err) => console.error(err));
  }

  goToPrevPage(): void {
    this.model.goToPrevPage().catch((err) => console.error(err));
  }

  getAllWinners(): void {
    const winnersQuery = createWinnersQuery({
      winnersPage: this.model.winnersState.winnersPage,
      sortOrder: this.model.winnersState.sortOrder,
      sortBy: this.model.winnersState.sortBy,
    });
    this.model.getAllWinners(winnersQuery).catch((err) => console.error(err));
  }

  sortByWins(): void {
    this.model.winnersState.sortOrder = this.model.winnersState.sortOrder === 'desc' ? 'asc' : 'desc';
    this.model.winnersState.sortBy = 'wins';
    const winnersQuery = createWinnersQuery({
      winnersPage: this.model.winnersState.winnersPage,
      sortOrder: this.model.winnersState.sortOrder,
      sortBy: this.model.winnersState.sortBy,
    });
    this.model.getAllWinners(winnersQuery).catch((err) => console.error(err));
  }

  sortByTime(): void {
    this.model.winnersState.sortOrder = this.model.winnersState.sortOrder === 'desc' ? 'asc' : 'desc';
    this.model.winnersState.sortBy = 'time';
    const winnersQuery = createWinnersQuery({
      winnersPage: this.model.winnersState.winnersPage,
      sortOrder: this.model.winnersState.sortOrder,
      sortBy: this.model.winnersState.sortBy,
    });
    this.model.getAllWinners(winnersQuery).catch((err) => console.error(err));
  }

  goToNextWinnerPage(): void {
    this.model.winnersState.winnersPage += 1;
    const winnersQuery = createWinnersQuery({
      winnersPage: this.model.winnersState.winnersPage,
      sortOrder: this.model.winnersState.sortOrder,
      sortBy: this.model.winnersState.sortBy,
    });
    this.model.getAllWinners(winnersQuery).catch((err) => console.error(err));
  }

  goToPrevWinnerPage(): void {
    this.model.winnersState.winnersPage -= 1;
    const winnersQuery = createWinnersQuery({
      winnersPage: this.model.winnersState.winnersPage,
      sortOrder: this.model.winnersState.sortOrder,
      sortBy: this.model.winnersState.sortBy,
    });
    this.model.getAllWinners(winnersQuery).catch((err) => console.error(err));
  }

  isEmpty(carName: string, action: ActionEnum): boolean {
    if (carName === '') {
      if (action === ActionEnum.Add) {
        BaseHtmlBuilder.showInputErrMsg(ActionEnum.Add);
      }
      if (action === ActionEnum.Update) {
        BaseHtmlBuilder.showInputErrMsg(ActionEnum.Update);
      }
      return true;
    }
    return false;
  }
}
