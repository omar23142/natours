//import axios from 'axios'
//import {showAlert} from './login'

const hideAlert = () =>{
    const el = document.querySelector('.alert');
    if (el) {
        el.parentElement.removeChild(el);
    }
}

const showAlert = (type, message) =>{
    const markUp = `<div class="alert alert--${type}">${message}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin',markUp);
    window.setTimeout(hideAlert, 5000);
}


const UpdatUserData = async (data, type) => {
    try {
        const url = type=== 'password' ? 'http://127.0.0.1:3000/api/v1/users/updateMypssword' :
            'http://127.0.0.1:3000/api/v1/users/updateMe'
        const results = await axios( {
            method:'PATCH',
            url,
            data
        });
        console.log(results);
        if ( results.data.status === 'success')
            showAlert('success', `${type.toUpperCase()} Updated Successfuly`)
    }catch(err) {
        showAlert('ERROR', err.response.data.message);
    }
}

const userDataForm = document.querySelector('.form-user-data');
const userPassForm = document.querySelector('.form-user-password')

if (userDataForm)
    userDataForm.addEventListener('submit', e=> {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email',document.getElementById('email').value );
        form.append('photo', document.getElementById('photo').files[0]);
        console.log(form);

        UpdatUserData(form, 'data');
    });
if(userPassForm)
    userPassForm.addEventListener('submit', e=>{
        e.preventDefault();
        console.log('in the user passsssssssssssss')
        const passwordCurrent = document.getElementById('password-current').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        const password = document.getElementById('password').value;
        UpdatUserData({passwordCurrent, password, passwordConfirm}, 'password');
        document.getElementById('password-current').value='';
        document.getElementById('password-confirm').value='';
        document.getElementById('password').value='';
    })