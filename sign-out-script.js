
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
console.log(firebaseApp)

const messaging = firebase.messaging();


const askForPermissionToReceiveNotifications = async () => {
  try {
    const messaging = firebase.messaging();
    await messaging.requestPermission();
    const token = await messaging.getToken();
    console.log('Your token is:', token);
    saveToken(token)
    return token;
  } catch (error) {
    console.error(error);
  }
}

askForPermissionToReceiveNotifications()

function saveToken(token) {
  new Promise(resolve => {
    chrome.storage.local.get(function(data){
      login_mail = data.user_info.email
      login_pass = data.user_info.pass
    })
    fetch('https://childproof-extension.herokuapp.com/token', { //https://childproof-extension.herokuapp.com/logout
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${login_mail}:${login_pass}`),
            'body': token
        }
    })
        .then(res => {console.log("Push token saved to database")},resolve("success"))
        
        .catch(err => console.log(err),resolve("fail"));
  })
}


messaging.onMessage(payload => {
  console.log("Message received. ", payload);
  const { title, ...options } = payload.notification;
});

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



//Start of file

const button_logout = document.getElementById('logout');

const update = document.getElementById('update');

const limits = document.getElementById('daily_limits');

//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA


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

                  //setTimeout(() => {
                  //    if (data.googleId == null) {
                  //        chrome.runtime.sendMessage({
                  //            message: 'accountNotPaired'
                  //        })
                  //    }
                  //}, 500)   DISABLNUTO PAROVANI V PWA
                  
                  
              });

              return new Promise(resolve => {
                  if (res.status !== 200) resolve('fail')

                  chrome.storage.local.set({ userStatus: signIn, user_info }, function (response) {
                      if (chrome.runtime.lastError) resolve('fail');

                      user_signed_in = signIn;

                      resolve('success');
                  });

              })

          })
          .catch(err => console.log(err));
  } else if (!signIn) {
      return new Promise(resolve => {
        localStorage.setItem("ODHLASENI", "ODHLASENO")
          chrome.storage.local.get(['userStatus', 'user_info'], function (response) {
              console.log(response);
              if (chrome.runtime.lastError) resolve('fail');

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
                          if (chrome.runtime.lastError) resolve('fail');

                          user_signed_in = signIn;
                          resolve('success');
                      });
                  })
                  .catch(err => console.log(err));
          });
      });
  }
}

//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA





button_logout.addEventListener('click', () => {
  email = JSON.parse(localStorage.getItem("data")).user_info.email
  pass = JSON.parse(localStorage.getItem("data")).user_info.pass
  obj_payload = {email, pass}
  payload = JSON.stringify(obj_payload)
  console.log(payload)
  flip_user_status(true, obj_payload)
  .then(function (response) {
    if (response === 'success')
      window.location.replace('./sign-in');
  })
  .catch(err => console.log(err));
});



        


/* nefunguje s login pres google
chrome.storage.local.get(function (data) {
  if (data.userStatus == false) {
    window.location.replace('./popup-sign-in.html');
  }
})*/
/*=====================================================================*
*                             Filters                                  *
*======================================================================*/


const new_filter_input = document.getElementById('new_filter_input');
const new_group_filter_input_card = document.getElementById('new_group_filter_input_card');


//zacit s zadnou classou v html
document.getElementById('new_filter_span').addEventListener('click', () => {
  new_filter_input.classList.toggle("slide-in")
  new_filter_input.classList.toggle("slide-out")
  new_filter_input.style.display = "block";
})

document.getElementById('close_new_filter_card').addEventListener('click', () => {
  new_filter_input.classList.toggle("slide-out")
  new_filter_input.classList.toggle("slide-in")
  new_filter_input.style.display = "block";
})

document.getElementById('new_group_span').addEventListener('click', () => {
  new_group_filter_input_card.classList.toggle("slide-in")
  new_group_filter_input_card.classList.toggle("slide-out")
  new_group_filter_input_card.style.display = "block";
})

document.getElementById('close_new_group_card').addEventListener('click', () => {
  new_group_filter_input_card.classList.toggle("slide-out")
  new_group_filter_input_card.classList.toggle("slide-in")
  new_group_filter_input_card.style.display = "block";
})




const textarea = document.getElementById("textarea");
const save = document.getElementById("save");
const checkbox = document.getElementById("checkbox");


let new_filter_input_field = document.getElementById('new_filter_input_field');
const confirm_add_filter = document.getElementById('confirm_add_filter');






//pridani novych filtru do seznamu
function add_to_list() {
  var node = document.createElement("li");
  node.innerHTML = '<span class="filter_entry"><img id="filter_favicon" src="https://www.google.com/s2/favicons?sz=64&domain_url=' + new_filter_input_field.value + '"><span>' + new_filter_input_field.value + '</span><div class="filter_options"><div class="filter_options_button"></div><div class="filter_options_menu"><span class="edit_filter">✏️</span><span class="remove_filter">🗑️</span></div></span></div>';
  document.getElementById('filter_list').appendChild(node);
  node.className = "new_filter_entry";
  new_filter_input_field.value = ""
}

//nepridava prazdny input, mohou byt duplikaty
confirm_add_filter.addEventListener("click", () => {
  if (new_filter_input_field.value != "") {
    add_to_list();
    save_filters_database();
  } else {
    console.log("Empty value");
  }
});

//vyplneni listu ulozenou hodnotou
function fill_blocked_list() {
  document.getElementById("filter_list").innerHTML = "";
  chrome.storage.local.get(function (data) {
    console.log("data", data);
    for (let i = 0; i < data.blocked.length; i++) {
      var node = document.createElement("li");



      node.innerHTML = '<span class="filter_entry"><img id="filter_favicon" src="https://www.google.com/s2/favicons?sz=64&domain_url=' + data.blocked[i] + '"><span>' + data.blocked[i] + '</span><div class="filter_options"><div class="filter_options_button"></div><div class="filter_options_menu"><span class="edit_filter">✏️</span><span class="remove_filter">🗑️</span></div></span></div>';
      document.getElementById('filter_list').appendChild(node);
      node.className = "new_filter_entry";
    }
  })
}

fill_blocked_list();

//AAAAAAAAAAAAAAAAA
function save_filter(request) {
  return new Promise(resolve => {
      chrome.storage.local.get(function (data) {
        console.log(data.user_info.email)
          fetch('https://childproof-extension.herokuapp.com/filter/save', {
              method: 'POST',
              headers: {
                  'Authorization': 'Basic ' + btoa(`${data.user_info.email}:${data.user_info.pass}`),
                  'body': request
              }
          })
              .then(res => {
                  resolve('success');
              })
              .catch(err => console.log(err));
      })
  });
};
//AAAAAAAAAAAAAAAAA



//ukladani dat do samostatne funkce a nastrkat ji vsude po pridavani/editovani/mazani filtru
function save_filters_database() {
  let elements = document.getElementById('filter_list').children
  let blocked = []
  for (let i = 0; i < document.getElementById("filter_list").getElementsByTagName("li").length; i++) {
    blocked.push(elements.item(i).getElementsByTagName("span").item(0).getElementsByTagName("span").item(0).innerText) //.innerText.slice(0, -3)
  }
  chrome.storage.local.set({ blocked });

  save_filter(blocked)
}

//odeslani filtru do databaze
save.addEventListener("click", () => {
  save_filters_database()
});

checkbox.addEventListener("change", (event) => {
  const enabled = event.target.checked;
  chrome.storage.local.set({ enabled });
});

//odstraneni filtru & editace filtru
// pridat ukladani do databaze rovnou aby se nemuselo klikat na save
window.onclick = e => {
  if (e.target.className == "remove_filter" || e.target.className == "remove_group") {
    if (e.target.className == "remove_filter") {
      e.target.parentElement.parentElement.parentElement.parentElement.remove();
    }
    save_filters_database()
    save_group_filters()
    
    console.log("save_gorup_filters po odstraneni")

    //odebrat vysledek z blocked arraye aby se nemuseli vysledky ukladat rucne

  } else if (e.target.classList.contains("edit_filter") || e.target.classList.contains("edit_group_name")) {

    if (e.target.parentElement.parentElement.parentElement.classList.contains("group_wrapper")) {
      for (i = 0; i < e.target.parentElement.parentElement.parentElement.getElementsByClassName("group_single_page_options").length; i++) {
        e.target.parentElement.parentElement.parentElement.getElementsByClassName("group_single_page_options").item(i).classList.toggle("visible")
      }
    }

    if (e.srcElement.classList.contains("filter_edit_active")) {
      let sel = e.srcElement;
      e.srcElement.parentElement.parentElement.parentElement.getElementsByTagName("span").item(0).innerText = e.srcElement.parentElement.parentElement.parentElement.getElementsByClassName("filter_edit_input").item(0).value
      e.srcElement.parentElement.parentElement.parentElement.getElementsByClassName("filter_edit_input").item(0).remove();
      e.srcElement.parentElement.parentElement.parentElement.getElementsByTagName("span").item(0).style = "display: inline-block;"
      sel.classList.remove("filter_edit_active")
      sel.innerText = "✏️"

      if (e.target.classList.contains("edit_filter")) {
        save_filters_database()
      }

    } else {
      let parent_element = e.srcElement.parentElement.parentElement.parentElement.getElementsByTagName("span").item(0)
      let parent_element_path = e.srcElement.parentElement.parentElement.parentElement
      let filter_text = parent_element.innerText //e.srcElement.previousSibling.innerText
      e.srcElement.innerText = "✔️"
      parent_element.style = "display: none;"
      e.srcElement.classList.add("filter_edit_active")

      var node = document.createElement("input");
      node.value = filter_text;
      parent_element_path.insertBefore(node, parent_element_path.firstChild);
      node.className = "filter_edit_input";
    }
  } else if (e.target.id == "add_page_row") {// BACHA NA TO !!!!! SrcElement je zastarale, ted se pouziva jenom TARGET!!!! https://developer.mozilla.org/en-US/docs/Web/API/Event/srcElement
    var node = document.createElement("div");
    node.innerHTML = document.getElementsByClassName("page_input_entry").item("0").innerHTML
    e.target.parentElement.parentElement.appendChild(node);
    node.className = "page_input_entry";
    node.ariaPlaceholder = "Page name";
  } else if (e.target.classList.contains("filter_options_button")) {
    e.target.nextSibling.classList.toggle("visible");
  }

  if (e.target.classList.contains("remove_page")) {
    e.target.parentElement.parentElement.remove();
  }

  if (e.target.className == "remove_group") {
    console.log("druha podminka")

    let group_filter_block_name = e.target.closest(".group_wrapper").getElementsByClassName("group_entry").item(0).innerText
    for (let i = 0; i < document.getElementsByClassName("new_filter_entry").length; i++) {
      if (document.getElementById("group_list").getElementsByClassName("new_filter_entry").item(i).getElementsByClassName("group_entry").item(0).innerText == group_filter_block_name) {
        e.target.parentElement.parentElement.parentElement.parentElement.remove();
        chrome.storage.local.get(function (data) {
          data.groups.splice(i, 1);
          chrome.storage.local.set({ groups: data.groups }, save_groups(JSON.stringify(data.groups))) // TOHLE DO APPKY
        })
      }
    }

    // PROC TO NEJDE ZAVOLAT TADY?? ANI CONSOLE LOG SE NEPROPISE....
  }
}



// Filter search
search_input = document.getElementById("search_input")
search_input.addEventListener("keyup", () => {
  // Declare variables
  var input, filter, ul, li, span, i, txtValue;
  input = document.getElementById('search_input');
  filter = input.value.toUpperCase();
  ul = document.getElementById("filter_list");
  li = ul.getElementsByTagName('li');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    span = li[i].getElementsByTagName("span")[0];
    txtValue = span.textContent || span.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
})

/*=====================================================================*
*                            Group Filters                             *
*======================================================================*/

const confirm_group = document.getElementById("confirm_add_group")
const new_group_span = document.getElementById("new_group_span")


//opopulovani group elementu

function populate_group_filters() {
  chrome.storage.local.get(function (data) {
    if (typeof data.groups === typeof undefined) {
      chrome.storage.local.set({ groups: [] })
    } else {
      document.getElementById("group_list").innerHTML = ""  ///TOHLE DO APKY
      for (let i = 0; i < data.groups.length; i++) {
        var node = document.createElement("li");
        node.innerHTML = '<div class="group_wrapper"><span class="group_entry">' + data.groups[i].name + '</span><div class="filter_options"><div class="filter_options_button"></div><div class="filter_options_menu"><span class="edit_group_name">✏️</span><span class="remove_group">🗑️</span></div></span></div>';
        document.getElementById('group_list').appendChild(node);
        node.className = "new_filter_entry";
        for (x = 0; x < data.groups[i].pages[0].length; x++) {
          var node = document.createElement("div");
          node.innerHTML = '<span>' + data.groups[i].pages[0][x] + '</span><div class="group_single_page_options"><span class="remove_page">❌</span></div>'; //<span class="edit_group_single_page">✏️</span>
          document.getElementsByClassName('group_wrapper').item(i).appendChild(node);
          node.className = "group_page";
        }
      }
    }
  })
}

populate_group_filters();

new_group_span.addEventListener("click", () => {
  document.getElementsByClassName("new_group_filter_div").item("0").classList.toggle("visible");
})

function save_group_filters() {
  let group_name_input = document.getElementById("new_group_input_field").value
  let group_pages_inputs = document.getElementsByClassName("group_page_input")
  console.log(group_name_input)
  let group_pages = []

  for (i = 0; i < group_pages_inputs.length; i++) {
    group_pages.push(group_pages_inputs[i].value)
  }

  let new_group = {
    "name": group_name_input,
    "pages": [
      group_pages
    ]
  }

  if (group_name_input === "") {
    console.log("Empty input")
  } else { //sem se to nedostane pri odstarnovani pokud je prazdny input
    chrome.storage.local.get(function (data) {
      data.groups.push(new_group)
      chrome.storage.local.set({ groups: data.groups }, populate_group_filters)
      document.getElementById("new_group_input_field").value = ""  ///TOHLE DO APKY

      save_groups(JSON.stringify(data.groups))

    })
  }
}

confirm_group.addEventListener("click", () => {
  document.getElementById("group_list").innerHTML = ""
  save_group_filters()
});

function save_groups(request) {
  console.log("POSILAM DO DB: ", request)
  return new Promise(resolve => {
      chrome.storage.local.get(function (data) {
          fetch('https://childproof-extension.herokuapp.com/groups/save', {
              method: 'POST',
              headers: {
                  'Authorization': 'Basic ' + btoa(`${data.user_info.email}:${data.user_info.pass}`),
                  'body': request
              }
          })
              .then(res => {
                  console.log(res);
                  resolve('success');
              })
              .catch(err => console.log(err));
      })
  });
};


/*=====================================================================*
*                            Daily limit                               *
*======================================================================*/


//update.addEventListener("click", () => {
//  chrome.runtime.sendMessage({ message: 'update' },
//    //window.location.reload() NEMUSIM RELOADOVAT PROTOZE NEPOUSTIM TIMER
//  )
//});

function save_daily_limits(request) {
  console.log(request)
  console.log(JSON.stringify(request))
  return new Promise(resolve => {
      chrome.storage.local.get(function (data) {
        console.log(data.user_info.email)
          fetch('https://childproof-extension.herokuapp.com/time_limits/save', {
              method: 'POST',
              headers: {
                  'Authorization': 'Basic ' + btoa(`${data.user_info.email}:${data.user_info.pass}`),
                  'body': JSON.stringify(request)
              }
          })
              .then(res => {
                  resolve('success');
              })
              .catch(err => console.log(err));
      })
  });
};

limits.addEventListener("click", () => {
  var limit_json = {
    pondeli: document.getElementById('monday_time').value,
    utery: document.getElementById('tuesday_time').value,
    streda: document.getElementById('wednesday_time').value,
    ctvrtek: document.getElementById('thursday_time').value,
    patek: document.getElementById('friday_time').value,
    sobota: document.getElementById('saturday_time').value,
    nedele: document.getElementById('sunday_time').value,
  }

  save_daily_limits(limit_json)
  
  chrome.storage.local.set({ daily_limits: limit_json, countdown: 'initialization' }, function (response) {
    console.log("Time limits saved to local storage")
  });
  //chrome.runtime.reload();

});

window.addEventListener("DOMContentLoaded", () => {
  //  chrome.storage.local.get(["blocked", "enabled"], function (local) {
  //  const { blocked, enabled } = local;
  //  if (Array.isArray(blocked)) {
  //    textarea.value = blocked.join("\n");
  //    checkbox.checked = enabled;
  //  }
  //});

  chrome.storage.local.get( function (data) {
    if (typeof data.daily_limits == 'undefined') {
      console.log("No daily limits set")
    } else {
      document.getElementById('monday_time').value = data.daily_limits.limit_json.pondeli;
      document.getElementById('tuesday_time').value = data.daily_limits.limit_json.utery;
      document.getElementById('wednesday_time').value = data.daily_limits.limit_json.streda;
      document.getElementById('thursday_time').value = data.daily_limits.limit_json.ctvrtek;
      document.getElementById('friday_time').value = data.daily_limits.limit_json.patek;
      document.getElementById('saturday_time').value = data.daily_limits.limit_json.sobota;
      document.getElementById('sunday_time').value = data.daily_limits.limit_json.nedele;
    }
  });
});

/*=====================================================================*
*                         Page functionality                           *
*======================================================================*/


const opt_1 = document.getElementById('filter-settings');
const opt_2 = document.getElementById('group-filters');
const opt_3 = document.getElementById('daily-limits-settings');
const opt_4 = document.getElementById('monitoring-settings');


opt_1.addEventListener('click', () => {
  document.getElementById('page-filters').style.display = 'block';
  document.getElementById('group-filters-panel').style.display = 'none';
  document.getElementById('daily-limits-content').style.display = 'none';
  document.getElementById('monitoring-panel').style.display = 'none';
  document.getElementById('line').style.margin = '0 0 0 0';
});

opt_2.addEventListener('click', () => {
  document.getElementById('page-filters').style.display = 'none';
  document.getElementById('group-filters-panel').style.display = 'block';
  document.getElementById('daily-limits-content').style.display = 'none';
  document.getElementById('monitoring-panel').style.display = 'none';
  document.getElementById('line').style.margin = '0 0 0 25%';
});

opt_3.addEventListener('click', () => {
  document.getElementById('page-filters').style.display = 'none';
  document.getElementById('group-filters-panel').style.display = 'none';
  document.getElementById('daily-limits-content').style.display = 'block';
  document.getElementById('monitoring-panel').style.display = 'none';
  document.getElementById('line').style.margin = '0 0 0 50%';
});

opt_4.addEventListener('click', () => {
  document.getElementById('page-filters').style.display = 'none';
  document.getElementById('group-filters-panel').style.display = 'none';
  document.getElementById('daily-limits-content').style.display = 'none';
  document.getElementById('monitoring-panel').style.display = 'block';
  document.getElementById('line').style.margin = '0 0 0 75%';
});


//function prepareGooglePair() {
//  var provider = new firebase.auth.GoogleAuthProvider();
//  provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
//
//  document.querySelector('#pair-google').addEventListener('click', function (ev) {
//    ev.preventDefault();
//    firebaseApp.auth()
//      .signInWithPopup(provider)
//      .then((result) => {
//        /** @type {firebase.auth.OAuthCredential} */
//        var credential = result.credential;
//
//        // This gives you a Google Access Token. You can use it to access the Google API.
//        var token = credential.accessToken;
//        // The signed-in user info.
//        var user = result.user;
//        if (user) {
//          console.log('USER FIREBASE', user, credential)
//          // send message to background script with email and password
//          chrome.runtime.sendMessage({
//            message: 'pair_google',
//            payload: { googleUserId: user.uid }
//          },
//            function (response) {
//              if (response === 'success') {
//                console.log('Successfully paired with Google account')
//                // TODO refreshni ze je sparovany. Smazatv tlacitko sparovat s google!!
//              }
//            }
//          )
//        }
//        // ...
//      }).catch((error) => {
//        // Handle Errors here.
//        var errorCode = error.code;
//        var errorMessage = error.message;
//        // The email of the user's account used.
//        var email = error.email;
//        // The firebase.auth.AuthCredential type that was used.
//        var credential = error.credential;
//        // show error
//        console.log(errorCode, errorMessage, email, credential, error)
//      });
//
//  });
//}
//
//prepareGooglePair();


//monitoring


var graph_visible = false


new Promise(resolve => {
  chrome.storage.local.get(function (data) {
      fetch('https://childproof-extension.herokuapp.com/time', {
          method: 'get',
          headers: {
              'Authorization': 'Basic ' + btoa(`${data.user_info.email}:${data.user_info.pass}`),
          }
      })
          .then(res => {
              res.json()
              .then(serverData => {var databaseTrackedWeek = JSON.parse(serverData.results[0].TRACKING_TIME)
                  if(!databaseTrackedWeek) {
                      console.log("Empty database")
                  } else {
                      chrome.storage.local.set({tracked_time: databaseTrackedWeek, lastUser: data.user_info.email})
                      console.log("OBDRZENA GRAF DATA: ",databaseTrackedWeek)
                      create_graph(databaseTrackedWeek)
                  }
              })
              resolve('success');
          })
          .catch(err => console.log(err));
  }
)})

function create_graph(data){
  console.log("OBDRZENA GRAF DATA: ",JSON.stringify(data))
  const map1 = new Map();

    map1.set(0, data[0]);
    map1.set(1, data[1]);
    map1.set(2, data[2]);
    map1.set(3, data[3]);
    map1.set(4, data[4]);
    map1.set(5, data[5]);
    map1.set(6, data[6]);

    var current_day_number = new Date().getDay()

    var week = []
    var times = []


    for (var i = current_day_number; i < current_day_number + 8; i++) {
      if (week.length == 7) {
        if (graph_visible == true) {
          console.log("Graph updated")
          removeData(myChart)
          addData(myChart, week, times)
        } else {
          console.log("Drawing graph")
          draw_graph(week, times)
        }
        return;
      }

      if (i > 6) {
        i = 0;
      }
      week.push(map1.get(i).weekday)
      times.push(map1.get(i).time)
    }
}



function addData(myChart, label, data) {
  myChart.data.labels.push(label);
  myChart.data.datasets.forEach((dataset) => {
    dataset.data.push(data);
  });
  myChart.update();
}

function removeData(myChart) {
  myChart.data.labels.pop();
  myChart.data.datasets.forEach((dataset) => {
    dataset.data.pop();
  });
  myChart.update();
}

function draw_graph(week, times) {
  graph_visible = true
  const ctx = document.getElementById('myChart').getContext('2d');
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: week,
      datasets: [{
        label: 'Activity (in minutes)',
        data: times,
        backgroundColor: [
          'rgba(71, 151, 255, 0.2)',
          'rgba(71, 151, 255, 0.2)',
          'rgba(71, 151, 255, 0.2)',
          'rgba(71, 151, 255, 0.2)',
          'rgba(71, 151, 255, 0.2)',
          'rgba(71, 151, 255, 0.2)',
          'rgba(71, 151, 255, 0.2)'
        ],
        borderColor: [
          'rgba(71, 151, 255, 1)',
          'rgba(71, 151, 255, 1)',
          'rgba(71, 151, 255, 1)',
          'rgba(71, 151, 255, 1)',
          'rgba(71, 151, 255, 1)',
          'rgba(71, 151, 255, 1)',
          'rgba(71, 151, 255, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

}

var el = document.getElementById('notification');

function incrementNotification() {
  var count = Number(el.getAttribute('data-count')) || 0;
  el.setAttribute('data-count', count + 1);
  el.classList.remove('notify');
  el.offsetWidth = el.offsetWidth;
  el.classList.add('notify');
  if (count === 0) {
    el.classList.add('show-count');
  }
}

el.addEventListener('click', () => {
  document.getElementById("notification-container").classList.toggle("displayed")
})
