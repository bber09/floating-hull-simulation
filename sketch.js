let shapeSelect, widthSlider, depthSlider, loadSlider, resetButton;
let buoyantForceP, submergedDepthP, outcomeP;

function setup() {
  const canvas = createCanvas(600, 400);
  canvas.parent('canvas-holder');
  frameRate(30);

  // Grab controls and result elements
  shapeSelect = select('#shape-select');
  widthSlider = select('#width-slider');
  depthSlider = select('#depth-slider');
  loadSlider = select('#load-slider');
  resetButton = select('#reset-button');
  buoyantForceP = select('#buoyant-force');
  submergedDepthP = select('#submerged-depth');
  outcomeP = select('#outcome');

  // Populate shape options
  ['Rectangle', 'Triangle', 'Semi-circle'].forEach(s => shapeSelect.option(s));

  // Attach event listeners
  widthSlider.input(updateValues);
  depthSlider.input(updateValues);
  loadSlider.input(updateValues);
  shapeSelect.changed(updateValues);
  resetButton.mousePressed(resetSimulation);

  // Initial display
  updateValues();
}

function updateValues() {
  select('#width-value').html(widthSlider.value());
  select('#depth-value').html(depthSlider.value());
  select('#load-value').html(loadSlider.value());
}

function resetSimulation() {
  widthSlider.value(100);
  depthSlider.value(60);
  loadSlider.value(300);
  updateValues();
}

function draw() {
  background(240);

  // Retrieve values
  const shape = shapeSelect.value();
  const w = Number(widthSlider.value());
  const d = Number(depthSlider.value());
  const load = Number(loadSlider.value());

  // Physics calculations
  const maxDisplacement = w * d;
  const floats = load <= maxDisplacement;
  const submergedDepth = floats ? load / w : d;
  const buoyantForce = submergedDepth * w;

  // Compute water‑line and shape vertical position
  const waterline = height / 2;
  // Center the shape so that when submergedDepth=0 its bottom sits on the waterline,
  // and when submergedDepth=d its top sits on the waterline.
  const shapeY = waterline - (d / 2 - submergedDepth);

  // Draw hull at new vertical position
  push();
    translate(width / 2, shapeY);
    noStroke();
    fill(150);
    if (shape === 'Rectangle') {
      rect(-w / 2, -d / 2, w, d);
    } else if (shape === 'Triangle') {
      triangle(-w / 2, d / 2, w / 2, d / 2, 0, -d / 2);
    } else if (shape === 'Semi-circle') {
      // note: this draws the top half of a circle of radius = d
      arc(0, d / 2, w, d * 2, PI, 0);
    }
  pop();

  // Draw water overlay to cover the underwater portion
  noStroke();
  fill(0, 120, 200, 150);
  rect(0, waterline, width, height / 2);

  // --- COMPUTE & DRAW CENTROID ---
  let cx = 0, cy = 0;
  if (shape === 'Rectangle') {
    // centroid of a rectangle drawn around (0,0)
    cx = 0;
    cy = 0;
  } else if (shape === 'Triangle') {
    // vertices at (-w/2, d/2), (w/2, d/2), (0, -d/2)
    cy = ( d/2 + d/2 - d/2 ) / 3; // = d/6
  } else if (shape === 'Semi-circle') {
    // radius in y-direction = d
    // centroid of a semicircle above its diameter: 4R/(3π) from the flat side
    // flat side here is at local y = d/2
    const R = d;
    cy = d/2 - (4 * R) / (3 * PI);
  }

  // Draw the centroid marker
  push();
    translate(width / 2, shapeY);
    noStroke();
    fill(255, 0, 0);
    ellipse(cx, cy, 10, 10);
  pop();
  // -----------------------------------

  // Update result display
  buoyantForceP.html(`Buoyant Force: ${buoyantForce.toFixed(1)} units`);
  submergedDepthP.html(`Submerged Depth: ${submergedDepth.toFixed(1)} px`);
  outcomeP.html(`Outcome: ${floats ? 'Floats' : 'Sinks'}`);
}
