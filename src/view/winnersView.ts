import BaseHtmlBuilder from './base-html-builder';
import { MAX_WINNERS_PER_PAGE, STARTING_PAGE } from '../constants';
import {
  CarType,
  ModelInterface, SortArgsType, TableRowDataType, ViewInterface, WinnersInterface, WinnerType,
} from '../types/types';
import EventEmitter from '../event-emitter';

export default class WinnersView extends EventEmitter implements WinnersInterface {
  model: ModelInterface;

  view: ViewInterface;

  constructor(model: ModelInterface, view: ViewInterface) {
    super();
    this.model = model;
    this.view = view;
  }

  rebuildWinners(): void {
    const winnersBlock = document.getElementsByClassName('winners')[0] as HTMLDivElement;
    winnersBlock.innerHTML = '';
    winnersBlock.append(...this.createWinnersBlock(
      this.model.winnersState.winnersCount,
      this.model.winnersState.winnersPage,
    ), this.createPagination());

    const winnersTable = document.getElementsByClassName('winners-table')[0] as HTMLTableElement;
    const maxItemNumber = this.model.winnersState.winnersPage * MAX_WINNERS_PER_PAGE;
    let minItemNumber = maxItemNumber - (MAX_WINNERS_PER_PAGE - 1) - 1;

    this.model.winnersState.winners.forEach((winner) => {
      minItemNumber += 1;
      const winnerData:CarType | undefined = this.model.allCars.find((car) => car.id === winner.id);
      if (winnerData) {
        const winnerName = winnerData.name;
        const winnerTime = (winner.time / 1000).toFixed(2);
        const winnerCarImg = BaseHtmlBuilder.createCarSvg(winnerData.color);
        const tableRowData = [minItemNumber, winnerCarImg, winnerName, winner.wins, winnerTime];
        winnersTable.append(this.createTableContent(tableRowData));
      }
    });
    this.checkActivePaginationBtns();
  }

  createWinnersBlock(winnersCount: number, page: number): HTMLElement[] {
    const content = BaseHtmlBuilder.createDefaultDiv(['winners-content']);

    const winnersTitle = document.createElement('h2');
    winnersTitle.classList.add('content__title');
    winnersTitle.textContent = `Winners (${winnersCount})`;

    const pageElem = BaseHtmlBuilder.createDefaultDiv(['content__page']);
    pageElem.textContent = `Page № ${page} of ${Math.ceil(winnersCount / MAX_WINNERS_PER_PAGE) || STARTING_PAGE}`;
    content.append(winnersTitle, pageElem);

    return [content, this.createTable()];
  }

  createTable(): HTMLTableElement {
    const table = document.createElement('table');
    table.classList.add('winners-table');
    table.append(this.createTableHeader());
    return table;
  }

  createTableHeader(): HTMLTableRowElement {
    const tr = document.createElement('tr');

    const headers = ['№', 'Car', 'Name', 'Wins', 'Best Time (sec)'];
    headers.forEach((el) => {
      const th = document.createElement('th');
      th.classList.add('winners-table-th');

      if (el === 'Wins') {
        const btn = this.createTableHeaderSorters('js-wins-sorter-btn', el);
        const arrowDiv = BaseHtmlBuilder.createDefaultDiv(['wins-sort-arrow']);

        btn.addEventListener('click', () => this.emit.call(this.view, 'sortByWinsBtnClicked'));
        th.append(btn, arrowDiv);
      } else if (el === 'Best Time (sec)') {
        const btn = this.createTableHeaderSorters('js-time-sorter-btn', el);
        const arrowDiv = BaseHtmlBuilder.createDefaultDiv(['time-sort-arrow']);

        btn.addEventListener('click', () => this.emit.call(this.view, 'sortByTimeBtnClicked'));
        th.append(btn, arrowDiv);
      } else {
        th.textContent = el;
      }
      tr.append(th);
    });
    return tr;
  }

  createTableContent(tableCellsData: TableRowDataType): HTMLTableRowElement {
    const tr = document.createElement('tr');
    tr.classList.add('winners-row');
    tableCellsData.forEach((data) => {
      const td = document.createElement('td');
      td.innerHTML = `${data}`;
      tr.append(td);
    });
    return tr;
  }

  createTableHeaderSorters(className: string, text: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.classList.add(className, className.slice(3));
    btn.textContent = text;
    return btn;
  }

  createPagination(): HTMLDivElement {
    const div = BaseHtmlBuilder.createDefaultDiv(['winners-pagination']);
    const prevBtn = BaseHtmlBuilder.createDefaultBtn('js-prev-winner-btn', 'prev'.toUpperCase());
    prevBtn.addEventListener('click', () => this.emit.call(this.view, 'prevWinnerPageClicked'));

    const nextBtn = BaseHtmlBuilder.createDefaultBtn('js-next-winner-btn', 'next'.toUpperCase());
    nextBtn.addEventListener('click', () => this.emit.call(this.view, 'nextWinnerPageClicked'));

    div.append(prevBtn, nextBtn);
    return div;
  }

  checkActivePaginationBtns(): void {
    const maxPages = Math.ceil(this.model.winnersState.winnersCount / MAX_WINNERS_PER_PAGE);
    const currentPage = this.model.winnersState.winnersPage;
    const prevBtn = document.getElementsByClassName('js-prev-winner-btn')[0] as HTMLButtonElement;
    const nextBtn = document.getElementsByClassName('js-next-winner-btn')[0] as HTMLButtonElement;
    nextBtn.disabled = currentPage >= maxPages;
    prevBtn.disabled = currentPage === 1;
  }

  showSortArrow(sortArgs: SortArgsType): void {
    const { sortBy, order } = sortArgs;
    const winsArrow = document.getElementsByClassName('wins-sort-arrow')[0] as HTMLDivElement;
    const timeArrow = document.getElementsByClassName('time-sort-arrow')[0] as HTMLDivElement;
    if (sortBy === 'wins') {
      winsArrow.textContent = (order === 'asc') ? '↑' : '↓';
      timeArrow.style.display = 'none';
    }
    if (sortBy === 'time') {
      timeArrow.textContent = (order === 'asc') ? '↑' : '↓';
      winsArrow.style.display = 'none';
    }
  }

  static createWinnerSign(): HTMLDivElement {
    return BaseHtmlBuilder.createDefaultDiv(['js-winner-sign', 'winner-sign']);
  }

  static showWinnerSign(result: Pick<WinnerType, 'id' | 'time'>): void {
    const winnerSign = document.getElementsByClassName('js-winner-sign')[0] as HTMLDivElement;
    const winnerName = document.getElementsByClassName(`js-car-name-${result.id}`)[0].textContent;
    winnerSign.style.display = 'block';
    winnerSign.textContent = `${winnerName} has won with a result [ ${(result.time / 1000).toFixed(2)} sec ]`;
    setTimeout(() => {
      winnerSign.style.display = 'none';
    }, 7000);
  }
}
