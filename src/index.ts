import './styles/styles.scss';
import Model from './model/model';
import View from './view/view';
import Controller from './controller/controller';
import { createGaragePageQuery } from './functions';

window.addEventListener('load', async () => {
  const model = new Model();
  await model.getGarageCars(createGaragePageQuery()).catch((err) => console.error(err));

  const view = new View(model);
  view.combineView();
  const winnersBlock = document.getElementsByClassName('winners')[0] as HTMLDivElement;
  winnersBlock.style.display = 'none';
  view.rebuildList();

  (() => new Controller(model, view))();
});
