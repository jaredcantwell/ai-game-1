// Three.js Scene Setup
let scene, camera, renderer;
let runway, ground;
let bushes = [];
let buildings = [];
let centerLines = [];

// Control variables
let keys = {};
let cameraX = 0;
let cameraY = 1.5; // Slightly higher above runway
let cameraRoll = 0;
let cameraPitch = 0;
let cameraYaw = 0; // Yaw angle that persists

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 100, 1000);
    
    // Create camera - positioned to look down the runway
    camera = new THREE.PerspectiveCamera(
        75, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    
    // Position camera above and behind where a glider would be
    camera.position.set(0, 1.5, 10); // Slightly higher above runway
    camera.lookAt(0, 0, -50);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87CEEB); // Sky blue background
    document.getElementById('gameCanvas').appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(10, 20, 5);
    scene.add(directionalLight);
    
    // Create runway
    createRunway();
    
    // Create ground
    createGround();
    
    // Create bushes
    createBushes();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Add keyboard controls
    document.addEventListener('keydown', (event) => {
        keys[event.code] = true;
    });
    
    document.addEventListener('keyup', (event) => {
        keys[event.code] = false;
    });
}

function createRunway() {
    // Runway geometry - a long, skinnier rectangle
    const runwayGeometry = new THREE.PlaneGeometry(12, 500);
    const runwayMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        roughness: 0.8
    });
    
    runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
    runway.rotation.x = -Math.PI / 2; // Rotate to lie flat
    runway.position.y = 0.01; // Slightly above ground to prevent z-fighting
    runway.position.z = -200; // Center it in front of camera
    
    scene.add(runway);
}

function createGround() {
    // Create large ground plane
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x228B22, // Green grass
        roughness: 1
    });
    
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);
}

function createBushes() {
    // Bush geometry - simple sphere for now
    const bushGeometry = new THREE.SphereGeometry(2, 8, 6);
    const bushMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0F5F0F,
        roughness: 1
    });
    
    // Create bushes along both sides of the runway
    const bushSpacing = 30;
    const runwayHalfWidth = 6; // Updated for skinnier runway
    const bushDistance = 15;
    
    for (let i = 0; i < 30; i++) {
        // Left side bush
        const leftBush = new THREE.Mesh(bushGeometry, bushMaterial);
        leftBush.position.set(
            -(runwayHalfWidth + bushDistance),
            1,
            -400 + (i * bushSpacing)
        );
        leftBush.scale.y = 0.8; // Make bushes slightly flattened
        scene.add(leftBush);
        bushes.push(leftBush);
        
        // Right side bush
        const rightBush = new THREE.Mesh(bushGeometry, bushMaterial);
        rightBush.position.set(
            runwayHalfWidth + bushDistance,
            1,
            -400 + (i * bushSpacing)
        );
        rightBush.scale.y = 0.8;
        scene.add(rightBush);
        bushes.push(rightBush);
        
        // Add some small buildings/hangars occasionally
        if (i % 5 === 0 && i > 0) {
            const buildingGeometry = new THREE.BoxGeometry(10, 8, 15);
            const buildingMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x8B4513
            });
            
            // Left side building
            const leftBuilding = new THREE.Mesh(buildingGeometry, buildingMaterial);
            leftBuilding.position.set(
                -(runwayHalfWidth + bushDistance + 20),
                4,
                -400 + (i * bushSpacing)
            );
            scene.add(leftBuilding);
            buildings.push(leftBuilding);
            
            // Right side building
            const rightBuilding = new THREE.Mesh(buildingGeometry, buildingMaterial);
            rightBuilding.position.set(
                runwayHalfWidth + bushDistance + 20,
                4,
                -400 + (i * bushSpacing)
            );
            scene.add(rightBuilding);
            buildings.push(rightBuilding);
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Handle controls
    updateControls();
    
    // Speed: ~40 mph = ~18 m/s = ~0.3 units per frame at 60fps
    const speed = 1.25; // Adjusted for realistic 35-45 mph feel
    
    // Move everything toward the camera to create motion effect
    runway.position.z += speed;
    if (runway.position.z > 200) {
        runway.position.z = -200;
    }
    
    // Move bushes and reset them when they pass the camera
    bushes.forEach(bush => {
        bush.position.z += speed;
        if (bush.position.z > 20) {
            bush.position.z -= 450;
        }
    });
    
    // Move buildings
    buildings.forEach(building => {
        building.position.z += speed;
        if (building.position.z > 20) {
            building.position.z -= 450;
        }
    });
    
    renderer.render(scene, camera);
}

function updateControls() {
    // Left/Right aileron controls (only affect roll)
    if (keys['ArrowLeft']) {
        cameraRoll = Math.min(cameraRoll + 1, 30); // Roll right
    } else if (keys['ArrowRight']) {
        cameraRoll = Math.max(cameraRoll - 1, -30); // Roll left
    }
    
    // A/D rudder controls (affect yaw angle and add roll while pressed)
    if (keys['KeyA']) {
        cameraYaw = Math.max(cameraYaw - 0.8, -45); // Yaw left (negative)
        cameraRoll = Math.min(cameraRoll + 0.65, 30); // Add left roll while pressing A
    } else if (keys['KeyD']) {
        cameraYaw = Math.min(cameraYaw + 0.8, 45); // Yaw right (positive)
        cameraRoll = Math.max(cameraRoll - 0.65, -30); // Add right roll while pressing D
    }
    
    // Movement based on yaw angle (rudder deflection causes continuous movement)
    cameraX += cameraYaw * 0.015; // Yaw angle determines movement direction and speed
    
    // Movement based on roll angle (banking turns)
    // Positive roll = right bank = move left, Negative roll = left bank = move right
    cameraX -= cameraRoll * 0.01;
    
    // Up/Down pitch only (no position change)
    if (keys['ArrowUp'] || keys['KeyW']) {
        cameraPitch = Math.min(cameraPitch + 0.5, 15); // Pitch up
    } else if (keys['ArrowDown'] || keys['KeyS']) {
        cameraPitch = Math.max(cameraPitch - 0.5, -15); // Pitch down
    } else {
        // Return pitch to level gradually
        cameraPitch *= 0.95;
    }
    
    // Limit camera movement
    cameraX = Math.max(-20, Math.min(20, cameraX));
    
    // Apply camera position and rotation
    camera.position.x = cameraX;
    // Slightly higher above runway
    camera.position.y = 1.5;
    camera.rotation.z = cameraRoll * Math.PI / 180; // Roll
    camera.rotation.x = cameraPitch * Math.PI / 180; // Pitch
    camera.rotation.y = -cameraYaw * Math.PI / 180; // Yaw (inverted for correct visual)
}

// Initialize and start
init();
animate();