export interface BaseHtmlBuilderInterface {
  combineBaseHtmlParts(): void;
  createHeader(): HTMLElement;
  createMain(): HTMLElement;
  createRulesDiv(): HTMLDivElement;
  createFooter(): HTMLElement;
}

export type CallbackArgType = CarType | CarToAddType[] | StartEngineArgsType | SortArgsType |
string | number | null | undefined;

export type EventsType = {
  createBtnClicked?: Array<(data?: CallbackArgType) => void>,
  removeBtnClicked?: Array<(data?: CallbackArgType) => void>,
  updateBtnClicked?: Array<(data?: CallbackArgType) => void>,
  generateBtnClicked?: Array<(data?: CallbackArgType) => void>,
  selectBtnClicked?: Array<(data?: CallbackArgType) => void>,
  prevPageClicked?: Array<(data?: CallbackArgType) => void>,
  nextPageClicked?: Array<(data?: CallbackArgType) => void>,
  runBtnClicked?: Array<(data?: CallbackArgType) => void>,
  stopBtnClicked?: Array<(data?: CallbackArgType) => void>,
  raceBtnClicked?: Array<(data?: CallbackArgType) => void>,
  resetBtnClicked?: Array<(data?: CallbackArgType) => void>,

  winnersBtnClicked?: Array<(data?: CallbackArgType) => void>,
  sortByWinsBtnClicked?: Array<(data?: CallbackArgType) => void>,
  sortByTimeBtnClicked?: Array<(data?: CallbackArgType) => void>,
  prevWinnerPageClicked?: Array<(data?: CallbackArgType) => void>,
  nextWinnerPageClicked?: Array<(data?: CallbackArgType) => void>,

  carAdded?: Array<(data?: CallbackArgType) => void>,
  carDeleted?: Array<(data?: CallbackArgType) => void>,
  carSelected?: Array<(data?: CallbackArgType) => void>,
  carUpdated?: Array<(data?: CallbackArgType) => void>,
  carsGenerated?: Array<(data?: CallbackArgType) => void>,
  nextPage?: Array<(data?: CallbackArgType) => void>,
  prevPage?: Array<(data?: CallbackArgType) => void>,
  runCar?: Array<(data?: CallbackArgType) => void>,
  stopCar?: Array<(data?: CallbackArgType) => void>,
  returnCarToStart?: Array<(data?: CallbackArgType) => void>,
  showWinners?: Array<(data?: CallbackArgType) => void>,
  showMsg?: Array<(data?: CallbackArgType) => void>,
};

export interface EventEmitterInterface {
  events: EventsType;
  on(evt: string, listener: (arg: CallbackArgType) => void): EventEmitterInterface;
  emit(evt: string, arg?: CallbackArgType): void;
}

export interface ViewInterface extends EventEmitterInterface {
  htmlBuilder: BaseHtmlBuilderInterface;
  winners: WinnersInterface;
  animation: AnimationInterface;
  model: ModelInterface;
  rebuildList(): void;
  combineView(): void;
  createControlsWrapper(): HTMLDivElement;
  createGarageWinnersBlock(): HTMLDivElement;
  createGarageBtn(): HTMLButtonElement;
  createWinnersBtn(): HTMLButtonElement;
  createCreateCarBlock(): HTMLDivElement;
  createUpdateCarBlock(): HTMLDivElement;
  createRaceAllResetBlock(): HTMLDivElement;
  createRaceBtn(): HTMLButtonElement;
  createResetBtn(): HTMLButtonElement;
  createGenerateBtn(): HTMLButtonElement;
  createContentBlock(carsTotalCount: number, page: number):
  Array<HTMLHeadingElement & HTMLDivElement>;
  createRaceBlock({ color, name, id }: CarType): HTMLDivElement[];
  createPagination(): HTMLDivElement;
  updateInputOnCarSelection(carName: CallbackArgType): void;
  checkActivePaginationBtns(): void;
}

export interface WinnersInterface extends EventEmitterInterface {
  model: ModelInterface;
  view: ViewInterface;
  rebuildWinners(): void;
  createWinnersBlock(carsTotalCount: number, page: number): HTMLElement[];
  createTable(): HTMLTableElement;
  createTableHeader(): HTMLTableRowElement;
  createTableContent(tableCellsData: TableRowDataType): HTMLTableRowElement;
  createTableHeaderSorters(className: string, text: string): HTMLButtonElement;
  createPagination(): HTMLDivElement;
  checkActivePaginationBtns(): void;
  showSortArrow(sortArgs: CallbackArgType): void;
}

export interface AnimationInterface extends EventEmitterInterface {
  model: ModelInterface;
  store: StoreType;
  getDistanceBetweenElems(car: HTMLElement, flag: HTMLDivElement): number;
  startAnimation(args: CallbackArgType): void;
  animation(car: HTMLElement, distance: number, animationTime: number): AnimType;
  stopAnimation(id: CallbackArgType): void;
  returnCarToStart(id: CallbackArgType): void;
}

export interface ModelInterface extends EventEmitterInterface {
  cars: CarType[];
  allCars: CarType[];
  carsTotalCount: number;
  page: number;
  winnersState: WinnersStateType;

  getGarageCars(query: string): Promise<void>;
  createCar(car: CarToAddType): Promise<void>;
  addCar(car: CarToAddType): Promise<void>;
  removeCar(id: string): Promise<void>;
  selectCar(id: string): Promise<void>;
  updateCar(car: CarToAddType, id: string): Promise<void>;
  generateCars(cars: CarToAddType[]): Promise<void>;

  startEngine(queryParams: string, id: string): Promise<RaceRespType>;
  drive(id: string): Promise<boolean>;
  stopEngine(queryParams: string, id: string): Promise<void>;
  raceAll(): Promise<RaceRespType>;
  resetAll(): Promise<void>;

  createWinner(winner: WinnerType): Promise<void>;
  updateWinner(id: string, body: WinnerType): Promise<void>;
  saveWinner(results: Pick<WinnerType, 'id' | 'time'>): Promise<void>;
  deleteWinner(id: string): Promise<void>;
  getWinner(id: string): Promise<WinnerType | Record<string, never>>;
  getAllWinners(query: string): Promise<void>;

  goToNextPage(): Promise<void>;
  goToPrevPage(): Promise<void>;
  updateQueryParams(action: ActionEnum): string;
}

export interface ControllerInterface {
  model: ModelInterface;
  view: ViewInterface;
  currentSelection: string;

  addCar(): void;
  removeCar(id: CallbackArgType): void;
  selectCar(id: CallbackArgType): void;
  updateCar(): void;
  generateCars(): void;
  startEngine(id: CallbackArgType): void;
  stopEngine(id: CallbackArgType): void
  raceAll(): Promise<void>;
  resetAll(): void;
  goToNextPage():void;
  goToPrevPage(): void;

  getAllWinners(): void;
  sortByWins(): void;
  sortByTime(): void;
  goToNextWinnerPage(): void;
  goToPrevWinnerPage(): void;

  isEmpty(carName: string, action: ActionEnum): boolean;
}

export type SortArgsType = {
  sortBy: 'wins' | 'time',
  order: 'asc' | 'desc',
};

export enum RequestURL {
  garage = 'https://teal-scorpion-tie.cyclic.app/garage/',
  engine = 'https://teal-scorpion-tie.cyclic.app/engine',
  winners = 'https://teal-scorpion-tie.cyclic.app/winners/',
}

export type WinnersQueryType = Pick<WinnersStateType, 'winnersPage' | 'sortBy' | 'sortOrder'>;

export type WinnersStateType = {
  winnersCount: number,
  winners: WinnerType[],
  winnersPage: number,
  sortOrder: 'asc' | 'desc',
  sortBy: 'time' | 'wins',
};

export type WinnerType = {
  id: string,
  wins: number,
  time: number,
};

export type StoreType = {
  [carID: string]: AnimType,
};

export type AnimType = {
  id: number,
};

export type CarType = {
  name: string,
  color: string,
  id: string,
};

export type StartEngineArgsType = {
  time: number,
  id: string,
};

export type RaceRespType = {
  success: boolean,
  id: string,
  time: number,
};

export type CarToAddType = Pick<CarType, 'name' | 'color'>;

export type EngineStartRespType = {
  distance: number,
  velocity: number,
};

export type TableRowDataType = Array<string | number>;

export enum ActionEnum {
  Add,
  Update,
  Delete,
  Next,
  Prev,
  Never,
}

export enum EngineStatusEnum {
  Started = 'started',
  Stopped = 'stopped',
  Drive = 'drive',
}

export enum ControlRulesDivEnum {
  Hide = 'hide',
  Show = 'show',
}

export type DriveErrorsType = {
  [errorNum: string]: string
};
