# SpookCoffee — Free Roam (v0.1 Alpha)

An experimental third-person 3D driving homepage. The town is *under development*: curving paved roads serve Portfolio and Contact-ID, while a winding dirt road leads to a construction site.

**This is a development-branch prototype. Don't merge to `main` until you have tested it.**

## Features

- 3D town built in JavaScript using [Three.js](https://threejs.org/).
- Curved asphalt roads and branching winding dirt road.
- Third-person car, keyboard controls, two camera distances, basic off-road traction, solid building collisions.
- Parking detection: stop in a lot to get a "Would you like to enter?" dialog.
- Under-construction destination stays in the game (no broken link).
- Minimap, speed readout, quick links, basic touch buttons, browser fallback.
- No login, trackers, personal data collection, or backend required.

## Create a safe new branch in VS Code

Open the **SpookCoffee.github.io** repository, not Contact-ID.

```powershell
git status
git fetch origin
git switch -c FreeRoam origin/main
```

The working tree should be clean before switching. If `FreeRoam` already exists locally, use `git switch FreeRoam` instead.

**Copy the contents of this ZIP** into the root of the checked-out project (not the containing folder). Replace `index.html`; leave `.git` untouched.

## Preview locally

- Recommended: VS Code **Live Server** extension → right-click `index.html` → **Open with Live Server**.
- Alternative: `py -m http.server 5500` from the repository root, then visit `http://localhost:5500/`.
- The first version uses Three.js from jsDelivr CDN, so the browser requires internet to download Three.js. After loading, no server/database is used by the simulation.
- It will not work by double-clicking the file using `file://` because JavaScript modules require HTTP.

## Controls

| Action | Keys |
| --- | --- |
| Accelerate | W / ↑ |
| Brake / reverse | S / ↓ |
| Turn | A/D or ←/→ |
| Handbrake | Space |
| Change camera distance | C |
| Minimap show/hide | M |
| Close dialog | Escape |
| Restart drive | Button in the bottom bar |

The parking interaction triggers when you're inside the marked zone and nearly stopped. If you choose "Keep roaming," leave the parking zone and return to try again.

## Files

```text
index.html                  Website layout and menus
assets/css/style.css        UI colors, responsive CSS
src/main.js                 Starts the game
src/game/Game.js            Main scene, update loop
src/game/World.js           Roads, landscape, buildings, construction site
src/game/Vehicle.js         Car model and movement
src/game/InputController.js Keyboard / touch inputs
src/game/CameraController.js Third-person camera
src/game/ParkingManager.js  Parking triggers and cooldown
src/game/math.js           Shared simple geometry functions
src/data/destinations.js   Parking destinations and URL routing
src/ui/Hud.js              Minimap, speedometer, dialogs
.nojekyll                   Disables Jekyll on GitHub Pages
tests/roadmath.test.mjs     Tests basic road math
```

To add a building destination, start at `src/data/destinations.js`. It must also have a corresponding visible model/parking zone built in `World.js`.

## Commit only to the development branch

```powershell
node --test tests/roadmath.test.mjs
git status
git add .
git commit -m "Prototype free-roam developing town"
git push -u origin FreeRoam
```

As long as GitHub Pages is configured to publish from `main`, committing to `FreeRoam` won't change the existing live site. **Do not change Settings → Pages to FreeRoam** while testing.

## Caveats

- Early arcade handling, not realistic vehicle physics.
- This version uses simple geometric models, not downloaded buildings or cars.
- Portfolio goes to `/Portfolio/`; if Portfolio isn't published yet, that destination may lead to a missing page. Change its URL in `src/data/destinations.js` when ready.
- Large phones / older computers may have limited 3D performance. Quick links provide an alternative to driving.
- Keyboard and mouse are the target for Alpha v0.1; touch controls are an early convenience, not final mobile optimization.

## Sign and minimap orientation correction

- `src/game/World.js`: each sign faces toward its parking area. Signs render only their readable front faces. A stray brace left from an earlier edit was removed.
- `src/ui/Hud.js`: the north-up minimap car arrow now rotates in the same direction as the vehicle's heading. The map itself has **not** been rotated.
- `npm test` now also checks the syntax of all `src/` JavaScript modules.

These changes do not require a merge to `main`; apply them on your working development branch and preview via Live Server first.

## GitHub cul-de-sac (DynamicUI update)

- A paved circular turnaround now ends the southern road behind the original spawn point.
- A small GitHub building and parking lot lead to `https://github.com/SpookCoffee`.
- The minimap includes a `GH` marker without changing the previously mirrored-X layout.
- GitHub also appears in Quick Links via the same destination configuration.

This package is an update to the supplied `DynamicUI` snapshot. Extract the **contents** into the actual `spookcoffee.github.io` repository folder (the one containing `.git`), not the parent `RootWebsite` folder, then commit to your existing development branch.
