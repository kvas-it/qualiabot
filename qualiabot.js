var view = {};
var model = {
  episodic: [],
  associative: {},
  color: null,
  quale: null,
};

function init() {
  view.colorPicker = document.getElementById('color-picker');
  view.talk = document.getElementById('talk');
  view.botSay = document.getElementById('bot-say');
  view.humanSay = document.getElementById('human-say');
  view.humanSayButton = document.getElementById('human-say-button');
  view.mentalState = document.getElementById('mental-state');
  view.epiContainer = document.getElementById('epi-container');
  view.episodic = document.getElementById('episodic');
  view.assocContainer = document.getElementById('assoc-container');
  view.associative = document.getElementById('associative');

  view.humanSayButton.addEventListener('click', function (event) {
    event.preventDefault();
    humanInput(view.humanSay.value);
    view.humanSay.value = '';
  });

  view.humanSay.addEventListener('keyup', function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        view.humanSayButton.click();
    }
  });

  view.colorPicker.value = '#0000ff';
  view.colorPicker.onchange = colorChanged;
}

function show(element) {
  element.style.visibility = 'visible';
}

function hasKeys(obj) {
  for(var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return true;
    }
  }
  return false;
}

function formatMem(m) {
  if (m[0] == '#') {
    m = '<span style="background-color: ' + m + '">&nbsp;&nbsp;&nbsp;</span>';
  }
  return m;
}

function showMentalState() {
  if (model.episodic.length > 0) {
    var epi = [];
    model.episodic.forEach((m) => {epi.push('<p>' + m + '</p>');});
    view.episodic.innerHTML = epi.join('\n');
    show(view.epiContainer);
  }
  if (hasKeys(model.associative)) {
    var assoc = [];
    Object.keys(model.associative).forEach((k) => {
      assoc.push(
        '<p>' + formatMem(k) + ' --&gt; ' +
        formatMem(model.associative[k]) + '</p>'
      );
    });
    view.associative.innerHTML = assoc.join('\n');
    show(view.assocContainer);
  }
  show(view.mentalState);
}

function rememberEpisodic(what) {
  model.episodic.push(what);
  showMentalState();
}

// Generate a new quale.
function genQ() {
  return Math.random().toString(30).replace(/[^a-z0-9]+/g, '');
}

function rememberAssoc(key, value) {
  if (!value) {
    value = genQ();
  }
  model.associative[key] = value;
  showMentalState();
  return value;
}

function humanInput(text) {
  text = text.trim();
  if (text == '') {
    return;
  }
  rememberEpisodic('You said: ' + text);
  view.botSay.innerHTML = '';
  text = text.toLowerCase();
  if (text.startsWith('it\'s ')) {
    text = text.substr(5);
  }
  if (model.quale) {
    rememberAssoc(model.quale, text);
  }
}

function say(text) {
  show(view.talk);
  rememberEpisodic('I said: ' + text);
  view.botSay.innerHTML = text;
  view.humanSay.value = '';
  view.humanSay.focus();
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : [-200, -200, -200];
}

function colorDistance(c1, c2) {
  c1 = hexToRgb(c1);
  c2 = hexToRgb(c2);
  var dsq = 0;
  for (var i = 0; i < 3; i++) {
    dsq += Math.abs(c1[i] - c2[i]) ** 2;
  }
  return Math.sqrt(dsq);
}

// Search associative memory.
function assocGet(m) {
  if (m[0] == '#') {
    // Color, look for similar colors.
    const keys = Object.keys(model.associative);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i][0] == '#' && colorDistance(m, keys[i]) < 60) {
        return model.associative[keys[i]];
      }
    }
  } else {
    return model.associative[m];
  }
}

function colorChanged() {
  model.color = view.colorPicker.value;
  const quale = assocGet(model.color);
  model.quale = rememberAssoc(model.color, quale);
  if (quale) {
    const name = assocGet(quale);
    if (name) {
      rememberEpisodic('I saw ' + name + ', I felt ' + quale);
      say('I see ' + name);
    } else {
      rememberEpisodic('I saw a familiar color, I felt ' + quale);
      say('I see a familiar color... Can you tell me what color this is?')
    }
  } else {
    rememberEpisodic('I saw a new color');
    say('I see a new color! Can you tell me what color this is?');
  }
}

window.onload = init;
