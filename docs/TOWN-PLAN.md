# SpookCoffee — developing town concept

## Road network

- **Main road:** Winding asphalt through town. Its last stretch (north of the tofu turnoff) is dirt while it is developed.
- **Contact-ID:** Short paved branch and parking lot.
- **Portfolio:** Another paved branch and parking lot.
- **Tofu Shop:** Finished low-poly shop with a paved side road and an asphalt parking area.
- **Work In Progress:** Separate unfinished building at the northern end of the **main road**, after the asphalt becomes dirt. Gravel apron, columns, barrels, and earth mounds.
- **GitHub:** Small paved cul-de-sac behind the original car spawn.

## Notes

- Tofu shop links to `/Tofu-Delivery/` via `src/data/destinations.js`.
- The WIP destination has `url: null` until it has a website.
- Roads remain hand-curved using Catmull-Rom splines rather than a rigid square grid.
- Do not merge from development to main until tested in a browser.
