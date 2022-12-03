import EventEmitter from '../event-emitter';
import {
  ActionEnum,
  CarToAddType,
  CarType,
  EngineStartRespType,
  EngineStatusEnum,
  ModelInterface,
  RaceRespType,
  RequestURL,
  WinnersStateType,
  WinnerType,
} from '../types/types';
import { DRIVE_ERRORS, MAX_CAR_PER_PAGE, STARTING_PAGE } from '../constants';
import { createEngineQuery, createGaragePageQuery } from '../functions';

export default class Model extends EventEmitter implements ModelInterface {
  cars: CarType[];

  allCars: CarType[];

  carsTotalCount: number;

  page: number;

  winnersState: WinnersStateType;

  constructor() {
    super();
    this.cars = [];
    this.allCars = [];
    this.carsTotalCount = 0;
    this.page = STARTING_PAGE;
    this.winnersState = {
      winnersCount: 0,
      winners: [],
      winnersPage: 1,
      sortOrder: 'desc',
      sortBy: 'wins',
    };
  }

  async getGarageCars(query: string): Promise<void> {
    const data = await fetch(RequestURL.garage + query);
    this.cars = await data.json().catch((err) => console.error(err));
    this.carsTotalCount = Number(data.headers.get('X-Total-Count'));

    const allData = await fetch(RequestURL.garage);
    this.allCars = await allData.json().catch((err) => console.error(err));
  }

  async createCar(car: CarToAddType): Promise<void> {
    await fetch(RequestURL.garage, {
      method: 'POST',
      body: JSON.stringify(car),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async addCar(car: CarToAddType): Promise<void> {
    await this.createCar(car).catch((err) => console.error(err));
    await this.getGarageCars(this.updateQueryParams(ActionEnum.Add));
    this.emit('carAdded');
  }

  async removeCar(id: string): Promise<void> {
    await fetch(RequestURL.garage + id, {
      method: 'DELETE',
    });
    await this.getGarageCars(this.updateQueryParams(ActionEnum.Delete))
      .catch((err) => console.error(err));

    const winner = await this.getWinner(id);
    if (Object.keys(winner).length !== 0) {
      await this.deleteWinner(winner.id).catch((err) => console.error(err));
    }
    this.emit('carDeleted');
  }

  async selectCar(id: string): Promise<void> {
    const data = await fetch(RequestURL.garage + id);
    const selectedCar: CarType = await data.json();
    this.emit('carSelected', selectedCar.name);
  }

  async updateCar(car: CarToAddType, id: string): Promise<void> {
    await fetch(RequestURL.garage + id, {
      method: 'PUT',
      body: JSON.stringify(car),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await this.getGarageCars(this.updateQueryParams(ActionEnum.Never))
      .catch((err) => console.error(err));
    this.emit('carUpdated');
  }

  async generateCars(cars: CarToAddType[]): Promise<void> {
    await Promise.all(cars.map((car) => this.createCar(car).catch((err) => console.error(err))));
    await this.getGarageCars(this.updateQueryParams(ActionEnum.Never))
      .catch((err) => console.error(err));
    this.emit('carsGenerated');
  }

  async startEngine(query: string, id: string): Promise<RaceRespType> {
    const data = await fetch(RequestURL.engine + query, { method: 'PATCH' });
    const { distance, velocity }: EngineStartRespType = await data.json();
    const time = Math.floor(distance / velocity);
    this.emit('runCar', { time, id });

    const success = await this.drive(id);
    if (!success) this.emit('stopCar', id);
    return { success, id, time };
  }

  async drive(id: string): Promise<boolean> {
    const query: string = createEngineQuery(id, EngineStatusEnum.Drive);
    const res = await fetch(RequestURL.engine + query, { method: 'PATCH' }).catch((err) => console.error(err));
    if (res) {
      switch (res.status) {
        case 200: return true;
        case 400: this.emit('showMsg', DRIVE_ERRORS[400]); break;
        case 404: this.emit('showMsg', DRIVE_ERRORS[404]); break;
        case 429: this.emit('showMsg', DRIVE_ERRORS[429]); break;
        case 500: this.emit('showMsg', `Car ${id} engine was broken`); break;
        default: break;
      }
    }
    return false;
  }

  async stopEngine(query: string, id: string): Promise<void> {
    await fetch(RequestURL.engine + query, { method: 'PATCH' });
    try {
      this.emit('stopCar', id);
      this.emit('returnCarToStart', id);
    } catch (err) {
      console.error(err);
    }
  }

  async raceAll(): Promise<RaceRespType> {
    return Promise.any(this.cars
      .map(async (car: CarType) => {
        const query: string = createEngineQuery(car.id, EngineStatusEnum.Started);
        const result = await this.startEngine(query, car.id);
        if (!result.success) return Promise.reject();
        return result;
      }));
  }

  async resetAll(): Promise<void> {
    this.cars.forEach((car) => {
      const query = createEngineQuery(car.id, EngineStatusEnum.Stopped);
      this.stopEngine(query, car.id);
    });
  }

  async goToNextPage(): Promise<void> {
    const queryParams = this.updateQueryParams(ActionEnum.Next);
    await this.getGarageCars(queryParams);
    this.emit('nextPage');
  }

  async goToPrevPage(): Promise<void> {
    const queryParams = this.updateQueryParams(ActionEnum.Prev);
    await this.getGarageCars(queryParams);
    this.emit('prevPage');
  }

  async createWinner(winner: WinnerType): Promise<void> {
    await fetch(RequestURL.winners, {
      method: 'POST',
      body: JSON.stringify(winner),
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((err) => console.error(err));
  }

  async updateWinner(id: string, body: WinnerType): Promise<void> {
    await fetch(RequestURL.winners + id, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((err) => console.error(err));
  }

  async saveWinner(results: Pick<WinnerType, 'id' | 'time'>): Promise<void> {
    const winnerData = await fetch(RequestURL.winners + results.id)
      .catch((err) => console.error(err));
    if (winnerData) {
      const winner: WinnerType = await winnerData.json();
      if (winnerData.status === 404) {
        this.emit('showMsg', 'New Winner In Table');
        await this.createWinner({ id: results.id, wins: 1, time: results.time });
      } else {
        await this.updateWinner(winner.id, {
          id: winner.id,
          wins: winner.wins + 1,
          time: results.time < winner.time ? results.time : winner.time,
        });
      }
    }
  }

  async deleteWinner(id: string): Promise<void> {
    await fetch(RequestURL.winners + id, { method: 'DELETE' }).catch((err) => console.error(err));
  }

  async getWinner(id: string): Promise<WinnerType | Record<string, never>> {
    const data = await fetch(RequestURL.winners + id).catch((err) => console.error(err));
    if (data) {
      if (data.status === 200) {
        const winner = await data.json();
        this.emit('showMsg', 'Winner was deleted from winners table');
        return winner;
      }
      if (data.status === 404) {
        this.emit('showMsg', 'Deleted car has never won. Winners table remains untouched');
      }
    }
    return {};
  }

  async getAllWinners(query: string): Promise<void> {
    const data = await fetch(RequestURL.winners + query).catch((err) => console.error(err));
    if (data) {
      this.winnersState.winnersCount = Number(data.headers.get('X-Total-Count'));
      this.winnersState.winners = await data.json();
      this.emit('showWinners', { sortBy: this.winnersState.sortBy, order: this.winnersState.sortOrder });
    }
  }

  updateQueryParams(action: ActionEnum): string {
    const maxPages = Math.ceil(this.carsTotalCount / MAX_CAR_PER_PAGE);
    const carsPerCurrentPage = this.cars.length;

    if (action === ActionEnum.Never) return createGaragePageQuery(this.page);
    if (action === ActionEnum.Add && carsPerCurrentPage === MAX_CAR_PER_PAGE) {
      this.page = maxPages;
    }
    if (action === ActionEnum.Delete && carsPerCurrentPage <= 1) {
      this.page = (this.page > 1) ? this.page - 1 : STARTING_PAGE;
    }
    if (action === ActionEnum.Next && this.page < maxPages) {
      this.page += 1;
    }
    if (action === ActionEnum.Prev && this.page > 1) {
      this.page -= 1;
    }
    return createGaragePageQuery(this.page);
  }
}
