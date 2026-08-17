# Heavenly Dao Chronicles

BTTH-inspired cultivation universe creator (static web app).

## Highlights
- BTTH-style story engine (pressure → method → stage → clash → payoff → seed)
- Branching story graphs with multiple arcs/endings
- Cultivation, flames, alchemy, factions, map travel
- Battle loadout panels, achievements, statistics
- Save slots, import/export, service worker offline cache

## Run
Open `index.html` or deploy the folder to GitHub Pages.

## Structure
- `js/data.js` generators
- `js/modules/` combat, graph, ui
- `js/factions-extra.js` empires/academies/etc
- `js/app.js` orchestration
- `css/design-system.css` tokens + polish

*The Heavenly Dao remembers everything.*


## Cache issues
If the page sticks on loading or shows an old `app.js` error:
1. Prefer **Incognito** window
2. Unregister service workers
3. Confirm Network loads `js/app.v5.js`
