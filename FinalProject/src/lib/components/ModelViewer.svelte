<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import * as THREE from "three";
    import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

    export let species: string; // fish species model to show
    export let width: string = "800px";   // default width
    export let height: string = "400px";  // default height

    let container: HTMLDivElement;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;

    const fishModels: Record<string, string> = {
        "white sucker":         "/models/white_sucker.glb",
        walleye:                "/models/walleye.glb",
        pumpkinseed:            "/models/pumpkinseed.glb",
        bluegill:               "/models/bluegill.glb",
        "largemouth bass":      "/models/largemouth_bass.glb",
        "yellow perch":         "/models/yellow_perch.glb",
        "rock bass":            "/models/rock_bass.glb",
        "tullibee (cisco)":     "/models/tullibee_cisco.glb",
        "brown bullhead":       "/models/brown_bullhead.glb",
        "northern pike":        "/models/northern_pike.glb",
        "black crappie":        "/models/black_crappie.glb",
        "yellow bullhead":      "/models/yellow_bullhead.glb",
        burbot:                 "/models/burbot.glb",
        "shorthead redhorse":   "/models/shorthead_redhorse.glb"
    };

    const fishSizes: Record<string, number> = {
        "white sucker":         5,
        walleye:                5,
        pumpkinseed:            5,
        bluegill:               25,
        "largemouth bass":      25,
        "yellow perch":         5,
        "rock bass":            5,
        "tullibee (cisco)":     5,
        "brown bullhead":       5,
        "northern pike":        5,
        "black crappie":        5,
        "yellow bullhead":      5,
        burbot:                 5,
        "shorthead redhorse":   5
    };

    const fishCameraPos: Record<string, number[]> = {
        "white sucker":         [5, 0, -1.75],
        walleye:                [5, 0, -1.75],
        pumpkinseed:            [5, 0, -1.75],
        bluegill:               [5, 0, -1.75],
        "largemouth bass":      [5, 0, -1.75],
        "yellow perch":         [5, 0, -1.75],
        "rock bass":            [5, 0, -1.75],
        "tullibee (cisco)":     [5, 0, -1.75],
        "brown bullhead":       [5, 0, -1.75],
        "northern pike":        [5, 0, -1.75],
        "black crappie":        [5, 0, -1.75],
        "yellow bullhead":      [5, 0, -1.75],
        burbot:                 [5, 0, -1.75],
        "shorthead redhorse":   [5, 0, -1.75]
    };

    function createModelViewer() {
        // Initialize scene, camera, and renderer
        scene = new THREE.Scene();
        const rect = container.getBoundingClientRect();
        camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(rect.width, rect.height);
        container.appendChild(renderer.domElement);

        // Ambient Light
        const ambient = new THREE.AmbientLight(0xffffff);
        scene.add(ambient);

        // Directional Light
        const light = new THREE.DirectionalLight(0xffffff, 3);
        scene.add(light);

        // Load the model
        loadModel(fishModels[species]);

        // OrbitControls for rotation
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Smooth rotation
        controls.dampingFactor = 0.25;

        // Camera setup
        const cameraPos = fishCameraPos[species];
        camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);
        controls.target.set(0, cameraPos[1], cameraPos[2]);
        controls.update();

        // Animation loop
        animate();
    }

    function loadModel(modelPath: string) {
        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;

                model.traverse((child) => {
                    if (child.isMesh) {
                        child.material.depthWrite = true;
                    }
                });
                
                model.scale.set(fishSizes[species], fishSizes[species], fishSizes[species]); // Apply scale
                scene?.add(model);
            },
            undefined,
            (error) => {
                console.error("Error loading .glb model:", error);
            },
        );
    }

    function animate() {
        requestAnimationFrame(animate);
        controls?.update();
        renderer?.render(scene!, camera!);
    }

    onMount(() => {
        createModelViewer();
    });
</script>

<div bind:this={container} style="width: {width}; height: {height};"></div>