import './styles/main.scss';
import { startApp } from './ui/app';
import { createElement } from './ui/dom';

const root = createElement('div', { className: 'app' });

document.body.append(root);
startApp(root);
