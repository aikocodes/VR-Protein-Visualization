# VR Protein Visualization - 1A3N

## Setup Instructions

### Prerequisites
- Python 3 installed.
- A modern web browser that supports WebGL.
- VS Code.

### Running Locally
#### Start a local HTTP server using Python:
```bash
python3 -m http.server 8000
```

#### Open your web browser and go to:
```arduino
http://localhost:8000/
```
Your VR protein visualization should now be displayed.

## Project Structure
```bash
/vr-protein-visualization
│── index.html          # Main VR scene and custom styles
│── script.js           # A-Frame component logic
│── structure.json      # Molecular structure data
│── chains.json         # Protein chain mapping
│── README.md           # Project documentation
```

---

## Task Completion Overview
This project implements all required features for CS181DV Assignment 3: Immersive Visualization (3D/VR/AR).

### Task 1 - VR Environment Setup
✔ **Set up A-Frame environment** → Defined `<a-scene>` in `index.html`.
✔ **Configure VR camera and controls** → Implemented `camera-rig` with look-controls and wasd-controls.
✔ **Create basic scene lighting** → Added ambient and directional lights.
✔ **Implement error handling** → Used `try/catch` blocks for JSON loading failures in `script.js`.

### Task 2 - Basic Structure Visualization
✔ **Load and parse protein structure data** → Loaded from `structure.json` & `chains.json`.
✔ **Create 3D protein model** → Rendered using A-Frame entities (`a-sphere`, `a-cylinder`).
✔ **Implement different view styles** → Supported Ball & Stick, Space Filling, Backbone, Cartoon.
✔ **Add basic user movement** → Used wasd-controls for navigation.

### Task 3 - Interactive Features
✔ **Add selection capability** → Clicking on atoms highlights and displays details in an info panel.
✔ **Implement zoom/rotation controls** → Mouse drag rotates the model, and scroll zooms in/out.
✔ **Create information panels** → Displays element, ID, position, and chain** when an atom is clicked.
✔ **Enable component highlighting** → Atoms glow yellow when selected and green when hovered.

### Task 4 - Component Visualization
✔ **Display different protein chains** → Loaded from `chains.json`, each chain assigned a unique color.
✔ **Show/hide specific components** → Toggle buttons allow hiding or showing specific chains (A, B, C, D).
✔ **Add component labels** → Info panel labels the selected atom's element and chain.
✔ **Create color schemes** → Options for element-based coloring, chain coloring, and grayscale mode.

### Task 5 - Advanced Features
✔ **Implement measurement tools** → Users can click two atoms to measure the distance between them.
✔ **Add animation capabilities** → Smooth scaling animations added for visualization changes.
✔ **Create multi-view options** → Users can switch between default, top, and side views.
✔ **Enable structure comparison** → Showing andd hiding components allow comparison between representations.

---

## Features
**VR & WebGL Rendering** with A-Frame 
**Multiple View Modes**: Ball & Stick, Space Filling, Backbone, Cartoon  
**Interactive Controls**: Atom selection, highlighting, zoom, rotation  
**Component Visualization**: Toggle chains, color by element, grayscale  
**Measurement Tool**: Distance calculation between atoms  
**Animations & Multi-View Options**: Users can switch between default, top, and side views

---

Created by Aiko Kato - CS181DV Assignment 3
