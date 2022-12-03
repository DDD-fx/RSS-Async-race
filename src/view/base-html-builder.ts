import { ActionEnum, BaseHtmlBuilderInterface, CallbackArgType } from '../types/types';

export default class BaseHtmlBuilder implements BaseHtmlBuilderInterface {
  combineBaseHtmlParts(): void {
    const body = document.getElementsByTagName('body')[0] as HTMLBodyElement;
    body.classList.add('body');
    body.append(this.createHeader(), this.createRulesDiv(), this.createMain(), this.createFooter());
  }

  createHeader(): HTMLElement {
    const headerElem = document.createElement('header');
    headerElem.classList.add('header');
    const titleElem = document.createElement('h1');
    titleElem.classList.add('header__title');
    titleElem.textContent = 'Async-Race';
    headerElem.append(titleElem);
    return headerElem;
  }

  createMain(): HTMLElement {
    const mainElem = document.createElement('main');
    mainElem.classList.add('main');
    return mainElem;
  }

  createRulesDiv(): HTMLDivElement {
    const rulesDiv = BaseHtmlBuilder.createDefaultDiv(['rules']);
    rulesDiv.innerHTML = '<h3>Some Rules:</h3>'
      + '<p>1. Please, stop the engine of each car or reset them all before race.</p>'
      + '<p>2. The winner is detected when a rear part of the car has crossed the flag icon.</p>'
      + '<p>3. If you try to use pagination while racing, the race will be reset.</p>';
    return rulesDiv;
  }

  createFooter(): HTMLElement {
    const footerElem = document.createElement('footer');
    footerElem.classList.add('footer');

    const githubLinkElem = document.createElement('a');
    githubLinkElem.classList.add('footer__github-link');
    githubLinkElem.href = 'https://github.com/DDD-fx';
    githubLinkElem.title = 'GitHub';
    githubLinkElem.textContent = '© DDD-fx';

    const yearElem = document.createElement('p');
    yearElem.textContent = '2022';

    const logoLinkElem = document.createElement('a');
    logoLinkElem.classList.add('footer__logo-link');
    logoLinkElem.href = 'https://rs.school/js/';

    footerElem.append(githubLinkElem, yearElem, logoLinkElem);
    return footerElem;
  }

  static createDefaultDiv(className: string[], text = ''): HTMLDivElement {
    const div = document.createElement('div');
    className.forEach((name) => div.classList.add(name));
    if (text) div.textContent = text;
    return div;
  }

  static createDefaultInput(className: string, type = '', placeHolder = ''): HTMLInputElement {
    const input = document.createElement('input');
    input.classList.add(className, className.slice(3));
    if (type) input.type = type;
    if (placeHolder) input.placeholder = placeHolder;
    return input;
  }

  static createDefaultBtn(className: string, text: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.classList.add(className, className.slice(3), 'btn');
    btn.innerHTML = text;
    return btn;
  }

  static setIDs(elems: Element[], id: string): void {
    elems.forEach((el) => el.setAttribute('id', `${el.classList[0]}-${id}`));
  }

  static createCarSvg(color: string): string {
    return `<?xml version="1.0" encoding="iso-8859-1"?>
    <svg version="1.1" class="car" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
    viewBox="-1 6 22 8" style="fill:${color}; stroke:black; stroke-width:0.3;" xml:space="preserve">
    <g><path d="M20.07,10.102c0,0-0.719-1.593-5.363-1.53c0,0-4.626-4.644-13.986,0.582
    c0,0,0.205,1.018-0.566,1.018c-0.159,0.765-0.322,1.769,0.203,2.294c1.146,0,1.257,0,1.266,0c-0.028-0.123-0.044-0.25-0.044-0.381
    c0-0.951,0.771-1.722,1.722-1.722s1.722,0.771,1.722,1.722c0,0.131-0.016,0.258-0.044,0.381h0.268h8.357h1.119
    c-0.027-0.123-0.043-0.25-0.043-0.381c0-0.951,0.771-1.722,1.721-1.722c1.297,0,2.037,1.318,1.906,2.092l1.762-0.182
    C19.801,10.687,20.07,10.102,20.07,10.102z M6.936,8.835H2.829c0,0,1.703-0.798,4.107-1.261V8.835z M7.827,8.835V7.427
    c3.442-0.498,6.143,1.408,6.143,1.408H7.827z"/>
    <path style="fill:orange;" d="M16.402,10.742c-0.734,0-1.33,0.595-1.33,1.33c0,0.733,0.596,1.329,1.33,1.329
    s1.514-0.596,1.514-1.329C17.916,11.336,17.137,10.742,16.402,10.742z M16.402,12.582c-0.283,0-0.512-0.229-0.512-0.511
    s0.229-0.512,0.512-0.512c0.281,0,0.512,0.229,0.512,0.512C16.914,12.353,16.683,12.582,16.402,12.582z"/>
    <path style="fill:lightgreen;" d="M3.268,10.742c-0.734,0-1.329,0.595-1.329,1.33c0,0.733,0.595,1.329,1.329,1.329
    c0.735,0,1.33-0.596,1.33-1.329C4.597,11.336,4.003,10.742,3.268,10.742z M3.268,12.582c-0.282,0-0.512-0.229-0.512-0.511
    s0.23-0.512,0.512-0.512s0.512,0.229,0.512,0.512C3.78,12.353,3.55,12.582,3.268,12.582z"/></g></svg>`;
  }

  static createModalWrapper(): HTMLDivElement {
    return BaseHtmlBuilder.createDefaultDiv(['js-error-wrapper', 'error-wrapper']);
  }

  static showMsgModal(errText: CallbackArgType): void {
    const wrapper = document.getElementsByClassName('js-error-wrapper')[0] as HTMLDivElement;
    const modal = BaseHtmlBuilder.createDefaultDiv(['js-error-msg', 'error-msg']);
    modal.style.display = 'block';
    modal.textContent = String(errText);
    wrapper.prepend(modal);
    setTimeout(() => {
      modal.style.display = 'none';
    }, 7000);
  }

  static createAddCarErrMsg(): HTMLDivElement {
    const carCheckModal = BaseHtmlBuilder.createDefaultDiv(['js-add-car-error', 'add-car-error']);
    carCheckModal.style.display = 'none';
    return carCheckModal;
  }

  static createUpdateCarErrMsg(): HTMLDivElement {
    const updateCarCheckModal = BaseHtmlBuilder.createDefaultDiv(['js-update-car-error', 'add-update-error']);
    updateCarCheckModal.style.display = 'none';
    return updateCarCheckModal;
  }

  static showInputErrMsg(action: ActionEnum) {
    const addCarCheckModal = document.getElementsByClassName('js-add-car-error')[0] as HTMLDivElement;
    const updateCarCheckModal = document.getElementsByClassName('js-update-car-error')[0] as HTMLDivElement;
    if (action === ActionEnum.Add) {
      addCarCheckModal.style.display = 'block';
      addCarCheckModal.textContent = 'Please specify car name';
      setTimeout(() => {
        addCarCheckModal.style.display = 'none';
      }, 3000);
    }
    if (action === ActionEnum.Update) {
      updateCarCheckModal.style.display = 'block';
      updateCarCheckModal.textContent = 'Please select the car';
      setTimeout(() => {
        updateCarCheckModal.style.display = 'none';
      }, 3000);
    }
  }
}
