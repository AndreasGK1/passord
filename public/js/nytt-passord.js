
function nyttPassord(){
    console.log(window.location.search)

let search = window.location.search;

let email = search.slice(7,)

console.log(email)

let passord = document.getElementById("password").value
console.log(passord)

axios.get('/nyttpassord', {
    params: {
     epost: email, 
     passord: passord,
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
}


// ?email=andreas.kjolso@gmail.com