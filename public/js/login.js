
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

 const login = async (email, password) => {
    try{
    const test = await axios({
        method:'POST',
        url:'http://127.0.0.1:3000/api/v1/users/sigin',
        data: {
            email,
            password
        }
    });
    
    if (test.data.status === 'success'){
        showAlert('success','you Login successfuly');
        window.setTimeout(()=>{
            location.assign('/')
        },1000)
    }
    //console.log(test)
    } catch(err) {
        showAlert('error',err.response.data.message);
        
    };
    
}
const logOut = async (req, res, next) =>{
    console.log('hellow from logout')
    
     try{
    const result = await axios({
        method:'GET',
        url:'http://127.0.0.1:3000/api/v1/users/logout',

    });
    console.log(result);
    if(result.data.status === 'success') 
        location.reload(true);
} catch(err) {
    showAlert('there is a problem happened when you try logout pleas try again later')
    console.log(err)
}
}
const form = document.querySelector('.form--login');
const logoutBtun = document.querySelector('.nav__el--out');
if(form){
    form.addEventListener('submit', e => {
    e.preventDefault();
     const email = document.getElementById('email').value;
        const password =document.getElementById('password').value;
        console.log('email and pass', email , password)
        login(email, password);
        });}

if (logoutBtun){
logoutBtun.addEventListener('click', e => {
    e.preventDefault(); 
    logOut(); 
});}
