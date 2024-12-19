// Import Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the road with a repeating texture
const roadTexture = new THREE.TextureLoader().load('path_to_road_texture.jpg'); // Replace with your road texture
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set(5, 10); // Control how many times the texture repeats

const roadGeometry = new THREE.PlaneGeometry(5, 1000, 1, 1); // Width, length
const roadMaterial = new THREE.MeshBasicMaterial({ map: roadTexture });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2; // Rotate the road so it's flat on the ground
scene.add(road);

// Variables for the car and physics
let carModel, carSpeed = 0, carRotation = 0;
const carVelocity = { x: 0, z: 0 }; // For smooth acceleration and deceleration
const maxSpeed = 0.3;
const acceleration = 0.01;
const deceleration = 0.005;
const turnSpeed = 0.05;
const keys = {};
const friction = 0.98; // Simulate friction for deceleration

// Load the 3D car model
const loader = new THREE.GLTFLoader();
loader.load('path_to_car_model.glb', function (gltf) {
    carModel = gltf.scene;
    carModel.position.set(0, 0.25, 0); // Position the car on the road
    scene.add(carModel);

    // Start the game loop
    update();
});

// Camera position
camera.position.set(0, 2, 5); // Starting position for a better view
camera.lookAt(0, 0.25, 0); // Look at the car's initial position

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update function
function update() {
    // Smooth acceleration and deceleration
    if (keys['ArrowUp']) {
        carSpeed = Math.min(carSpeed + acceleration, maxSpeed); // Accelerate
    }
    if (keys['ArrowDown']) {
        carSpeed = Math.max(carSpeed - deceleration, -0.1); // Decelerate
    }

    // Smooth turning
    if (keys['ArrowLeft']) {
        carRotation += turnSpeed; // Turn left
    } else if (keys['ArrowRight']) {
        carRotation -= turnSpeed; // Turn right
    } else {
        // Gradually return the car to the default straight position
        if (carRotation > 0) {
            carRotation -= turnSpeed / 2;
        } else if (carRotation < 0) {
            carRotation += turnSpeed / 2;
        }
    }

    // Apply the rotation to the car model
    if (carModel) {
        carModel.rotation.y = carRotation;
    }

    // Update car's position with friction to simulate smooth deceleration
    carVelocity.z = carSpeed;
    carVelocity.z *= friction; // Apply friction for smooth deceleration
    if (carModel) {
        carModel.position.z -= carVelocity.z;
    }

    // Smooth camera follow
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, carModel.position.z + 5, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, carModel.position.y + 2, 0.05);
    camera.rotation.x = -Math.PI / 8; // Tilt the camera slightly
    camera.lookAt(carModel.position); // Ensure the camera looks at the car

    // Render the scene
    renderer.render(scene, camera);

    // Repeat the update function
    requestAnimationFrame(update);
}
