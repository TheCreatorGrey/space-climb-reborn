import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
});

const resulution = 1;
renderer.setSize(window.innerWidth / resulution, window.innerHeight / resulution);
renderer.domElement.style.width = (renderer.domElement.width * resulution) + 'px';
renderer.domElement.style.height = (renderer.domElement.height * resulution) + 'px';
document.body.appendChild(renderer.domElement);
camera.position.set(0, 250, 0);

const textureLoader = new THREE.TextureLoader();

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



// This variable determines the behavior
// of the camera and controls. 
// If "main", the camera will orbit 
// as seen in the title screen, because 
// "main" represents the title screen.
// In this stage, controls will also be disabled.
// If "game", all of the game mechanics will
// run and the camera will be controlled by the player
// If "ending" a menu will be shown and the game 
// will stop
var stage = 'main';




// All of this junk makes the ground plane
const texture = textureLoader.load(`./assets/tile.png`);
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
texture.needsUpdate = true;

const groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100), 
    new THREE.MeshBasicMaterial({map: texture})
);

groundPlane.material.map.repeat.set(100, 100);
groundPlane.material.map.wrapS = THREE.RepeatWrapping;
groundPlane.material.map.wrapT = THREE.RepeatWrapping;

groundPlane.rotation.x = -Math.PI / 2;
scene.add(groundPlane);


// Jump indicator
const pointer = new THREE.Mesh(
    new THREE.SphereGeometry(), 

    new THREE.MeshBasicMaterial(
        {color: 0x00FF00, transparent: true, opacity: .5}
    )
);
scene.add(pointer);




function randNum(min, max) {
    return Math.random() * (max - min) + min
}







// Interface stuff \/\/\/\/

const interfaceContainer = document.getElementById("interface");
const menuContainer = document.getElementById("menu");
const menuContent = document.getElementById("menu-content");

function openMenu(html) {
    menuContent.innerHTML = html;
    menuContainer.hidden = false;
    enableInterface();
}

function closeMenu() {
    menuContent.innerHTML = '';
    menuContainer.hidden = true
}

function enableInterface() {
    interfaceContainer.hidden = false
}

function disableInterface() {
    closeMenu();
    interfaceContainer.hidden = true
}


document.getElementById("credsbtn").onclick = () => {
    openMenu(
        `
        Game by TheCreatorGrey <br><br>

        Made with Three.js <br><br>

        Icons designed with piskel.com <br><br>

        Font by GGBot.net <br><br>
        `
    )
}

document.getElementById("tutbtn").onclick = () => {
    openMenu(
        `
		Your goal is to get to the top. <br><br>

		There will be an orb where you are looking. <br><br>

		If it is green, it is close enough that you can jump. If it is red, that means it is too far to jump. <br> <br>

		Jump between the blocks to get to the top. <br><br>

		Move your mouse to look and click to jump.
        `
    )
}

const closeMenuButton = document.getElementById("menu-close");
closeMenuButton.onclick = () => {closeMenu()}

// =========================================







// This is all level generation stuff \/\/\/

let blockGeometry = new THREE.BufferGeometry();
let vertices = [];
let colors = [];

// Adds a quad to the mesh
function quad(p1, p2, p3, p4, color, brightness) {
    // p1 = bottom left, 
    // p2 = top left,
    // p3 = top right,
    // p4 = bottom right

    vertices.push(
        ...[
            p1[0], p1[1], p1[2], // top left triangle
            p2[0], p2[1], p2[2],
            p3[0], p3[1], p3[2],
            p3[0], p3[1], p3[2], // bottom right triangle
            p4[0], p4[1], p4[2],
            p1[0], p1[1], p1[2],
        ]
    )

    let c = color;
    c[0] *= brightness;
    c[1] *= brightness;
    c[2] *= brightness;

    colors.push(
        ...[
            c[0], c[1], c[2], 
            c[0], c[1], c[2], 
            c[0], c[1], c[2], 
            c[0], c[1], c[2], 
            c[0], c[1], c[2], 
            c[0], c[1], c[2], 
        ]
    )
}

// Adds a cube to the mesh
function cube(color, position, scale) {
    let corners = [
        [-1, -1, -1], // Bottom 4 corners
        [-1, -1, 1],
        [1, -1, 1],
        [1, -1, -1],

        [-1, 1, -1], // Top 4 corners
        [-1, 1, 1],
        [1, 1, 1],
        [1, 1, -1]
    ]


    let axis = new THREE.Vector3(
        randNum(0, 1), 
        randNum(0, 1), 
        randNum(0, 1)
    );
    let rotationAmount = randNum(0, Math.PI)
    let positionVector = new THREE.Vector3(...position);
    let scaleVector = new THREE.Vector3(...scale);
    scaleVector.multiply(new THREE.Vector3(.5, .5, .5));

    for (let c in corners) {
        let corner = corners[c];
        let vector = new THREE.Vector3(...corner);

        vector.multiply(scaleVector);
        vector.applyAxisAngle(axis, rotationAmount)
        vector.add(positionVector);

        corners[c] = [vector.x, vector.y, vector.z]
    }

    

    quad( // bottom
        corners[3],
        corners[2],
        corners[1],
        corners[0],
        color, 1-randNum(0, .1)
    )

    quad( // top
        corners[4],
        corners[5],
        corners[6],
        corners[7],
        color, 1-randNum(0, .1)
    )

    quad( // side
        corners[7],
        corners[6],
        corners[2],
        corners[3],
        color, 1-randNum(0, .1)
    )

    quad( // side
        corners[0],
        corners[1],
        corners[5],
        corners[4],
        color, 1-randNum(0, .1)
    )

    quad( // side
        corners[0],
        corners[4],
        corners[7],
        corners[3],
        color, 1-randNum(0, .1)
    )

    quad( // side
        corners[2],
        corners[6],
        corners[5],
        corners[1],
        color, 1-randNum(0, .1)
    )
}





for (let i = 0; i < 5000; i++) {
    cube(
        [
            Math.random(),
            Math.random(),
            Math.random()
        ], [
            randNum(-50, 50),
            randNum(0, 500),
            randNum(-50, 50)
        ], [
            randNum(1, 5),
            randNum(1, 5),
            randNum(1, 5)
        ],
    )
}



blockGeometry.setAttribute('position',
    new THREE.BufferAttribute(
        new Float32Array(vertices),
        3
    )
);

blockGeometry.setAttribute('color',
    new THREE.BufferAttribute(
        new Float32Array(colors),
        3
    )
);

let blockMesh = new THREE.Mesh(
    blockGeometry, 
    new THREE.MeshBasicMaterial(
        {vertexColors: true}
    )
)
scene.add(blockMesh);

// =========================================












const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();

const targets = scene.children.filter(obj => obj !== pointer);

var targetPos;
function startGame() {
    document.getElementById('banner').remove();
    document.getElementById('playbtn').remove();
    document.getElementById('credsbtn').remove();
    document.getElementById('tutbtn').remove();
    document.getElementById('version-identifier').remove();

    //titleMusic.pause()
    
    camera.fov = 90;
    //camera.position.set(0, 1.8, 0);
    stage = 'game';

    const controls = new PointerLockControls(camera, renderer.domElement);

    renderer.domElement.requestPointerLock();

    targetPos = new THREE.Vector3(0, 1.8, 0);
    renderer.domElement.onclick = async function() {
        renderer.domElement.requestPointerLock();

        if (pointer.material.color.g === 1) {
            targetPos.x = pointer.position.x;
            targetPos.y = pointer.position.y + 1.8;
            targetPos.z = pointer.position.z;
        }
    }

    pressedKeys = {};
    window.onkeyup = function(e) { pressedKeys[e.key] = false; }
    window.onkeydown = function(e) { pressedKeys[e.key] = true; }
}

document.getElementById('playbtn').onclick = startGame;


function animate() {
    requestAnimationFrame(animate);

    if (stage === 'main') {
        camera.rotation.y += .002
    } else if (stage === 'game'){
        camera.position.set(
            camera.position.x-((camera.position.x - targetPos.x)/10), 
            camera.position.y-((camera.position.y - targetPos.y)/10), 
            camera.position.z-((camera.position.z - targetPos.z)/10)
        )

        camera.getWorldDirection(direction);
        raycaster.set(camera.position, direction);
        
        const intersects = raycaster.intersectObjects(targets);
        
        if (intersects.length > 0) {
            var pt = intersects[0].point;
            pointer.position.set(pt.x, pt.y, pt.z);
            
            // This changes the pointer color between red 
            // or green depending on its distance from the camera.
            if (intersects[0].distance > 8) {
                pointer.material.color.set(0xFF0000)
            } else {
                pointer.material.color.set(0x00FF00)
            }
        }

        // Ends the game if the player reaches the top
        if (camera.position.y > 495) {
            stage = 'ending';
            document.exitPointerLock();

            openMenu(
                `
                <img class="trophy" src="./assets/trophy.png" alt="trophy">
                <br><br>
                Congratulations, you've beat the game! :)
                `
            )

            closeMenuButton.remove()
        }
    }


    renderer.render(scene, camera);
}
animate();