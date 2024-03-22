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
var menu = 'main';


window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


sun = new THREE.DirectionalLight( new THREE.Color(`rgb(255,255,255)`) );
sun.position.set( 400, 400, 400 );
soft = new THREE.DirectionalLight( new THREE.Color(`rgb(240,240,240)`) );
soft.position.set( -400, 400, -400 );
neath = new THREE.DirectionalLight( new THREE.Color(`rgb(230,230,230)`) );
neath.position.set( 0, -400, 0 );
scene.add(sun);
scene.add(soft);
scene.add(neath);


const planeGeometry = new THREE.PlaneGeometry(100, 100); // Adjust the size as needed

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(`https://raw.githubusercontent.com/thecreatorgrey/space-climb-reborn/main/assets/tile.png`);
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
texture.needsUpdate = true;
const planeMaterial = new THREE.MeshLambertMaterial({map: texture});

planeMaterial.map.repeat.set(100, 100); // Repeat the texture twice in both directions
planeMaterial.map.wrapS = THREE.RepeatWrapping;
planeMaterial.map.wrapT = THREE.RepeatWrapping;


const pointerMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00, transparent: true, opacity: .5});
const pointerGeom = new THREE.SphereGeometry();
const pointer = new THREE.Mesh(pointerGeom, pointerMaterial);
scene.add(pointer);


const groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
groundPlane.rotation.x = -Math.PI / 2;
scene.add(groundPlane);


function randNum(min, max) {
    return Math.random() * (max - min) + min
}


function showMenuElements() {
    document.getElementById('banner').style.display = 'inline';
    document.getElementById('playbtn').style.display = 'inline';
    document.getElementById('credsbtn').style.display = 'inline';
    document.getElementById('tutbtn').style.display = 'inline';
}

function hideMenuElements() {
    document.getElementById('banner').style.display = 'none';
    document.getElementById('playbtn').style.display = 'none';
    document.getElementById('credsbtn').style.display = 'none';
    document.getElementById('tutbtn').style.display = 'none';
}

function openCredsMenu() {
    hideMenuElements();
    document.getElementById('creditsMenu').style.display = 'inline';
}

function closeCredsMenu() {
    showMenuElements();
    document.getElementById('creditsMenu').style.display = 'none';
}

function openTutorialMenu() {
    hideMenuElements();
    document.getElementById('tutorialMenu').style.display = 'inline';
}

function closeTutorialMenu() {
    showMenuElements();
    document.getElementById('tutorialMenu').style.display = 'none';
}





function Block() {
    const geometry = new THREE.BoxGeometry();
    const cube = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 0x000000}));

    cube.position.set(randNum(-50, 50), randNum(0, 500), randNum(-50, 50));
    cube.rotation.set(randNum(0, 360), randNum(0, 360), randNum(0, 360));
    cube.scale.set(randNum(1, 5), randNum(1, 5), randNum(1, 5));
    cube.material.color.set(new THREE.Color(`rgb(${Math.round(randNum(0, 255))},${Math.round(randNum(0, 255))},${Math.round(randNum(0, 255))})`));

    scene.add(cube);
}

for (let step = 0; step < 5000; step++) {
    Block()
}

//titleMusic = new Audio("./assets/kick_shock.mp3");
//titleMusic.play()

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
    menu = 'game';

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


var dt;
function animate() {
    dt = clock.getDelta();
    requestAnimationFrame(animate);

    if (menu === 'main') {
        camera.rotation.y += .002
    } else if (menu === 'game'){
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
    
            if (intersects[0].distance > 8) {
                pointer.material.color.set(0xFF0000)
            } else {
                pointer.material.color.set(0x00FF00)
            }
        }

        if (camera.position.y > 495) {
            menu = 'ending';
            document.exitPointerLock();
            document.getElementById("winmenu").style.display = "inline";
        }
    }


    renderer.render(scene, camera);
}
animate();