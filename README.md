golicons are SVG icons which are animated with JavaScript to simulate [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life). Full documentation (with live examples) is available [on the website](https://golicons.com/).

## Quickstart

Getting started is a piece of cake:

```html
<!doctype html>
<html lang='en'>
  <head>
    <meta charset="utf-8"> 
  </head>
  <body>
    <div class='goli goli-glider'></div>
    <script src='https://cdn.jsdelivr.net/npm/golicons@0.6.0/dist/golicons.min.js'></script>
    <script>
      golicons.start();
    </script>
  </body>
</html>
```

## Other Examples

It's working, but the result is rather ugly and boring. You can style the icons using standard SVG CSS. There are also options that can be configured using CSS classes on the elements. All of these class names (listed below) are considered part of golicon's public API and can be expected to remain stable for each major version. Let's try to add a little CSS and configure a couple other options to make it more exciting:

```html
<!doctype html>
<html lang='en'>
  <head>
    <meta charset="utf-8"> 
    <style>
      .goli {
        width: 64px;
        height: 64px;
        clip-path: circle(40px at center);
      }

      .goli-live {
        fill: SteelBlue;
        stroke: SteelBlue;
        transition-duration: 0.25s;
      }

      .goli-dead {
        fill: Tomato;
        stroke: Tomato;
        transition-duration: 0.25s;
      }
    </style>
  </head>
  <body>

    <div class='goli goli-glider goli-start-delay-ms-500 goli-tick-ms-250'></div>

    <script src='https://cdn.jsdelivr.net/npm/golicons@0.6.0/dist/golicons.min.js'></script>
    <script>
      golicons.start();
    </script>
  </body>
</html>
```

You can play with a CodePen of this example [here](https://codepen.io/anon/pen/mGgZXO). Chances are that you'll also want to use some of your own patterns.

```html
<!doctype html>
<html lang='en'>
  <head>
    <meta charset="utf-8"> 
    <style>
      .goli {
        width: 128px;
        height: 93px;
      }
    </style>
  </head>
  <body>

    <div class='goli goli-my-awesome-tumbler goli-tick-ms-200'></div>

    <script src='https://cdn.jsdelivr.net/npm/golicons@0.6.0/dist/golicons.min.js'></script>
    <script>
      const patternStr = `
        ...........
        ..O.....O..
        .O.O...O.O.
        .O..O.O..O.
        ...O...O...
        ...OO.OO...
        ...........
        ...........
      `;

      golicons.registerPattern('my-awesome-tumbler', patternStr);

      golicons.start();
    </script>
  </body>
</html>
```

# API

golicons is designed to required as little JavaScript as possible. This is done both to keep things as declarative as possible, and to hopefully make it more approachable to designers. To that end, most of the options can be accessed by setting CSS class names on your golicons. All of the classes begin with 'goli-' to help avoid collisions.

## Style Class Names

The style class names are used to change the visual representation of the golicons. You can standard CSS selectors on these classes to affect things.

### goli-live

This is used to select the SVG elements used to represent cells that are alive. These are currently implement as SVG rect elements, but no assumptions should be made about this moving forward. 

### goli-dead

This is used to select the SVG elements used to represent cells that are dead. These are currently implement as SVG rect elements, but no assumptions should be made about this moving forward. 

## Settings Class Names

Settings class names are used to configure how the golicons JavaScript code will process the golicon.

### goli

This has two primary purposes. The first is to indicate to the golicons JavaScript code that this element should be processed as a golicon. Therefore everyone golicon needs to have this class. The second is to serve as a selector for setting HTML CSS rules such as width and height on your golicons. 

## goli-tick-ms-\<Number>

This sets the tick period in milliseconds for the golicons. For example, the value "goli-tick-ms-1000" will cause the golicon to tick (proceed to the next frame). once per second, while a value of "goli-tick-ms-50" will cause it to tick every 50 milliseconds. 

## goli-start-delay-ms-\<Number>

This sets how long in milliseconds the simulation should wait before starting. 

## JavaScript

The JS API is minimal by design. However, at the very least you need to use it to kick things off.

### golicons.start()

This function kicks everything off. It runs querySelector on the page and grabs an elements that have the "goli" class and processes them as golicons. 

### golicons.registerPattern(name, patternString)

This function is for registering new patterns. The pattern string is a series of newline-separated rows where "." represents a dead cell and "O" (capital "o") represents a live one. 
