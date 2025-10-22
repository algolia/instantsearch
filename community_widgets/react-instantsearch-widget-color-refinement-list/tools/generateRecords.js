import fs from 'fs';

const colors = [
  {
    name: 'black',
    hex: '#000',
  },
  {
    name: 'white',
    hex: '#FFF',
  },
  {
    name: 'red',
    hex: '#ff0000',
  },
  {
    name: 'blue',
    hex: '#0000ff',
  },
  {
    name: 'yellow',
    hex: '#FF0',
  },
  {
    name: 'green',
    hex: '#0F0',
  },
  {
    name: 'beige',
    hex: '#F5F5DC',
  },
  {
    name: 'grey',
    hex: '#D3D3D3',
  },
  {
    name: 'pink',
    hex: '#FFC0CB',
  },
  {
    name: 'purple',
    hex: '#800080',
  },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let ptr = 0;

const records = [];
for (let i = 0; i < colors.length; i++) {
  const color = colors[i];

  const rndCount = randomInt(1, 10);
  for (let j = 0; j < rndCount; j++) {
    const record = {
      objectID: ptr++,
      color: `${color.name};${color.hex}`,
    };
    records.push(record);
  }
}

fs.writeFile('./records.json', JSON.stringify(records, null, 2), (err) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
});
