
const stripe = Stripe('pk_test_51SOb38D1cgOcIden4MHdhWUDA3DC4LiFGvrLcyLhNVBrpq8AN459Wt71YhsgF2XdujWMdnCJ1xCUd8HWWVgFxKhz005CXxoQpl');

// const hideAlert = () =>{
//     const el = document.querySelector('.alert');
//     if (el) {
//         el.parentElement.removeChild(el);
//     }
// }
//
// const showAlert = (type, message) =>{
//     const markUp = `<div class="alert alert--${type}">${message}</div>`
//     document.querySelector('body').insertAdjacentHTML('afterbegin',markUp);
//     window.setTimeout(hideAlert, 5000);
// }


const getCheckoutSession = async (tourId) => {
    try {
    // get checkout session from api
    const url = `http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`
    const session = await axios( {
        method:'GET',
        url
    })
    // console.log('in the getcheckoutsession')
    console.log(session);
    // 2) creat checkout form and charge creditcard
    await stripe.redirectToCheckout({
        sessionId:session.data.session.id
    }) }catch (err) {
        console.log(err);
        showAlert('error',err);
    }
}

const bookBtooun = document.getElementById('book-tour');


if(bookBtooun)
    // console.log('in the bookbutton');
    bookBtooun.addEventListener('click', e => {
        e.target.textContent = 'processing.......';
       const tourId= e.target.dataset.tourId;
       // console.log('this is tourid', tourId);
        getCheckoutSession(tourId);
    } )