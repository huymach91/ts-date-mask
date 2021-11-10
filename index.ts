// Import stylesheets
import { DateMask } from './date-mask';
import './style.css';

// Write TypeScript code!
const appDiv: HTMLInputElement = document.getElementById('app');

new DateMask(appDiv);
