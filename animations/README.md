# Optional Entry Animation Module (GSAP)

This folder contains the self-contained GSAP timeline animations for the Sketchflow landing page. It is structured to be completely independent and safe to remove at any time.

## How to Remove Safely

If you want to disable or remove the animation completely, do the following:

1. **Delete** this `animations/` folder.
2. Open the root **`index.html`** and remove the optional integration blocks:
   - In `<head>`:
     ```html
     <!-- Entry animation (optional — safe to remove this line + the animations/ folder) -->
     <link rel="stylesheet" href="./animations/entry-animation.css">
     
     <!-- GSAP Library from CDN (belonging to the optional animation block) -->
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/MotionPathPlugin.min.js"></script>
     ```
   - At the bottom of `<body>`:
     ```html
     <!-- Entry animation script (optional — safe to remove this line + the animations/ folder) -->
     <script type="module" src="./animations/entry-animation.js"></script>
     ```

## How It Works

- The entry script checks for GSAP presence, sessionStorage (runs once per session), and user motion preferences. If any check fails, it immediately bails and leaves the static content fully visible.
- All styles inside `styles/landing.css` are configured for the fully-revealed, final state. The starting states (e.g. `opacity: 0`) are only applied when the `body.js-animating` class is dynamically attached by the script at runtime.
- The `data-animate` tags inside `index.html` act as optional selector hook attributes. If this folder is deleted, they sit unused in the markup with zero impact on visual styling or execution.
