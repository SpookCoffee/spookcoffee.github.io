/**
 * Load the 3D engine dynamically: if the browser cannot fetch Three.js from
 * the CDN, the static fallback links are still shown instead of a blank page.
 */
import('./game/Game.js')
  .then(({ Game }) => new Game(document.getElementById('game')))
  .catch(error => {
    console.error('Unable to initialize SpookCoffee Free Roam:', error);
    document.getElementById('fallback').hidden = false;
  });
