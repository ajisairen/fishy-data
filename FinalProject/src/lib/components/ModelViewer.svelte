<script lang="ts">
    import { onMount } from "svelte";
    import * as THREE from "three";
    import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

    export let modelPath: string; // .glb model path
    export let scale: number = 1; // default .glb model scale
    export let width: number = 800; // default canvas width
    export let height: number = 600; // default canvas height

    let container: HTMLDivElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;

    onMount(() => {
        // Initialize scene, camera, and renderer
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x808080);
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        // Ambient Light
        const ambient = new THREE.AmbientLight(0xffffff);
        scene.add(ambient);

        // Directional Light
        const light = new THREE.DirectionalLight(0xffffff, 3);
        scene.add(light);

        // Load the model
        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;

                model.traverse((child) => {
                    if (child.isMesh) {
                        // child.material.transparent = false;
                        child.material.depthWrite = true;
                    }
                });
                
                model.scale.set(scale, scale, scale); // Apply scale
                scene.add(model);
            },
            undefined,
            (error) => {
                console.error("Error loading .glb model:", error);
            },
        );

        // OrbitControls for rotation
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Smooth rotation
        controls.dampingFactor = 0.05;

        camera.position.set(0, 2, 5);
        controls.update();

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
    });
</script>

<div bind:this={container} style="width: {width}px; height: {height}px;"></div>
