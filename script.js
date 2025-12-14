/**
    CS181DV Assignment 3: Immersive Visualization (3D/VR/AR)

    Author: AIKO KATO

    Date: 03/13/2025

 */

// Register a new A-Frame component for setting up the VR environment
AFRAME.registerComponent('vr-environment', {
    schema: {
        structureFile: {type: 'string'}, // Path to the structure file
        displayMode: {type: 'string', default: 'basic'}, // Visualization mode
        highlightChain: {type: 'string'} // Specific chain to highlight
    },

    // Initialization function (called when the component is attached)
    init: function () {
        try {
            console.log('Initializing VR Environment...');
            this.loadStructure(); // Load molecular structure data
            this.createVisualization(); // Generate the visualization
            this.setupInteractions(); // Set up user interactions
        } catch (error) {
            console.error('Error initializing VR environment:', error);
        }
    },

    // Function to load the molecular structure file
    loadStructure: function () {
        try {
            console.log('Loading structure file:', this.data.structureFile);
        } catch (error) {
            console.error('Error loading structure:', error);
        }
    },

    // Function to create the base visualization of the molecular structure
    createVisualization: function () {
        try {
            console.log('Creating base visualization...');
        } catch (error) {
            console.error('Error creating visualization:', error);
        }
    },

    // Function to set up interactions (e.g., user input, highlighting, controls)
    setupInteractions: function () {
        try {
            console.log('Setting up global interactions...');
        } catch (error) {
            console.error('Error setting up interactions:', error);
        }
    }
});

// A-Frame component for handling the structure of the protein
AFRAME.registerComponent('structure-handler', {
    schema: {viewerMode: {type: 'string', default: 'ball-stick'} }, // Default visualization mode

    // Initialization function - called when the component is attached
    init: function () {
        console.log("Initializing Structure Handler...");
        this.proteinContainer = document.getElementById('protein-container'); // Get the container for the protein model
        this.viewerMode = 'ball-stick'; // Default viewing mode
        this.chainColors = {}; // Store colors assigned to different chains
        this.chainVisibility = {}; // Store visibility settings for chains
        this.atomChainMap = {}; // Map atoms to their respective chains
        this.colorScheme = 'element'; // Default coloring scheme based on element type
        this.loadStructure(); // Load molecular structure data
        this.setupEventListeners(); // Set up event listeners for interactions
    },

    // Function to asynchronously load the molecular structure data from JSON files
    loadStructure: async function () {
        try {
            console.log("Loading structure.json...");
            const response = await fetch('structure.json'); // Fetch structure data
            if (!response.ok) throw new Error("Failed to load structure.json");
            const data = await response.json();
            this.structureData = data.vertices; // Store atom data

            const chainsResponse = await fetch('chains.json'); // Fetch chain data
            if (!chainsResponse.ok) throw new Error("Failed to load chains.json");
            this.chainsData = await chainsResponse.json();

            // Assign atoms to their respective chains
            this.structureData.forEach(atom => {  // I used ChatGPT for these codes.
                for (let chainID in this.chainsData) {
                    if (this.chainsData[chainID].atoms.includes(atom.id)) {
                        this.atomChainMap[atom.id] = chainID;
                        break;
                    }
                }
            });

            // Assign unique colors to each chain
            Object.keys(this.chainsData).forEach((chainID, index) => {
                this.chainColors[chainID] = `hsl(${(index * 60) % 360}, 100%, 50%)`;
                this.chainVisibility[chainID] = true; // Initially set all chains to visible
            });

            console.log("Structure data loaded:", this.structureData.length, "atoms");
            this.renderVisualization(); // Render the protein model
            this.el.emit('structure-loaded', null, false); // Emit event to notify that the structure has been loaded
        } catch (error) {
            console.error("Error loading structure data:", error);
        }
    },

    // Function to clear the existing visualization
    clearVisualization: function () {
        while (this.proteinContainer.firstChild) {
            this.proteinContainer.removeChild(this.proteinContainer.firstChild);
        }
    },

    // Function to render the visualization based on the selected mode
    renderVisualization: function () {
        this.clearVisualization();
        console.log(`Rendering visualization in ${this.viewerMode} mode...`);

        // Animate out before clearing and re-rendering
        this.animateOut(() => {  // I used ChatGPT for these codes.
            this.clearVisualization();
            const scale = 0.3;

            if (this.viewerMode === 'ball-stick') {
                this.renderBallAndStick(scale);
            } else if (this.viewerMode === 'space-filling') {
                this.renderSpaceFilling(scale);
            } else if (this.viewerMode === 'backbone') {
                this.renderBackbone(scale);
            } else if (this.viewerMode === 'cartoon') {
                this.renderCartoon(scale);
            }

            // Animate back in after rendering
            this.animateIn();
        });
    },

    // Animation to shrink model before re-rendering
    animateOut: function (callback) {  // I used ChatGPT for these codes.
        const proteinContainer = this.proteinContainer;
        proteinContainer.setAttribute('animation', {
            property: 'scale',
            to: '0 0 0',
            dur: 500, // Half of the default animation speed (1000ms)
            easing: 'easeInOutQuad'
        });

        // Wait for animation to finish, then execute callback
        setTimeout(() => {
            callback();
        }, 500);
    },

    // Animation to grow model back after re-rendering
    animateIn: function () {
        const proteinContainer = this.proteinContainer;
        proteinContainer.setAttribute('animation', {
            property: 'scale',
            to: '1 1 1',
            dur: 500,
            easing: 'easeInOutQuad'
        });
    },

    // Function to render the Ball-and-Stick representation of the molecule
    renderBallAndStick: function (scale) {
        const bondDistance = 2.0; // Maximum distance for bonds to be drawn

        // Create spheres for atoms
        this.structureData.forEach(atom => {
            const chainID = this.getChainID(atom.id);
            if (chainID && !this.chainVisibility[chainID]) return; // Skip hidden chains
            let sphere = this.createAtomSphere(atom, scale / 1.5);

            // Assign color based on selected scheme
            if (this.colorScheme === 'chain' && chainID && this.chainColors[chainID]) {
                sphere.setAttribute('color', this.chainColors[chainID]);
            } else if (this.colorScheme === 'grayscale') {
                sphere.setAttribute('color', '#999999');
            }
            this.proteinContainer.appendChild(sphere);
        });

        // Create bonds between nearby atoms
        for (let i = 0; i < this.structureData.length; i++) {
            for (let j = i + 1; j < this.structureData.length; j++) {
                let atom1 = this.structureData[i];
                let atom2 = this.structureData[j];
                let distance = this.calculateDistance(atom1, atom2);

                if (distance < bondDistance) {
                    let bond = this.createBond(atom1, atom2, scale);
                    this.proteinContainer.appendChild(bond);
                }
            }
        }
    },

    // Function to render the Space-Filling representation of the molecule
    renderSpaceFilling: function (scale) {
        this.structureData.forEach(atom => {
            const chainID = this.getChainID(atom.id);
            if (chainID && !this.chainVisibility[chainID]) return; // Skip hidden chains

            let sphere = this.createAtomSphere(atom, scale * 1.5); // Larger spheres for space-filling
            
            // Assign color based on selected scheme
            if (this.colorScheme === 'chain' && chainID && this.chainColors[chainID]) {
                sphere.setAttribute('color', this.chainColors[chainID]);
            } else if (this.colorScheme === 'grayscale') {
                sphere.setAttribute('color', '#999999');
            }
            this.proteinContainer.appendChild(sphere);
        });
    },

    // Function to render the Backbone representation of the molecule
    renderBackbone: async function (scale) {
        console.log("Rendering Backbone...");

        try {
            // Fetch chain data
            const response = await fetch('chains.json');
            if (!response.ok) throw new Error("Failed to load chains.json");
            const chainsData = await response.json();

            let backboneAtoms = [];

            // Identify Carbon Alpha (CA) atoms for backbone visualization
            Object.keys(chainsData).forEach(chainID => {
                const chain = chainsData[chainID];

                // Check if the chain contains atom data
                if (!chain.atoms) {
                    console.warn(`Chain ${chainID} has no atoms! Skipping.`);
                    return;
                }

                // Find Carbon atoms from the structure data for each chain
                chain.atoms.forEach(atomID => {
                    let caAtom = this.structureData.find(atom => atom.id === atomID && atom.element === "C");
                    if (caAtom) {
                        caAtom.chainID = chainID; // Store chain ID in the atom object
                        backboneAtoms.push(caAtom); // Add to backbone atom list
                    }
                });
            });

            console.log(`Found ${backboneAtoms.length} backbone CA atoms.`);

            // Ensure at least one backbone atom is found
            if (backboneAtoms.length === 0) {
                console.error("No valid backbone atoms found. Check structure.json and chains.json.");
                return;
            }

            // Render spheres for backbone atoms
            backboneAtoms.forEach(atom => {
                const chainID = this.getChainID(atom.id);

                // Skip rendering if the chain is currently hidden
                if (chainID && !this.chainVisibility[chainID]) return;

                // Create a sphere for each backbone atom
                let sphere = this.createAtomSphere(atom, 0.4 * scale);

                // Assign color based on chain or default red
                if (this.colorScheme === 'chain' && chainID && this.chainColors[chainID]) {
                    sphere.setAttribute('color', this.chainColors[chainID]);
                } else if (this.colorScheme === 'grayscale') {
                    sphere.setAttribute('color', '#999999');
                } else {
                    sphere.setAttribute('color', '#FF5555'); // Default backbone color
                }

                // Add the sphere to the scene
                this.proteinContainer.appendChild(sphere);
            });

            // Render bonds between consecutive backbone atoms
            for (let i = 0; i < backboneAtoms.length - 1; i++) {
                const atom1 = backboneAtoms[i];
                const atom2 = backboneAtoms[i + 1];

                // Only connect atoms that belong to the same chain
                if (atom1.chainID === atom2.chainID) {
                    let midpoint = this.calculateMidpoint(atom1, atom2); // Get midpoint position
                    let distance = this.calculateDistance(atom1, atom2); // Compute distance between atoms

                    // Create a cylindrical bond between atoms
                    let bond = document.createElement('a-cylinder');
                    bond.setAttribute('position', `${midpoint.x * scale} ${midpoint.y * scale} ${midpoint.z * scale}`);
                    bond.setAttribute('height', distance * scale);
                    bond.setAttribute('radius', 0.15 * scale);
                    bond.setAttribute('color', '#FFAAAA'); // Light red for backbone bonds

                    // Make the bond point towards the second atom
                    bond.setAttribute('look-at', `${atom2.position[0] * scale} ${atom2.position[1] * scale} ${atom2.position[2] * scale}`);

                    // Add the bond to the scene
                    this.proteinContainer.appendChild(bond);
                }
            }

            console.log("Backbone rendering complete.");
        } catch (error) {
            console.error("Error processing backbone visualization:", error);
        }
    },

    // Function to render the Cartoon representation of the molecule
    renderCartoon: async function (scale) {
        console.log("Rendering Cartoon Representation...");

        // Fetch chain data
        try {
            const response = await fetch('chains.json');
            if (!response.ok) throw new Error("Failed to load chains.json");
            const chainsData = await response.json();

            let chainColors = {};
            let minResidue = Infinity, maxResidue = -Infinity;

            // Determine residue index range for color mapping
            Object.keys(chainsData).forEach(chainID => {
                const chain = chainsData[chainID];

                // Check if the chain contains atom data
                if (!chain.atoms) {
                    console.warn(`Chain ${chainID} has no atoms! Skipping.`);
                    return;
                }

                // Find the min and max residue indices for gradient color mapping
                minResidue = Math.min(minResidue, ...chain.atoms);
                maxResidue = Math.max(maxResidue, ...chain.atoms);
            });

            let resRange = maxResidue - minResidue; // Calculate residue range for normalization

            // Iterate through each chain and assign colors
            Object.keys(chainsData).forEach(chainID => {
                const chain = chainsData[chainID];

                // Assign a random hue to each chain
                chainColors[chainID] = `hsl(${(Math.random() * 360)}, 100%, 50%)`;

                // Store the last processed atom to create bonds
                let previousAtom = null;

                chain.atoms.forEach((atomID, index) => {
                    let atom = this.structureData.find(a => a.id === atomID && a.element === "C");

                    if (atom) {
                        const chainID = this.getChainID(atom.id);

                        // Skip rendering if the chain is currently hidden
                        if (chainID && !this.chainVisibility[chainID]) return;

                        // Normalize residue position to a value between 0 and 1 for color mapping
                        let normalizedPos = (atomID - minResidue) / resRange;
                        let hue = normalizedPos * 240; // Gradient color mapping

                        // Create a sphere for each backbone atom
                        let sphere = this.createAtomSphere(atom, 0.35 * scale);

                        // Assign color based on chain, grayscale, or position-based gradient
                        if (this.colorScheme === 'chain' && chainID && this.chainColors[chainID]) {
                            sphere.setAttribute('color', this.chainColors[chainID]);
                        } else if (this.colorScheme === 'grayscale') {
                            sphere.setAttribute('color', '#999999');
                        } else {
                            sphere.setAttribute('color', `hsl(${hue}, 100%, 50%)`);
                        }

                        // Add the sphere to the scene
                        this.proteinContainer.appendChild(sphere);

                        // Create cylindrical tubes connecting consecutive atoms
                        if (previousAtom) {
                            let midpoint = this.calculateMidpoint(previousAtom, atom); // Compute midpoint
                            let distance = this.calculateDistance(previousAtom, atom); // Compute distance

                            // Create a cylindrical bond between consecutive atoms
                            let tube = document.createElement('a-cylinder');  // I used ChatGPT for these codes.
                            tube.setAttribute('position', `${midpoint.x * scale} ${midpoint.y * scale} ${midpoint.z * scale}`);
                            tube.setAttribute('height', distance * scale);
                            tube.setAttribute('radius', 0.3 * scale);

                            // Apply same coloring logic as atoms
                            if (this.colorScheme === 'chain' && chainID && this.chainColors[chainID]) {
                                tube.setAttribute('color', this.chainColors[chainID]);
                            } else if (this.colorScheme === 'grayscale') {
                                tube.setAttribute('color', '#999999');
                            } else {
                                tube.setAttribute('color', `hsl(${hue}, 100%, 50%)`);
                            }

                            // Orient the tube to connect to the next atom
                            tube.setAttribute('look-at', `${atom.position[0] * scale} ${atom.position[1] * scale} ${atom.position[2] * scale}`);

                            // Add the bond to the scene
                            this.proteinContainer.appendChild(tube);
                        }

                        previousAtom = atom; // Update the previous atom for the next iteration
                    }
                });
            });

            console.log("Cartoon rendering complete.");
        } catch (error) {
            console.error("Error processing cartoon visualization:", error);
        }
    },

    // Function to get the color associated with a specific atom element
    getAtomColor: function (element) {
        const atomColors = {
            'C': '#808080', 'N': '#3050F8', 'O': '#FF0D0D', 'S': '#FFFF30'  // I used ChatGPT for coloring.
        };
        return atomColors[element] || '#AAAAAA'; // Default to light gray if element is not in the list
    },

    // Function to create a spherical representation of an atom in the 3D scene
    createAtomSphere: function (atom, radius) {
        let sphere = document.createElement('a-sphere'); // Create a sphere element in A-Frame
        sphere.setAttribute('position', `${atom.position[0] * 0.3} ${atom.position[1] * 0.3} ${atom.position[2] * 0.3}`); // Scale position (I used ChatGPT for this line)
        sphere.setAttribute('radius', radius); // Set the sphere's size
        sphere.setAttribute('color', this.getAtomColor(atom.element)); // Assign color based on the element type
        sphere.setAttribute('data-id', atom.id); // Store the atom's ID as a data attribute
        sphere.setAttribute('class', 'clickable'); // Make the atom selectable
        sphere.setAttribute('material', 'emissive: #000000; emissiveIntensity: 0'); // No emission glow by default
        return sphere;
    },

    // Function to create a cylindrical bond between two atoms
    createBond: function (atom1, atom2, scale) {
        let bond = document.createElement('a-cylinder'); // Create a cylindrical element for bonds
        let midpoint = this.calculateMidpoint(atom1, atom2); // Find midpoint between two atoms
        let distance = this.calculateDistance(atom1, atom2); // Compute the bond length

        bond.setAttribute('position', `${midpoint.x * scale} ${midpoint.y * scale} ${midpoint.z * scale}`); // Set bond position (I used ChatGPT for this line)
        bond.setAttribute('height', distance * scale); // Adjust bond length based on atom distance
        bond.setAttribute('radius', 0.05 * scale); // Set bond thickness
        bond.setAttribute('color', '#CCCCCC'); // Set bond color to light gray
        return bond;
    },

    // Function to calculate the midpoint between two atoms
    calculateMidpoint: function (a, b) {
        return { x: (a.position[0] + b.position[0]) / 2, y: (a.position[1] + b.position[1]) / 2, z: (a.position[2] + b.position[2]) / 2 };
    },

    // Function to calculate the Euclidean distance between two atoms
    calculateDistance: function (a, b) {
        return Math.sqrt((a.position[0] - b.position[0]) ** 2 + (a.position[1] - b.position[1]) ** 2 + (a.position[2] - b.position[2]) ** 2);
    },

    // Function to set up event listeners for UI interactions
    setupEventListeners: function () {
        // Event listener for Ball & Stick view mode
        document.getElementById('view-ball-stick').addEventListener('click', () => {
            console.log("Ball & Stick button clicked!");
            this.viewerMode = 'ball-stick';
            this.renderVisualization();
        });

        // Event listener for Space-Filling view mode
        document.getElementById('view-space-filling').addEventListener('click', () => {
            console.log("Space Filling button clicked!");
            this.viewerMode = 'space-filling';
            this.renderVisualization();
        });

        // Event listener for Backbone view mode
        document.getElementById('view-backbone').addEventListener('click', () => {
            console.log("Backbone button clicked!");
            this.viewerMode = 'backbone';
            this.renderVisualization();
        });

        // Event listener for Cartoon view mode
        document.getElementById('view-cartoon').addEventListener('click', () => {
            console.log("Cartoon button clicked!");
            this.viewerMode = 'cartoon';
            this.renderVisualization();
        });

        // Event listener for color scheme dropdown
        document.getElementById('color-scheme').addEventListener('change', (e) => {
            this.colorScheme = e.target.value; // Update the color scheme based on user selection
            this.renderVisualization();
        });

        // Event listeners to toggle visibility of individual protein chain A
        document.getElementById('toggle-chain-A').addEventListener('click', () => {
            if (this.chainVisibility['A'] !== undefined) {
                this.chainVisibility['A'] = !this.chainVisibility['A'];
                this.renderVisualization();
            }
        });

        // Event listeners to toggle visibility of individual protein chain B
        document.getElementById('toggle-chain-B').addEventListener('click', () => {
            if (this.chainVisibility['B'] !== undefined) {
                this.chainVisibility['B'] = !this.chainVisibility['B'];
                this.renderVisualization();
            }
        });

        // Event listeners to toggle visibility of individual protein chain C
        document.getElementById('toggle-chain-C').addEventListener('click', () => {
            if (this.chainVisibility['C'] !== undefined) {
                this.chainVisibility['C'] = !this.chainVisibility['C'];
                this.renderVisualization();
            }
        });
        
        // Event listeners to toggle visibility of individual protein chain D
        document.getElementById('toggle-chain-D').addEventListener('click', () => {
            if (this.chainVisibility['D'] !== undefined) {
                this.chainVisibility['D'] = !this.chainVisibility['D'];
                this.renderVisualization();
            }
        });        
    },

    // Function to retrieve the chain ID for a given atom ID
    getChainID: function (atomID) {
        return this.atomChainMap[atomID] || 'Unknown'; // Return chain ID or 'Unknown' if not found
    }
});

// A-Frame component for handling user interactions with the protein structure
AFRAME.registerComponent('interaction-manager', {
    schema: {
        activeElements: {type: 'array', default: []}, // Stores actively selected elements
        colorScheme: {type: 'string', default: 'default'}, // Defines how atoms are colored
        labelType: {type: 'string', default: 'element'} // Defines the type of label displayed
    },

    // Initializes the interaction manager and sets up event listeners
    init: function () {
        console.log("Interaction Manager Initialized");
        this.selectedAtom = null; // Stores the currently selected atom
        this.structureHandler = this.el.sceneEl.querySelector('[structure-handler]').components['structure-handler'];

        // If structure data is already available, initialize interactions
        if (this.structureHandler.structureData) {
            this.structureData = this.structureHandler.structureData;
            this.setupSelectionListeners();
            this.setupZoomRotation();
            this.setupVisibility();
        } else {
            // If structure data isn't available yet, wait for it to load
            this.structureHandler.el.addEventListener('structure-loaded', () => {
                this.structureData = this.structureHandler.structureData;
                this.setupSelectionListeners();
                this.setupZoomRotation();
                this.setupVisibility();
            });
        }
    },

    // Sets up event listeners for selecting and highlighting atoms
    setupSelectionListeners: function () {
        // Get the main container where protein atoms are rendered
        let proteinContainer = document.getElementById('protein-container');
        const infoPanel = document.getElementById('atom-info');

        // Check if the info panel exists before proceeding
        if (!infoPanel) {
            console.error("Could not find #atom-info element in the DOM!");
            return;
        }

        // Get reference to the structure-handler component
        const structureHandler = this.el.sceneEl.querySelector('[structure-handler]').components['structure-handler'];  // I used ChatGPT for this line.

        // Event listener for selecting an atom
        proteinContainer.addEventListener('click', (event) => {
            let clickedElement = event.target;
            let atomID = clickedElement.getAttribute('data-id');

            // If the clicked element has a valid atom ID, find and select it
            if (atomID) {
                let selectedAtom = this.structureData.find(a => a.id == atomID);
                if (selectedAtom) {
                    this.selectAtom(selectedAtom); // Call function to handle selection
                }
            }
        });

        // Event listener for highlighting an atom when the mouse hovers over it
        proteinContainer.addEventListener('mouseenter', (event) => {
            let hoveredElement = event.target;
            let atomID = hoveredElement.getAttribute('data-id');

            // If the hovered element has a valid atom ID, retrieve its details
            if (atomID) {
                let hoveredAtom = this.structureData.find(a => a.id == atomID);  // I used ChatGPT for these codes.
                if (hoveredAtom) {
                    console.log(`Hovering over atom: ${atomID}, Element: ${hoveredAtom.element}`);

                    // Change material properties to highlight the atom
                    hoveredElement.setAttribute('material', 'emissive', '#00FF00');
                    hoveredElement.setAttribute('material', 'emissiveIntensity', 0.3);

                    // Get the chain ID of the hovered atom
                    const chainID = structureHandler.getChainID(atomID);

                    // Update the information panel with atom details
                    infoPanel.innerHTML = `<strong>Element:</strong> ${hoveredAtom.element}<br>
                        <strong>ID:</strong> ${hoveredAtom.id}<br>
                        <strong>Position:</strong> (${hoveredAtom.position.join(', ')})<br>
                        <strong>Chain:</strong> ${chainID || 'Unknown'}`;
                    infoPanel.style.display = 'block'; // Make the info panel visible
                    console.log("Info panel should be visible");
                } else {
                    console.warn(`No atom found for ID: ${atomID}`);
                }
            }
        }, true);

        // Event listener for removing highlights when the mouse leaves an atom
        proteinContainer.addEventListener('mouseleave', (event) => {  // I used ChatGPT for these codes.
            let leftElement = event.target;
            let atomID = leftElement.getAttribute('data-id');

            // Remove highlight unless the atom is currently selected
            if (atomID && leftElement !== this.selectedAtom) {
                leftElement.setAttribute('material', 'emissive', '#000000');
                leftElement.setAttribute('material', 'emissiveIntensity', 0);
            }

            // Hide the information panel if no atom is currently selected
            if (!this.selectedAtom) {
                infoPanel.style.display = 'none';
                console.log("Info panel hidden");
            }
        }, true);
    },

    // Handles selection of an atom, updates highlighting and displays information
    selectAtom: function (atom) {
        console.log(`Selected Atom: ${atom.id}, Element: ${atom.element}`);

        // Reset previous selection highlight if a new atom is selected
        if (this.selectedAtom && this.selectedAtom.getAttribute('data-id') !== atom.id) {
            this.selectedAtom.setAttribute('material', 'emissive', '#000000'); // Remove glow effect
            this.selectedAtom.setAttribute('material', 'emissiveIntensity', 0);
        }

        // Highlight the selected atom
        let atomEntity = document.querySelector(`[data-id="${atom.id}"]`);
        if (atomEntity) {
            atomEntity.setAttribute('material', 'emissive', '#FFFF00'); // Yellow glow effect
            atomEntity.setAttribute('material', 'emissiveIntensity', 0.5);
            this.selectedAtom = atomEntity;
        }

        // Display atom details in the information panel
        let infoPanel = document.getElementById('atom-info');
        if (infoPanel) {
            infoPanel.innerHTML = `<strong>Element:</strong> ${atom.element}<br>
                        <strong>ID:</strong> ${atom.id}<br>
                        <strong>Position:</strong> (${atom.position.join(', ')})<br>
                        <strong>Chain:</strong> ${this.el.sceneEl.querySelector('[structure-handler]').components['structure-handler'].getChainID(atom.id) || 'Unknown'}`;
        } else {
            console.error("Could not find #atom-info in selectAtom!");
        }
    },

    // Enables zooming and rotation of the scene using the mouse and scroll wheel
    setupZoomRotation: function () {
        let scene = document.querySelector('a-scene'); // Get the VR scene
        let cameraRig = document.getElementById('camera-rig'); // Reference to the camera rig

        // Zoom in/out with the scroll wheel
        scene.addEventListener('wheel', (event) => {  // I used ChatGPT for these codes.
            let zoomSpeed = 0.1; // Define zoom speed
            cameraRig.object3D.position.z += event.deltaY * zoomSpeed; // Adjust camera position
        });

        let isDragging = false;
        let previousMouseX = 0;

        // Start rotation when mouse is pressed
        scene.addEventListener('mousedown', (event) => {
            isDragging = true;
            previousMouseX = event.clientX; // Store initial mouse position
        });

        // Rotate the camera when dragging the mouse
        scene.addEventListener('mousemove', (event) => {
            if (isDragging) {
                let rotationSpeed = 0.1; // Define rotation speed
                let deltaX = event.clientX - previousMouseX; // Calculate movement
                cameraRig.object3D.rotation.y -= deltaX * rotationSpeed; // Apply rotation
                previousMouseX = event.clientX; // Update previous mouse position
            }
        });

        // Stop rotation when the mouse is released
        scene.addEventListener('mouseup', () => {
            isDragging = false;
        });
    },

    // Toggles the visibility of the entire protein structure
    setupVisibility: function () {
        document.getElementById("toggle-visibility").addEventListener("click", () => {
            let proteinContainer = document.getElementById("protein-container"); // Get the protein container
            let isVisible = proteinContainer.getAttribute("visible"); // Get current visibility state

            // Toggle visibility of the protein container
            proteinContainer.setAttribute("visible", !isVisible);
        });
    }
});

// A-Frame component for handling advanced visualization features
AFRAME.registerComponent('advanced-features', {
    schema: {
        toolMode: {type: 'string', default: 'none'},  // Defines the active tool (none or measure)
        animationSpeed: {type: 'number', default: 1000}, // Speed of animations in milliseconds
        viewMode: {type: 'string', default: 'default'} // Camera view mode (default, top, side)
    },

    // Initializes the component and sets up tools, legend, and views
    init: function () {
        console.log("Initializing Advanced Features...");
        this.selectedAtoms = []; // Stores selected atoms for measurement
        this.setupTools(); // Sets up the measurement tool
        this.setupLegend(); // Adds a legend for element colors
        this.setupViews(); // Sets up different viewing angles
    },

    // Configures the measurement tool for calculating distances between atoms
    setupTools: function () {
        console.log("Setting up measurement tool...");

        // Get references to necessary DOM elements
        const proteinContainer = document.getElementById('protein-container');
        const infoPanel = document.getElementById('atom-info');
        const structureHandler = this.el.sceneEl.querySelector('[structure-handler]').components['structure-handler'];
    
        // Ensure all required elements exist
        if (!proteinContainer || !infoPanel || !structureHandler) {
            console.error("Missing required elements or structure handler");
            return;
        }
    
        let isProcessingClick = false; // Prevents duplicate clicks
    
        // Attach a raycaster to the camera for selection
        const camera = document.querySelector('a-camera');
        if (camera) {
            camera.setAttribute('raycaster', 'objects: .clickable');
        }
    
        // Handles atom selection for measurement
        this.el.sceneEl.addEventListener('click', (event) => {  // I used ChatGPT for these codes.

            // Ignore clicks if measurement mode is not enabled
            if (this.data.toolMode !== 'measure') {
                console.log("Measurement mode off, click ignored.");
                return;
            }
            // Prevent rapid successive clicks from interfering
            if (isProcessingClick) {
                console.log("Click already processing, ignoring duplicate.");
                return;
            }
            isProcessingClick = true; // Lock click processing
    
            const clickedElement = event.target;

            // Ensure the clicked object is an atom (must have the class 'clickable')
            if (!clickedElement || !clickedElement.classList.contains('clickable')) {
                console.log("Clicked outside an atom.");
                isProcessingClick = false;
                return;
            }
    
            // Retrieve the atom's unique identifier
            const atomID = clickedElement.getAttribute('data-id');
            if (!atomID) {
                console.log("Clicked element has no data-id:", clickedElement);
                isProcessingClick = false;
                return;
            }
    
            // Retrieve the atom entity and its data from the structure
            const atomEntity = document.querySelector(`[data-id="${atomID}"]`);  // I used ChatGPT for these codes.
            const atomData = structureHandler.structureData.find(a => a.id == atomID);
            if (!atomEntity || !atomData) {
                console.error(`No entity or data for atom ID: ${atomID}`);
                isProcessingClick = false;
                return;
            }
    
            console.log(`Selected atom ${atomID} (${atomData.element})`);
    
            // Select up to two atoms for measurement
            if (this.selectedAtoms.length < 2) {
                this.selectedAtoms.push({ entity: atomEntity, data: atomData });
                // Highlight the selected atom with a yellow glow
                atomEntity.setAttribute('material', 'emissive', '#FFFF00');
                atomEntity.setAttribute('material', 'emissiveIntensity', 0.5);
            }
    
            // If exactly two atoms have been selected, calculate and display their distance
            if (this.selectedAtoms.length === 2) {
                const atom1 = this.selectedAtoms[0].data;
                const atom2 = this.selectedAtoms[1].data;
                const scale = 0.3; // Scaling factor for visualization
                const distance = structureHandler.calculateDistance(atom1, atom2) * scale * 0.1; // Convert Å to nm (I used ChatGPT for this line)
                infoPanel.innerHTML = `<strong>Distance:</strong> ${distance.toFixed(3)} nm<br>
                                        Atom 1: ${atom1.id} (${atom1.element})<br>
                                        Atom 2: ${atom2.id} (${atom2.element})`;

                // Display measurement information in the info panel
                infoPanel.style.display = 'block';
    
                // Draw a visual measurement line between the selected atoms
                this.drawMeasurementLine(atom1, atom2, scale);
    
                // Automatically reset selection after 5 seconds
                setTimeout(() => {
                    this.resetSelection();
                }, 5000);
            }
    
            // Allow processing of new clicks after a short delay
            setTimeout(() => {
                isProcessingClick = false;
            }, 300);
        });
    
        // Toggles the measurement mode on and off
        const toggleButton = document.getElementById('toggle-measurement');
        if (!toggleButton) {
            console.error("#toggle-measurement button not found.");
            return;
        }
    
        toggleButton.addEventListener('click', () => {
            // Switch between 'measure' mode and 'none' mode
            this.data.toolMode = this.data.toolMode === 'measure' ? 'none' : 'measure';
            console.log(`Measurement tool toggled to: ${this.data.toolMode}`);
        
            // If measurement mode is turned off, reset the selection and allow new clicks
            if (this.data.toolMode === 'none') {
                this.resetSelection();
                isProcessingClick = false;
            }
        });
    },    

    // Draws a line between two selected atoms to visualize the measured distance
    drawMeasurementLine: function (atom1, atom2, scale) {
        // Remove any existing measurement line before drawing a new one
        this.removeMeasurementLine();

        const structureHandler = this.el.sceneEl.querySelector('[structure-handler]').components['structure-handler'];  // I used ChatGPT for these codes.
        const midpoint = structureHandler.calculateMidpoint(atom1, atom2); // Compute the midpoint between atoms
        const distance = structureHandler.calculateDistance(atom1, atom2) * scale; // Calculate scaled distance

        // Create a thin cylindrical line to represent the bond
        const line = document.createElement('a-cylinder');
        line.setAttribute('position', `${midpoint.x * scale} ${midpoint.y * scale} ${midpoint.z * scale}`);
        line.setAttribute('height', distance); // Set the height of the cylinder to match the atom distance
        line.setAttribute('radius', 0.02); // Set a small radius for a thin line
        line.setAttribute('color', '#FFFF00'); // Yellow color for visibility
        line.setAttribute('id', 'measurement-line'); // Assign an ID for easy removal

        // Ensure the cylinder is oriented to point toward the second atom
        line.setAttribute('look-at', `${atom2.position[0] * scale} ${atom2.position[1] * scale} ${atom2.position[2] * scale}`);

        // Append the measurement line to the protein container
        document.getElementById('protein-container').appendChild(line);
        console.log("Measurement line drawn.");
    },

    // Removes the measurement line from the scene
    removeMeasurementLine: function () {
        const existingLine = document.getElementById('measurement-line');

        // If the measurement line exists, remove it from the DOM
        if (existingLine) {
            existingLine.parentNode.removeChild(existingLine);
            console.log("Measurement line removed.");
        }
    },

    // Resets the selected atoms and clears the measurement display
    resetSelection: function () {
        // Reset highlighting for previously selected atoms
        this.selectedAtoms.forEach(atom => {
            atom.entity.setAttribute('material', 'emissive', '#000000'); // Remove glow effect
            atom.entity.setAttribute('material', 'emissiveIntensity', 0);
        });

        // Clear the selection array
        this.selectedAtoms = [];

        // Remove any existing measurement line
        this.removeMeasurementLine();

        // Hide the atom info panel
        document.getElementById('atom-info').style.display = 'none';

        console.log("Selection reset.");
    },

    // Ensures the legend is visible
    setupLegend: function () {
        console.log("Updating existing legend...");
        let legend = document.getElementById('legend');

        // If the legend panel exists, ensure it's displayed
        if (!legend) {
            console.warn("Legend element not found!");
            return;
        }
        legend.style.display = 'block'; // Ensure it's visible
    },    

    // Handles animations when switching between views
    createAnimations: function () {
        console.log("Setting up view mode animations...");

        // Selects all control buttons that trigger animations
        let buttons = document.querySelectorAll('.controls button');

        // Adds a click event listener to each button
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                let proteinContainer = document.getElementById('protein-container'); // Gets the 3D protein model container
                let speed = this.data.animationSpeed; // Retrieves animation speed from component data

                // Shrinks the model to disappear before transitioning to a new state
                proteinContainer.setAttribute('animation', {  // I used ChatGPT for these codes.
                    property: 'scale',
                    to: '0 0 0',
                    dur: speed / 2, // First half of the animation duration
                    easing: 'easeInOutQuad'
                });

                // After the shrink animation completes, expand the model back to normal size
                setTimeout(() => {  // I used ChatGPT for these codes.
                    proteinContainer.setAttribute('animation', {
                        property: 'scale',
                        to: '1 1 1',
                        dur: speed / 2, // Second half of the animation duration
                        easing: 'easeInOutQuad'
                    });
                }, speed / 2);
            });
        });
    },

    // Configures different camera views (default, top, side) and allows toggling between them
    setupViews: function () {
        console.log("Setting up multi-view options...");
        let cameraRig = document.getElementById('camera-rig'); // Gets the camera rig entity

        // Defines different camera positions and rotations for each view mode
        let views = {
            default: {position: "0 1.6 4", rotation: "0 0 0"},  // Standard forward-facing view
            top: {position: "0 5 0", rotation: "-90 0 0"},  // Top-down view
            side: {position: "-5 2 5", rotation: "0 45 0"}  // Angled side view
        };

        // Adds an event listener to toggle between different views when the button is clicked
        document.getElementById('toggle-view').addEventListener('click', () => {
            // Cycles through the view modes in order: default → top → side → default
            let nextView = this.data.viewMode === 'default' ? 'top' : this.data.viewMode === 'top' ? 'side' : 'default';
            this.data.viewMode = nextView;

            // Animate camera movement to the new position
            cameraRig.setAttribute('animation', {
                property: 'position',
                to: views[nextView].position, // Moves camera to the target position
                dur: 800, // Animation duration in milliseconds
                easing: 'easeInOutQuad' // Smooth transition
            });

            // Animate camera rotation to match the selected view
            cameraRig.setAttribute('animation__rotation', {
                property: 'rotation',
                to: views[nextView].rotation, // Rotates camera to the target orientation
                dur: 800,
                easing: 'easeInOutQuad'
            });

            console.log(`View Mode: ${this.data.viewMode}`); // Logs the active view mode
        });
    }
});

// Attach the component to the scene
document.querySelector('a-scene').setAttribute('advanced-features', '');
