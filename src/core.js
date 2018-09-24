const SVG_NS = 'http://www.w3.org/2000/svg';

const names = {};
export function registerPlugin(name, func) {
  registerName(name, func); 
}

export function registerPattern(name, patternText) {
  const pluginFunc = (golicon) => {
    const patternFunc = () => {
      return parsePattern(patternText);
    };
    golicon.setPatternFunc(patternFunc);
  };

  registerPlugin(name, pluginFunc); 
}

export function start() {

  insertDefaultStyles();

  const golis = document.getElementsByClassName('goli');

  for (const goli of golis) {
    const gol = new GOL(goli);
    gol.start();
  }
}

function parsePattern(patternText) {
  const rows = [];
  for (let line of patternText.split('\n')) {

    line = line.trim();

    if (line === '') {
      continue;
    }

    const row = [];
    rows.push(row);
    
    for (const char of line) {
      let cell;
      if (char === '.') {
        cell = 0;
      }
      else if (char === 'O') {
        cell = 1;
      }
      else {
        throw "Error parsing pattern char: " + char;
      }

      row.push(cell);
    }
  }

  return rows;
}

function registerName(name, value) {
  const fullName = 'goli-' + name;
  if (names[fullName]) {
    throw "golicons name '" + name + "' already in use";
  }
  names[fullName] = value;
}

function insertDefaultStyles() {
  const style = document.createElement('style');
  style.type = 'text/css';
  let styles = '';
  
  styles += '.goli { width: 32px; height: 32px; }';
  styles += '.goli-live { fill: #000; }';
  styles += '.goli-dead { fill: #fff; stroke: #000; }';

  const node = document.createTextNode(styles);
  style.appendChild(node);

  const head = document.getElementsByTagName('head')[0];

  head.insertBefore(style, head.firstChild);
}

class GOL {
  constructor(el) {
    this._el = el;

    this._tickDelayMs = 1000;

    this._parseClassOptions();

    this._state = this._patternFunc(); 
    this._newState = this._patternFunc(); 
    this._prevState = this._patternFunc();
    this._cells = [];

    this._numRows = this._state.length;
    this._numCols = this._state[0].length;

    const dim = el.getBoundingClientRect();
    const cellWidth = dim.width / this._numCols;
    const cellHeight = dim.height / this._numRows;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.style.width = '100%';
    svg.style.height = '100%';
    el.appendChild(svg);
    
    for (let i = 0; i < this._state.length; i++) {
      const row = document.createElementNS(SVG_NS, 'g');
      this._cells[i] = [];
      row.classList.add('goli-row');
      row.setAttribute('transform', 'translate(0, ' + i*cellHeight + ')');
      svg.appendChild(row);
      for (let j = 0; j < this._state[0].length; j++) {
        const cell = document.createElementNS(SVG_NS, 'rect');
        cell.setAttribute('width', cellWidth);
        cell.setAttribute('height', cellHeight);
        cell.setAttribute('x', j*cellWidth);
        row.appendChild(cell);
        this._cells[i][j] = cell;
      }
    }

    this.initRender();
  }

  _parseClassOptions() {
    const classList = this._el.classList;

    for (const klass of classList) {
      if (klass.startsWith('goli-tick-ms')) {
        this._tickDelayMs = Number(klass.slice(13));
      }
      else if (klass.startsWith('goli-start-delay-ms')) {
        this._startDelayMs = Number(klass.slice(20));
      }
      else {
        // class not recognized; check if there's a plugin for it
        if (names[klass]) {
          names[klass](this);
        }
        else if (klass.startsWith('goli-')) {
          throw "Unrecognized golicons class: " + klass;
        }
      }
    }
  }

  setPatternFunc(func) {
    this._patternFunc = func;
  }
  
  start() {
    const go = () => {
      setInterval(() => {
        this.tick();
        //requestAnimationFrame(this.render.bind(this));
        this.render();
      }, this._tickDelayMs);
    };

    if (!this._startDelayMs) {
      go();
    }
    else {
      setTimeout(go, this._startDelayMs);
    }
  }

  printState() {
    for (let i = 0; i < this._state.length; i++) {
      const row = this._state[i];
      console.log(JSON.stringify(row), i);
    }
    console.log();
  }

  tick() {
    //const startTime = timeNowSeconds();

    copyState(this._state, this._newState);
    copyState(this._state, this._prevState);

    for (let i = 0; i < this._state.length; i++) {
      for (let j = 0; j < this._state[0].length; j++) {
        const neighbors = this.neighbors(i, j);

        let liveCount = 0;

        // TODO: this can be generated on the fly in neighbors
        for (const neighbor of neighbors) {
          if (neighbor === 1) {
            liveCount++;
          }
        }

        const currentState = this._state[i][j];
        let newState = currentState;
        if (currentState === 1) {
          if (liveCount < 2) {
            // underpopulation
            newState = 0;
          }
          else if (liveCount > 3) {
            // overpopulation
            newState = 0;
          }
          else {
            // stays live
            newState = 1;
          }
        }
        else {
          if (liveCount === 3) {
            // reproduction
            newState = 1;
          }
        }

        this._newState[i][j] = newState;
      }
    }

    copyState(this._newState, this._state);

    //console.log("Tick time: " + (timeNowSeconds() - startTime));
  }

  neighbors(i, j) {
    // TODO: get rid of this allocation
    const n = [];
    n.push(this.topLeft(i, j));
    n.push(this.top(i, j));
    n.push(this.topRight(i, j));
    n.push(this.left(i, j));
    n.push(this.right(i, j));
    n.push(this.bottomLeft(i, j));
    n.push(this.bottom(i, j));
    n.push(this.bottomRight(i, j));
    return n;
  }

  wrapTop(i) {
    if (i === 0) {
      return this._state.length - 1;
    }
    return i - 1;
  }

  wrapLeft(j) {
    if (j === 0) {
      return this._state[0].length - 1;
    }
    return j - 1;
  }

  wrapRight(j) {
    if (j === this._state[0].length - 1) {
      return 0;
    }
    return j + 1;
  }

  wrapBottom(i) {
    if (i === this._state.length - 1) {
      return 0;
    }
    return i + 1;
  }

  topLeft(i, j) {
    return this._state[this.wrapTop(i)][this.wrapLeft(j)];
  }

  top(i, j) {
    return this._state[this.wrapTop(i)][j];
  }

  topRight(i, j) {
    return this._state[this.wrapTop(i)][this.wrapRight(j)];
  }

  left(i, j) {
    return this._state[i][this.wrapLeft(j)];
  }

  right(i, j) {
    return this._state[i][this.wrapRight(j)];
  }

  bottomLeft(i, j) {
    return this._state[this.wrapBottom(i)][this.wrapLeft(j)];
  }

  bottom(i, j) {
    return this._state[this.wrapBottom(i)][j];
  }

  bottomRight(i, j) {
    return this._state[this.wrapBottom(i)][this.wrapRight(j)];
  }

  // don't check if value changed on first render
  initRender() {
    for (let i = 0; i < this._numRows; i++) {
      for (let j = 0; j < this._numCols; j++) {
          this.renderCell(i, j, this._state[i][j]);
      }
    }
  }

  render() {
    //const startTime = timeNowSeconds();

    for (let i = 0; i < this._numRows; i++) {
      for (let j = 0; j < this._numCols; j++) {
        if (this._state[i][j] !== this._prevState[i][j]) {
          this.renderCell(i, j, this._state[i][j]);
        }
      }
    }

    //console.log("Render time: " + (timeNowSeconds() - startTime));
  }

  renderCell(i, j, state) {
    if (state === 1) {
      this._cells[i][j].classList.remove('goli-dead');
      this._cells[i][j].classList.add('goli-live');
    }
    else {
      this._cells[i][j].classList.remove('goli-live');
      this._cells[i][j].classList.add('goli-dead');
    }
  }
}

function copyState(a, b) {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[0].length; j++) {
      b[i][j] = a[i][j];
    }
  }
}

function timeNowSeconds() {
  return performance.now() / 1000;
}
