// umd module:
// https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['golicons'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('golicons'));
  } else {
    root.goliconsPluginGlider = factory(root.golicons);
  }
}(typeof self !== 'undefined' ? self : this, function (golicons) {

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

  golicons.registerPlugin('glider', (golicon) => {
    golicon.setPatternFunc(glider);
  });

  return {};
}));
