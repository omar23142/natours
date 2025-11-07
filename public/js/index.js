//import 'babel/@polyfill'
import {login} from './login'
import { displayMap } from './mapbox';

const mapBox = document.getElementById('map');
const formBox =document.querySelector('.form');


if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    console.log(locations);
    displayMap(locations);
}

if (formBox) {
    formBox.addEventListener('submit', e => {
    e.preventDefault();});
    const email = document.getElementById('email').value;
    const password =document.getElementById('password').value;
    console.log('email and pass', email , password)
    login(email, password);
    };
    
