'use strict';
const callApi = async(method, ...args) =>
  fetch(`/api/${method}/${args.join('/')}`).then((res) => res.text());
const playSource = (src) => {
  const player = videojs('player');
  player.src({
    src,
    type: 'application/x-mpegURL',
  });
  player.play();
};
const createRangeItem = ([start, end]) => {
  const line = document.createElement('tr');
  const startCell = document.createElement('td');
  startCell.innerHTML = new Date(start * 1000).toUTCString();
  const endCell = document.createElement('td');
  endCell.innerHTML = new Date(end * 1000).toUTCString();
  const playButtonCell = document.createElement('td');
  const playButton = document.createElement('button');
  playButton.innerHTML = 'Play';
  playButton.onclick = () =>
    playSource(
      `/api/getPlaylist/${localStorage.getItem(
        'camera'
      )}/${start}/${end}/proxied.m3u8`
    );
  playButtonCell.appendChild(playButton);
  line.appendChild(startCell);
  line.appendChild(endCell);
  line.appendChild(playButtonCell);
  return line;
};
window.onload = () => {
  if (!localStorage.getItem('camera'))
    localStorage.setItem('camera', prompt('Enter camera name:'));
  document.getElementById('changeButton').onclick = () => {
    localStorage.setItem('camera', prompt('Enter camera name:'));
    document.location.reload(true);
  };
  document.getElementById('cameraName').innerHTML = localStorage.getItem(
    'camera'
  );
  const rangeItems = document.getElementById('rangeItems');
  const rangesPromise = callApi(
    'getRanges',
    localStorage.getItem('camera')
  ).then(JSON.parse);
  rangesPromise.then((arr) =>
    arr.map(createRangeItem).forEach(rangeItems.appendChild.bind(rangeItems))
  );
  rangesPromise.then((arr) => {
    if (new Date() / 1000 - arr[arr.length - 1][1] < 30) {
      document.getElementById('liveButton').onclick = () =>
        playSource(`/api/getLive/${localStorage.getItem('camera')}`);
    } else {
      document.getElementById('liveButton').style.display = 'none';
    }
  });
};
