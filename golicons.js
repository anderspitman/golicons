// umd module:
// https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.golicons = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const plugins = {};
  function registerPlugin(name, func) {
    const fullName = 'goli-' + name;
    if (plugins[fullName]) {
      throw "golicons plugin '" + name + "' already defined";
    }
    plugins[fullName] = func;
    console.log(plugins);
  }

  function insertDefaultStyles() {
    const style = document.createElement('style');
    style.type = 'text/css';
    console.log(style);
    console.log(style.styleSheet);
    let styles = '';
    
    styles += '.goli-live { fill: #111; }';
    styles += '.goli-dead { fill: #eee; }';

    const node = document.createTextNode(styles);
    style.appendChild(node);

    const head = document.getElementsByTagName('head')[0];

    head.insertBefore(style, head.firstChild);
  }

  class GOL {
    constructor(el) {
      this._el = el;

      this._tickDelayMs = 1000;
      this._patternFunc = blinker;

      this._parseClassOptions();

      this._state = this._patternFunc(); 
      this._newState = this._patternFunc(); 
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

      this.render();
    }

    _parseClassOptions() {
      const classList = this._el.classList;

      for (const klass of classList) {
        if (klass.startsWith('goli-tick-ms')) {
          this._tickDelayMs = Number(klass.slice(13));
        }
        else {
          // class not recognized; check if there's a plugin for it
          if (plugins[klass]) {
            plugins[klass](this);
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
      setInterval(() => {
        this.tick();
        requestAnimationFrame(this.render.bind(this));
      }, this._tickDelayMs);
    }

    printState() {
      for (let i = 0; i < this._state.length; i++) {
        const row = this._state[i];
        console.log(JSON.stringify(row), i);
      }
      console.log();
    }

    tick() {
      copyState(this._state, this._newState);

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

    render() {
      for (let i = 0; i < this._numRows; i++) {
        for (let j = 0; j < this._numCols; j++) {
          const state = this._state[i][j];

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
    }
  }

  function blinker() {
    return [
      [ 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0 ],
      [ 0, 1, 1, 1, 0 ],
      [ 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0 ],
    ];
  }

  function beacon() {
    return [
      [ 0, 0, 0, 0, 0, 0 ],
      [ 0, 1, 1, 0, 0, 0 ],
      [ 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 0 ],
      [ 0, 0, 0, 1, 1, 0 ],
      [ 0, 0, 0, 0, 0, 0 ],
    ];
  }

  function toad() {
    return [
      [ 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 1, 0 ],
      [ 0, 1, 1, 1, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0 ],
    ];
  }

  function glider() {
    return [
      [ 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 0, 0 ],
      [ 0, 1, 1, 1, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0 ],
    ];
  }

  function copyState(a, b) {
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a[0].length; j++) {
        b[i][j] = a[i][j];
      }
    }
  }

  function activate({ domId, domClass }) {
    if (domId) {
      const el = document.getElementById(domId);
      const gol = new GOL(el);
      gol.start();
      return gol;
    }
    else if (domClass) {
      throw "domClass not implemented yet";
    }
  }

  registerPlugin('glider', (golicon) => {
    golicon.setPatternFunc(glider);
  });

  registerPlugin('blinker', (golicon) => {
    golicon.setPatternFunc(blinker);
  });

  registerPlugin('toad', (golicon) => {
    golicon.setPatternFunc(toad);
  });

  insertDefaultStyles();

  const golis = document.getElementsByClassName('goli');

  for (const goli of golis) {
    const gol = new GOL(goli);
    gol.start();
  }
  
  return {
    registerPlugin,
  };
}));
