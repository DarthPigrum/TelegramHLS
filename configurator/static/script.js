'use strict';
const callApi = async(method, args) =>
  fetch('/', {
    method: 'POST',
    body: JSON.stringify({
      method,
      args,
    }),
  });
const createManager = async(name) => {
  const line = document.createElement('tr');
  const nameCell = document.createElement('td');
  nameCell.innerHTML = name;
  const config = await callApi('fetchConfig', { name }).then((res) =>
    res.text()
  );
  const textarea = document.createElement('textarea');
  textarea.value = config;
  const configCell = document.createElement('td');
  configCell.appendChild(textarea);
  const applyButton = document.createElement('button');
  applyButton.innerHTML = 'Apply config';
  applyButton.onclick = () =>
    callApi('setConfig', { name, config: JSON.parse(textarea.value) });
  const startButton = document.createElement('button');
  startButton.innerHTML = 'Start';
  startButton.onclick = () => callApi('startProcess', { name });
  const buttonsCell = document.createElement('td');
  buttonsCell.appendChild(applyButton);
  buttonsCell.appendChild(startButton);
  line.appendChild(nameCell);
  line.appendChild(configCell);
  line.appendChild(buttonsCell);
  document.getElementById('programs').appendChild(line);
};
window.onload = () => {
  createManager('client');
  createManager('recorder');
};
