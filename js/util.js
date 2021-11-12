const getReponseText = resp => resp.text();
const textToDocument = html => new DOMParser().parseFromString(html, 'text/html');
const documentToTemplate = doc => {
  const templateNode = doc.querySelector('template');
  const scriptNode = doc.querySelector('script');
  if (scriptNode) {
    const scriptEl = document.createElement('script');
    const scriptText = document.createTextNode(scriptNode.innerText);
    scriptEl.appendChild(scriptText);
    return { templateNode, scriptEl };
  }
  return { templateNode, scriptEl: undefined };
};
const appendTemplate = ({ templateNode, scriptEl }) => {
  document.body.appendChild(templateNode.cloneNode(true));
  if (scriptEl) {
    document.body.appendChild(scriptEl.cloneNode(true));
  }
};
const includeHTML = file =>
  fetch(file)
    .then(getReponseText)
    .then(textToDocument)
    .then(documentToTemplate)
    .then(appendTemplate);
const includeTemplate = file => includeHTML(`tmpl/${file}`);

const uuid = () => {
  const uuid = new Uint32Array(3);
  crypto.getRandomValues(uuid);
  return uuid.join('');
};

const generateJoinCode = () => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = () => numbers[Math.floor(Math.random() * numbers.length)];
  const lengthOfCode = 5;
  let code = '';
  for (let i = 0; i < lengthOfCode; i++) {
    code += (i % 2 === 0) ? randomLetter() : randomNumber();
  }
  return code;
};

const saveData = (key, value) => localStorage.setItem(key, value);

const loadData = (key, def) => {
  let value = localStorage.getItem(key) ?? def;
  if (value === 'null') {
    value = null;
  }
  saveData(key, value);
  return value;
};

const loadBoolean = (key, def) => loadData(key, def) === 'true';
const loadNumber = (key, def) => Number(loadData(key, def));

