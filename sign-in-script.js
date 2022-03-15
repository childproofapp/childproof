
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyCo-n5y_cnjemJf0Nj0MEJ2ew-X0AvSjnY",
    authDomain: "masters-thesis-efd56.firebaseapp.com",
    projectId: "masters-thesis-efd56",
    storageBucket: "masters-thesis-efd56.appspot.com",
    messagingSenderId: "268824426727",
    appId: "1:268824426727:web:dfce25b5178c5190c10a42",
    measurementId: "G-SFTG5E0JWG"
};
  
// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

if (localStorage.getItem("data") === null) {
    localStorage.setItem("data", "")
}


var Storage;
Storage = {
  local: {
    get: function (cb,key) {
      let data = window.localStorage.getItem("data");
      data = JSON.parse(data);
      if (typeof key == 'undefined') {
        cb(data);
      } else { 
        cb(data[key]);
      }
    },
    set: function (val, cb) {
      var orig_data = {}
      try {
         orig_data = JSON.parse(window.localStorage.getItem("data"));
      } catch (error) {
        console.log("error ukladani")
      }
      var new_data = Object.assign(orig_data, val)
      window.localStorage.setItem("data", JSON.stringify(new_data))
      cb && cb();
    }
  }
};

chrome.storage = Storage;


const button = document.getElementById('login');


document.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    console.log("kliknuto");

    const email = document.querySelector('#email').value;
    const pass = document.querySelector('#password').value;

    if (email && pass) {
        // send message to background script with email and password
        payload = {email, pass}
        console.log(payload)
        flip_user_status(true, payload)
        .then(function (res) {
                if (res === 'success')
                    window.location.replace('./sign-out.html');
            })
        .catch(err => console.log(err));
        
    } else {
    document.querySelector('#email').placeholder = "Enter an email.";
    document.querySelector('#password').placeholder = "Enter a password.";
    document.querySelector('#email').style.backgroundColor = 'red';
    document.querySelector('#password').style.backgroundColor = 'red';
    document.querySelector('#email').classList.add('white_placeholder');
    document.querySelector('#password').classList.add('white_placeholder');
}
});

//AAAAAAAAAAAAAAAAA


function flip_user_status(signIn, user_info) {
    console.log(user_info)
    if (signIn) {
        return fetch('https://childproof-extension.herokuapp.com/login', {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa(`${user_info.email}:${user_info.pass}`),
                "Content-Type" : "application/json"
            }
        })
            .then(res => {
                res.json().then(function (data) {
                    let blocked = []
                    for(i = 0; i < data.pages.pages.length; i++) {
                        blocked.push(data.pages.pages[i].page)
                    }
                    chrome.storage.local.set({ blocked });

                    let set_groups = []

                    if (typeof data.groups == "undefined" || data.groups === null) {
                        chrome.storage.local.set({ groups: set_groups });
                    } else {
                        for(i= 0; i < data.groups.length; i++){
                            set_groups.push(data.groups[i])
                        }
                        chrome.storage.local.set({ groups: set_groups });
                    }

                    empty_limit_json = {ctvrtek:"",nedele:"",patek:"",pondeli:"",sobota:"",streda:"",utery:""}

                    let limit_json = data.daily_limits.limit_json
                    if (typeof data.daily_limits == "undefined" || data.daily_limits === null) {
                        chrome.storage.local.set({ daily_limits: {limit_json: empty_limit_json} });
                    } else {
                        chrome.storage.local.set({ daily_limits: {limit_json} });
                    }
                    
                    
                });

                return new Promise(resolve => {
                    if (res.status !== 200) resolve('fail')

                    chrome.storage.local.set({ userStatus: signIn, user_info }, function (response) {
                        if (res.status !== 200) resolve('fail');

                        user_signed_in = signIn;

                        resolve('success');
                    });

                })

            })
            .catch(err => console.log(err),blip())
            
    } else if (!signIn) {
        return new Promise(resolve => {
            chrome.storage.local.get(['userStatus', 'user_info'], function (response) {
                console.log(response);
                if (res.status !== 200) resolve('fail');

                if (response.userStatus === undefined) resolve('fail');

                fetch('https://childproof-extension.herokuapp.com/logout', { //https://childproof-extension.herokuapp.com/logout
                    method: 'GET',
                    headers: {
                        'Authorization': 'Basic ' + btoa(`${response.user_info.email}:${response.user_info.pass}`)
                    }
                })
                    .then(res => {
                        console.log(res);
                        if (res.status !== 200) resolve('fail');

                        chrome.storage.local.set({ userStatus: signIn, user_info: {} }, function (response) {
                            if (res.status !== 200) resolve('fail');

                            user_signed_in = signIn;
                            resolve('success');
                        });
                    })
                    .catch(err => console.log(err));
            });
        });
    }
}


//AAAAAAAAAAAAAAAAAAAa


function blip() {
    document.getElementById('login-fail').style.display = 'block';
    setTimeout(function() {
        document.getElementById('login-fail').style.display = 'none';
    }, 3000);
}





//
//function prepareGoogleSignIn() {
//    var provider = new firebase.auth.GoogleAuthProvider();
//    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
//  
//    document.querySelector('#login-google').addEventListener('click', function (ev) {
//        ev.preventDefault();
//        firebaseApp.auth()
//        .signInWithPopup(provider)
//        .then((result) => {
//            /** @type {firebase.auth.OAuthCredential} */
//            var credential = result.credential;
//  
//            // This gives you a Google Access Token. You can use it to access the Google API.
//            var token = credential.accessToken;
//            // The signed-in user info.
//            var user = result.user;
//            if (user) {
//              console.log('USER FIREBASE', user, credential)
//              // send message to background script with email and password
//              chrome.runtime.sendMessage({
//                  message: 'login_google',
//                  payload: { googleUserId: user.uid }
//              },
//                  function (response) {
//                      if (response === 'success') {
//                        console.log('LOGGED IN with google')
//                        window.location.replace('./popup-sign-out.html');
//                      } else {
//                          // Kdyz neexistuje ucet, tak registruj
//                          
//                            chrome.runtime.sendMessage({
//                                message: 'register_google',
//                                payload: { googleUserId: user.uid }
//                            },
//                                function (response) {
//                                    if (response === 'success') {
//                                    console.log('REGISTERED with google')
//                                    // TODO continue to login_google again
//                                    //window.location.replace('./popup-sign-out.html');
//                                    }
//                                }
//                            );
//                      }
//                  }
//              )
//            }
//            // ...
//        }).catch((error) => {
//            // Handle Errors here.
//            var errorCode = error.code;
//            var errorMessage = error.message;
//            // The email of the user's account used.
//            var email = error.email;
//            // The firebase.auth.AuthCredential type that was used.
//            var credential = error.credential;
//            // TODO zobraz error
//            console.log(errorCode, errorMessage, email, credential, error)
//        });
//  
//    });
//  }
//  
//  prepareGoogleSignIn();
//  
//