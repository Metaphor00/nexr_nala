import * as THREE from './three.module.min.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.132.2/examples/jsm/controls/OrbitControls.js';



        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        // Add OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 5, 5);
        scene.add(directionalLight);

        // Grid Helper
        const gridHelper = new THREE.GridHelper(10, 10);
        scene.add(gridHelper);

        // GLB Loader with proper error handling
        const loader = new GLTFLoader();
const loadingDiv = document.getElementById('loading');

// Debug path construction
const actualPath = modelFile.startsWith('/') ? modelFile : '/' + modelFile;
console.log('Attempting to load from:', actualPath);

// Create XMLHttpRequest to test file availability
const xhr = new XMLHttpRequest();
xhr.open('HEAD', actualPath, true);
xhr.onload = function() {
    console.log('File check status:', xhr.status);
    console.log('Content-Type:', xhr.getResponseHeader('Content-Type'));
    xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
};
xhr.send();

try {
    loader.load(
        actualPath,
        function (gltf) {
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            model.position.sub(center);
            
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.set(0, maxDim, maxDim * 2);
            camera.lookAt(0, 0, 0);
            
            scene.add(model);
            loadingDiv.style.display = 'none';
        },
        function (xhr) {
            const percent = (xhr.loaded / xhr.total * 100).toFixed(2);
            loadingDiv.textContent = `Loading: ${percent}%`;
            console.log(`Loading progress: ${percent}%`);
        },
        function (error) {
            console.error('Error loading model:', error);
            console.error('Error details:', {
                path: actualPath,
                error: error.message || error
            });
            loadingDiv.textContent = `Error loading model: ${error.message || 'Unknown error'}`;
        }
    );
} catch (error) {
    console.error('Loader setup error:', error);
    loadingDiv.textContent = 'Error in loader setup!';
}

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    