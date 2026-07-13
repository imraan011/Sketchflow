/**
 * entry-animation.js — GreenSock (GSAP) based entry animation.
 * Draws a sketchy border around the heading, animates letters, draws an arrow to the CTA,
 * and handles progressive drop-in/fade-up transitions.
 * Fully optional and safe to delete along with this directory.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Setup & Availability Checks
  if (typeof gsap === "undefined") {
    console.warn("GSAP is not loaded. Skipping entry animations.");
    return;
  }

  // Respect user preference for reduced motion
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    return;
  }

  // Play once per session
  if (sessionStorage.getItem("sketchflow-intro-played")) {
    return;
  }
  sessionStorage.setItem("sketchflow-intro-played", "true");

  // Activate animating state
  document.body.classList.add("js-animating");
  
  // Register GSAP plugins
  if (typeof MotionPathPlugin !== "undefined") {
    gsap.registerPlugin(MotionPathPlugin);
  }

  // 2. Element Selectors & Splitting Heading into letters
  const heading = document.querySelector('[data-animate="heading"]');
  const cta = document.querySelector('[data-animate="cta"]');
  const dropInElements = document.querySelectorAll('[data-animate="drop-in"]');
  const fadeUpElements = document.querySelectorAll('[data-animate="fade-up"]');

  if (heading) {
    // Wrap heading text characters in span.letter to enable detailed ink-in beats
    const lines = heading.innerHTML.split(/<br\s*\/?>/i);
    heading.innerHTML = lines.map(line => {
      return line.split("").map(char => {
        if (char === " ") return " ";
        return `<span class="letter">${char}</span>`;
      }).join("");
    }).join("<br/>");
  }

  const letters = heading ? heading.querySelectorAll(".letter") : [];

  // Create GSAP Timeline
  const tl = gsap.timeline({
    onComplete: cleanup
  });

  // 3. Setup Injected SVG Overlays
  const svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgOverlay.setAttribute("class", "sketch-overlay-svg fixed inset-0 w-full h-full");
  svgOverlay.style.zIndex = "4";
  document.body.appendChild(svgOverlay);

  // Dynamic Drawing: Wobble rectangle surrounding heading container
  let rectPath = null;
  let pencilTip = null;

  if (heading) {
    const rect = heading.getBoundingClientRect();
    const pad = 16;
    const w = rect.width + pad * 2;
    const h = rect.height + pad * 2;
    const scrollY = window.scrollY;
    
    // Absolute position coords in viewport space
    const x = rect.left - pad;
    const y = rect.top - pad + scrollY;

    // A sketchy box with minor overshoots and bezier curve wobbles
    rectPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    rectPath.setAttribute("d", `M ${x + 4} ${y + 2} 
                                Q ${x + w/2} ${y - 4} ${x + w + 5} ${y - 1} 
                                Q ${x + w + 2} ${y + h/2} ${x + w - 2} ${y + h + 4} 
                                Q ${x + w/2} ${y + h + 6} ${x - 5} ${y + h - 1} 
                                Q ${x - 2} ${y + h/2} ${x + 2} ${y + 6}`);
    rectPath.setAttribute("stroke", "#4edea3");
    rectPath.setAttribute("stroke-width", "2");
    rectPath.setAttribute("fill", "none");
    rectPath.setAttribute("stroke-linecap", "round");
    svgOverlay.appendChild(rectPath);

    // Create a physical pencil tip follower
    pencilTip = document.createElement("div");
    pencilTip.className = "sketch-pencil-tip";
    document.body.appendChild(pencilTip);

    // Set up path stroke properties
    const length = rectPath.getTotalLength();
    gsap.set(rectPath, { strokeDasharray: length, strokeDashoffset: length });
  }

  // Dynamic Drawing: Curved arrow pointing towards the primary CTA
  let arrowPath = null;
  let arrowHeadPath = null;

  if (heading && cta) {
    const headingRect = heading.getBoundingClientRect();
    const ctaRect = cta.getBoundingClientRect();
    const scrollY = window.scrollY;

    const startX = headingRect.left + headingRect.width * 0.7;
    const startY = headingRect.top + headingRect.height + 8 + scrollY;
    const endX = ctaRect.left + ctaRect.width * 0.15;
    const endY = ctaRect.top - 6 + scrollY;

    // Draw a curved line towards CTA
    arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrowPath.setAttribute("d", `M ${startX} ${startY} Q ${startX + 80} ${startY + 50} ${endX} ${endY}`);
    arrowPath.setAttribute("stroke", "#ffffff");
    arrowPath.setAttribute("stroke-width", "2");
    arrowPath.setAttribute("fill", "none");
    arrowPath.setAttribute("stroke-linecap", "round");
    svgOverlay.appendChild(arrowPath);

    // Draw arrowhead lines
    arrowHeadPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrowHeadPath.setAttribute("d", `M ${endX - 12} ${endY - 2} L ${endX} ${endY} L ${endX - 4} ${endY - 12}`);
    arrowHeadPath.setAttribute("stroke", "#ffffff");
    arrowHeadPath.setAttribute("stroke-width", "2");
    arrowHeadPath.setAttribute("fill", "none");
    arrowHeadPath.setAttribute("stroke-linecap", "round");
    arrowHeadPath.setAttribute("stroke-linejoin", "round");
    svgOverlay.appendChild(arrowHeadPath);

    const length = arrowPath.getTotalLength();
    const headLength = arrowHeadPath.getTotalLength();
    
    gsap.set(arrowPath, { strokeDasharray: length, strokeDashoffset: length });
    gsap.set(arrowHeadPath, { strokeDasharray: headLength, strokeDashoffset: headLength });
  }

  // 4. Build GSAP Timeline Animations

  // BEAT 1: Sketch borders around heading
  if (rectPath && pencilTip) {
    tl.to(pencilTip, { opacity: 1, duration: 0.1 });
    
    tl.to(rectPath, {
      strokeDashoffset: 0,
      duration: 0.9,
      ease: "power2.inOut"
    }, 0);

    tl.to(pencilTip, {
      motionPath: {
        path: rectPath,
        align: rectPath,
        alignOrigin: [0.5, 0.5]
      },
      duration: 0.9,
      ease: "power2.inOut"
    }, 0);

    tl.to(pencilTip, { opacity: 0, duration: 0.1 });
  }

  // BEAT 2: Heading characters ink-in (overlapping Beat 1)
  if (letters.length > 0) {
    tl.to(letters, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.02,
      ease: "back.out(1.6)"
    }, 0.5);
  }

  // BEAT 3: Sketch arrow pointing to CTA
  if (arrowPath) {
    tl.to(arrowPath, {
      strokeDashoffset: 0,
      duration: 0.6,
      ease: "power2.out"
    }, 1.2);
    
    tl.to(arrowHeadPath, {
      strokeDashoffset: 0,
      duration: 0.2,
      ease: "power2.out"
    }, 1.8);
  }

  // BEAT 4: Toolbar preview and indicators drop in
  if (dropInElements.length > 0) {
    tl.to(dropInElements, {
      opacity: 1,
      y: 0,
      rotation: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "bounce.out"
    }, 1.6);
  }

  // BEAT 5: Subheadline & features fade up
  if (cta) {
    tl.to(cta, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, 1.9);
  }

  if (fadeUpElements.length > 0) {
    tl.to(fadeUpElements, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.15,
      ease: "power2.out"
    }, 2.1);
  }

  // 5. Create Skip Affordance Link
  const skipBtn = document.createElement("a");
  skipBtn.className = "animation-skip-link";
  skipBtn.href = "#";
  skipBtn.textContent = "Skip →";
  document.body.appendChild(skipBtn);

  skipBtn.addEventListener("click", (e) => {
    e.preventDefault();
    tl.progress(1); // Jump to ending
    cleanup();
  });

  // 6. Cleanup variables & remove temporary animation states
  function cleanup() {
    document.body.classList.remove("js-animating");
    
    // Remove dynamically injected DOM nodes
    if (svgOverlay && svgOverlay.parentNode) {
      svgOverlay.parentNode.removeChild(svgOverlay);
    }
    if (pencilTip && pencilTip.parentNode) {
      pencilTip.parentNode.removeChild(pencilTip);
    }
    if (skipBtn && skipBtn.parentNode) {
      skipBtn.parentNode.removeChild(skipBtn);
    }
  }
});
