// Model

var model = {
  loggedIn: false,
  first: true,
  user: undefined,
  name: '',
  color: undefined,
  egg: false,
  stuff: false,
  gif: false,
  gifSubmit: false,
  gifUrl: undefined,
  gifWidth: undefined,
  gifHeight: undefined,
  dance: false,
  fedora: false,
  necklace: false,
  shoes: false,
  teddy: false
};

// View

var loginTemplate;

function compileTemplates() {
  var loginSource = $('#login-template').html();
  loginTemplate = Handlebars.compile(loginSource);
}

function renderLogin() {
  var loginHtml = loginTemplate(model);
  $('#loginContainer').html(loginHtml);
}

// Controller

function setup() {
  compileTemplates();
  renderLogin();

  // Event Listeners
  $('#loginContainer').on('click', '#signUp', handleSignUp);
  $('#loginContainer').on('click', '#signIn', handleSignIn);
  $('#loginContainer').on('click', '#guest', handleGuest);
  $('#loginContainer').on('click', '.signOut', handleSignOut);
  $('#loginContainer').on('click', '.signOut2', handleSignOut);

  $('#loginContainer').on('click', '.colors', handleColorChange);
  $('#loginContainer').on('click', '#meetButton', makeDragon);
  $('#loginContainer').on('click', '#startButton', goToGame);

  $('#loginContainer').on('click', '#food', food);
  $('#loginContainer').on('click', '#stuff', stuff);
  $('#loginContainer').on('click', '#gif', gif);
  $('#loginContainer').on('click', '#dance', dance);

  $('#loginContainer').on('click', '#gifSubmit', playGif);
  $('#loginContainer').on('click', '#gifActive', closeGif);  
  $('#loginContainer').on('keydown', '#gifQuery', checkKey); 
  $('#loginContainer').on('click', '.stuffButton', dressUp); 
  $('#loginContainer').on('click', '.stuffActive', dressDown); 

  firebase.auth().onAuthStateChanged(handleAuthStateChange);

}

function handleSignUp() {
  var email = $('input[name="email"]').val();
  var password = $('input[name="password"]').val();
  firebase.auth().createUserWithEmailAndPassword(email, password);
  model.first = true;
//set up error message?
}

function handleSignIn() {
  var email = $('input[name="email"]').val();
  var password = $('input[name="password"]').val();
  firebase.auth().signInWithEmailAndPassword(email, password);
  if (model.name) {
    model.first = false;
  } else {
    model.first = true;
  }
}

function handleGuest() {
  firebase.auth().signInAnonymously();
  model.first = true;
}

function handleSignOut() {
  firebase.auth().signOut();
  model.first = undefined;
}

function handleAuthStateChange() {
  var user = firebase.auth().currentUser;
  if (user) {
    model.loggedIn = true;
    model.user = user;
    firebase.database().ref('dragon/' + model.user.uid).on('value', processDragon);
  } else {
    model.loggedIn = false;
    model.user = undefined;
  }
  renderLogin();
}

function processDragon(snapshot) {
  model.name = snapshot.val().name;
  model.color = snapshot.val().color;
  model.first = snapshot.val().first;
  model.fedora = snapshot.val().fedora;
  model.necklace = snapshot.val().necklace;
  model.shoes = snapshot.val().shoes;
  model.teddy = snapshot.val().teddy;
  renderLogin();
}

function handleColorChange() {
  var currentColor = $(this).attr('data-color');
  $('.colorMe').css('fill', currentColor);
  model.color = currentColor;
}

function makeDragon() {
  var name = $('input[name="name"]').val();
  model.name = name;
  firebase.database().ref('dragon/' + model.user.uid).set({
    name: name,
    color: model.color,
    first: false,
    fedora: false,
    necklace: false,
    shoes: false,
    teddy: false
  });
  model.egg = true;
  model.first = false;
  renderLogin();
  $('.colorMe').css('fill', model.color);
}

function goToGame() {
  model.egg = false;
  firebase.database().ref('dragon/' + model.user.uid).on('value', processDragon);
}

// These are for the interactive buttons in the game

function food() {
  model.stuff = false;
  model.gif = false;
  model.dance = false;
  renderLogin();
  $('#berry').attr('class', 'berryAppear');
  $('#mouth').attr('class', 'eat');
  $('#tail').attr('class', 'wag');
}

function stuff() {
  model.stuff = true;
  model.gif = false;
  model.dance = false;
  renderLogin();

  $('#stuff').on('click', function() {
    model.stuff = false;
    renderLogin();
  });
}

function dressUp() {
  var currentStuff = $(this).attr('data-id');
  firebase.database().ref('dragon/' + model.user.uid).update({
    [currentStuff]: true
  });
}

function dressDown() {
  var currentStuff = $(this).attr('data-id');
  firebase.database().ref('dragon/' + model.user.uid).update({
    [currentStuff]: false
  });
}

function gif() {
  model.stuff = false;
  model.gif = true;
  model.dance = false;
  renderLogin();
  $('#gif').text('Turn Off Gif'); 
}

function closeGif() {
    model.gif = false;
    renderLogin();
    $('#gif').text('Gif Time');
  };

function checkKey(e) {
  if (e.which === 13) {
    playGif();
  }
}

function playGif() {
  var query = $('input[name="query"]').val();
  var query2 = query.replace(/ /g, '+');
  $.get(('https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=' + query2), function(data) {
    var u = data.data.fixed_width_downsampled_url;
    if (u.charAt(4) === 's') {
      model.gifUrl = u;
      model.gifWidth = data.data.fixed_width_downsampled_width;
      model.gifHeight = data.data.fixed_width_downsampled_height;
      model.gifSubmit = true;
      renderLogin();
      $('#gif').text('Turn Off Gif');
    } else {
      playGif();
    }

    var mood = Math.random();
    if (mood >=.5) {
      $('#angry').attr('class', 'appear');
    } else {
      $('#dragonMain').attr('class', 'jump');
      $('#leftArm').attr('class', 'armRotate1');
      $('.rightArm').attr('class', 'armRotate2');
    }
  });
}

function dance() {
  model.stuff = false;
  model.gif = false;
  model.dance = true;
  renderLogin();
  $('#dance').text('Turn Off Party');

  $('.game').addClass('partyTime');
  $('#leftArm').attr('class', 'leftRobot');
  $('.rightArm').attr('class', 'rightRobot');
  $('#body').attr('class', 'bodyDance');

  $('#dance').on('click', function() {
    model.dance = false;
    renderLogin();
    $('#dance').text('Party Time');
  });
}

$(document).ready(setup);