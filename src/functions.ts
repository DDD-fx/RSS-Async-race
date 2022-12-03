import {
  BODY_COLOR,
  CAR_BRANDS,
  CAR_MODELS,
  MAX_CAR_PER_PAGE,
  MAX_GENERATED_CARS,
  MAX_WINNERS_PER_PAGE,
  STARTING_PAGE,
} from './constants';
import {
  CarToAddType, ControlRulesDivEnum, WinnersQueryType,
} from './types/types';

export function createRandomColor(): string {
  let carColor = '#69696b';
  while (carColor === BODY_COLOR) {
    carColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }
  return carColor;
}

export function createRandomName(): string {
  const carName = CAR_BRANDS[Math.floor(Math.random() * CAR_BRANDS.length)];
  const carModel = CAR_MODELS[Math.floor(Math.random() * CAR_MODELS.length)];
  return `${carName} ${carModel}`;
}

export function createRandomCars(): CarToAddType[] {
  return new Array(MAX_GENERATED_CARS).fill('').map(() => ({ name: createRandomName(), color: createRandomColor() }));
}

export function createGaragePageQuery(page: number = STARTING_PAGE): string {
  return `?_page=${page}&_limit=${MAX_CAR_PER_PAGE}`;
}

export function createEngineQuery(id: string, status: string): string {
  return `?id=${id}&status=${status}`;
}

export function createWinnersQuery(params: WinnersQueryType): string {
  const { winnersPage, sortOrder, sortBy } = params;
  return `?_page=${winnersPage}&_limit=${MAX_WINNERS_PER_PAGE}&_order=${sortOrder}&_sort=${sortBy}`;
}

export function controlStartBtn(id: string, param: boolean): void {
  const startBtn = document.getElementById(`js-engine-start-btn-${id}`) as HTMLButtonElement;
  startBtn.disabled = param;
}

export function controlStopBtn(id: string, param: boolean): void {
  const stopBtn = document.getElementById(`js-engine-stop-btn-${id}`) as HTMLButtonElement;
  stopBtn.disabled = param;
}

export function controlAllStartBtns(param: boolean): void {
  const startBtns = Array.from(document.getElementsByClassName('js-engine-start-btn')) as HTMLButtonElement[];
  for (let i = 0; i < startBtns.length; i += 1) {
    startBtns[i].disabled = param;
  }
}

export function controlRaceBtn(param: boolean): void {
  const raceBtn = document.getElementsByClassName('js-race-btn')[0] as HTMLButtonElement;
  raceBtn.disabled = param;
}

export function controlResetBtn(param: boolean): void {
  const resetBtn = document.getElementsByClassName('js-reset-btn')[0] as HTMLButtonElement;
  resetBtn.disabled = param;
}

export function disableOtherBtnsWhileRacing(param: boolean): void {
  const createCar = document.getElementsByClassName('js-create-car-btn')[0] as HTMLButtonElement;
  createCar.disabled = param;
  const updateCar = document.getElementsByClassName('js-update-car-btn')[0] as HTMLButtonElement;
  updateCar.disabled = param;
  const generateCars = document.getElementsByClassName('js-generate-btn')[0] as HTMLButtonElement;
  generateCars.disabled = param;
  const removeCar = document.getElementsByClassName('js-remove-btn') as HTMLCollection;
  const removeCarBtns = Array.from(removeCar) as Array<HTMLButtonElement>;
  for (let i = 0; i < removeCarBtns.length; i += 1) {
    removeCarBtns[i].disabled = param;
  }
  const prevPage = document.getElementsByClassName('js-prev-btn')[0] as HTMLButtonElement;
  prevPage.disabled = param;
  const nextPage = document.getElementsByClassName('js-next-btn')[0] as HTMLButtonElement;
  nextPage.disabled = param;
}

export function isAnyStopBtnActive(): HTMLButtonElement | undefined {
  const engineStopBtns = document.getElementsByClassName('js-engine-stop-btn') as HTMLCollection;
  const engineStopBtnsArr = Array.from(engineStopBtns) as HTMLButtonElement[];
  return engineStopBtnsArr.find((btn) => !btn.disabled);
}

export function switchPages(): void {
  const winnersBlock = document.getElementsByClassName('winners')[0] as HTMLDivElement;
  winnersBlock.style.display = winnersBlock.style.display === 'none' ? 'flex' : 'none';
  const winnersBtn = document.getElementsByClassName('js-winners-btn')[0] as HTMLButtonElement;
  winnersBtn.disabled = winnersBlock.style.display === 'flex';

  const raceBlock = document.getElementsByClassName('race-block')[0] as HTMLDivElement;
  raceBlock.style.display = raceBlock.style.display === 'none' ? 'flex' : 'none';
  const garageBtn = document.getElementsByClassName('js-garage-btn')[0] as HTMLButtonElement;
  garageBtn.disabled = raceBlock.style.display === 'flex';
}

export function controlRulesDiv(param: ControlRulesDivEnum): void {
  const rules = document.getElementsByClassName('rules')[0] as HTMLDivElement;
  if (param === 'hide') {
    rules.classList.add('hide');
  } else {
    rules.classList.remove('hide');
  }
}
