//if you are draging in cubes, both click are accepted
//if you are draging in background, left-click means view, right-click means rotate whole cube

var renderer;
var width;
var height;
var unit = 50;
var cubes = [];
var colors = ['#30a0ff', '#60ff50', '#ff0000', '#ffa000', '#efff50','#ffffff', '#000000'];//blue green red orange yellow white
var canvases;

var camera;
var controller;
var scene;
var light;
var cubes;
var canRotate=true;
var raycaster = new THREE.Raycaster();


window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame;
})();

function begin() {
    initThree();
    initCamera();
    initScene();
    initLight();
    initObject();
    render();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
}

function initThree() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0F0F0, 1.0);
    document.getElementById('canvas-frame').appendChild(renderer.domElement);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.x = 400;
    camera.position.y = 300;
    camera.position.z = 500;
    camera.lookAt({x:0,y:0,z:0});
//    camera.up.y = 1;
     controller = new THREE.OrbitControls(camera, render.domElement);
     controller.enableRotate = false;
     controller.enablePan = false;
}

function initScene() {
    scene = new THREE.Scene();
    drawCubes();
    for (let cube of cubes)
        scene.add(cube)
}

function initLight() {
    light = new THREE.AmbientLight(0xfefefe);
    scene.add(light);
}

function initObject() {
}

function render(){
    renderer.clear();
    renderer.render(scene, camera);
    window.requestAnimFrame(render);
}

function drawCubes() {
//    let canvases = generateCanvases();
    canvases = generateCanvases();
    for (let i = -1; i < 2; ++i)
        for (let j = -1; j < 2; ++j)
            for (let k = -1; k < 2; ++k) {
                let geometry = new THREE.BoxGeometry(unit, unit, unit);
                let material = generateMaterial(canvases, i, j, k);
                let cube = new THREE.Mesh(geometry, material);
                cube.position.x = i * unit;
                cube.position.y = j * unit;
                cube.position.z = k * unit;
                cubes.push(cube);               
			}
}
function generateCanvases(){
    let canvases = [];
    for (let color of colors) {
        let canvas = document.createElement('canvas');
        let len = 64;
        canvas.width = canvas.height = len;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, len, len);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, len, len);
        canvases.push(canvas)
    }
    return canvases;
}
function generateMaterial(canvases, i, j, k) {
    let materials = [];
    let select = [6, 6, 6, 6, 6, 6];
    if (i === 1) select[0] = 0;
    if (i === -1) select[1] = 1;
    if (j === 1) select[2] = 2;
    if (j === -1) select[3] = 3;
    if (k === 1) select[4] = 4;
    if (k === -1) select[5] = 5;
    for (let index of select) {
        let texture = new THREE.Texture(canvases[index]);
        texture.needsUpdate = true;
        materials.push(new THREE.MeshBasicMaterial({ map: texture}));
    }
    return materials;
}
function rotateOnX(objs, rad) {
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    for (let cube of objs) {
        let y = cube.position.y;
        let z = cube.position.z;
        let quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), rad);
        cube.quaternion.premultiply(quaternion);
        cube.position.y = y * cos - z * sin;
        cube.position.z = z * cos + y * sin;
    }
}
function rotateOnY(objs, rad) {
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    for (let cube of objs) {
        let x = cube.position.x;
        let z = cube.position.z;
        let quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rad);
        cube.quaternion.premultiply(quaternion);
        cube.position.z = z * cos - x * sin;
        cube.position.x = x * cos + z * sin;
    }
}
function rotateOnZ(objs, rad) {
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    for (let cube of objs) {
        let x = cube.position.x;
        let y = cube.position.y;
        let quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rad);
        cube.quaternion.premultiply(quaternion);
        cube.position.x = x * cos - y * sin;
        cube.position.y = y * cos + x * sin;
    }
}

function OP(op, rad) {
    let objs = [];
    let axis;
    switch(op) {
        case 'R':
            for (let cube of cubes) {
                if (appro(cube.position.x, unit)) 
                objs.push(cube);
            }
            axis = 'X';
            break;
        case 'L':
            for (let cube of cubes) {
                if (appro(cube.position.x, -unit)) 
                objs.push(cube);
            }
            axis = 'X';
            break;
        case 'U':
            for (let cube of cubes) {
                if (appro(cube.position.y, unit)) 
                objs.push(cube);
            }
            axis = 'Y';
            break;
        case 'D':
            for (let cube of cubes) {
                if (appro(cube.position.y, -unit)) 
                objs.push(cube);
            }
            axis = 'Y';
            break;
        case 'F':
            for (let cube of cubes) {
                if (appro(cube.position.z, unit)) 
                objs.push(cube);
            }
            axis = 'Z';
            break;
        case 'B':
            for (let cube of cubes) {
                if (appro(cube.position.z, -unit)) 
                objs.push(cube);
            }
            axis = 'Z';
            break;
    }
    canRotate = false;
    window.requestAnimFrame(function(timestamp){rotate(objs,axis,rad,timestamp,0);});
}
function rotate(objs, axis, rad, now, start, last){
    let total = 300 * Math.abs(rad);
    if (start === 0) {
        start = now;
        last = now;
    }
    if (now - start >= total) {
        now = start + total;
        canRotate = true;
    }
    switch(axis) {
        case 'X': rotateOnX(objs, (now - last) / total * rad); break;
        case 'Y': rotateOnY(objs, (now - last) / total * rad); break;
        case 'Z': rotateOnZ(objs, (now - last) / total * rad); break;
    }
    if (now - start < total){
         window.requestAnimFrame(function(timestamp){rotate(objs, axis, rad, timestamp,start,now);});
    }
}
function cameraRotate(axis, rad, now, start, last){
    let total = 500;
    if (start === 0) {
        start = now;
        last = now;
    }
    if (now - start > total) {
        now = start + total;
        canRotate = true;
    }
    camera.position.applyAxisAngle(axis, rad * (now - last) / total) ;
    controller.update();
    if (now - start < total){
        requestAnimationFrame(function(timestamp){cameraRotate(axis, rad, timestamp,start,now);});
    }
}

function appro(lhs, rhs) { return Math.abs(lhs - rhs) < 1;}


function getIntersectCube(x, y) {
    let mouse = new THREE.Vector2();
    mouse.x = x;
    mouse.y = y;
    raycaster.setFromCamera(mouse, camera);
    let cubes = raycaster.intersectObjects(scene.children);
    return cubes.length > 0 ? cubes[0] : null;
}
var last = {//use for mouseevent, store the infomation about rotation and mouse .
    total:0,
    x:0,
    y:0,
    rotatingNineCubes:false,
    rotatingAllCubes:false,
    objs: [],
    main: '',
    point: '',//the intersect point in which face? x or y or z
    axis: '',//the rotating axis
    sgn: 1,
    intersectPoint:null,
}

function handleKeyDown(evt) {
    if (canRotate) {
        let sgn = evt.ctrlKey === true ? 1 : -1;
        switch(evt.keyCode) {
            case 82: OP('R', sgn * Math.PI / 2);break;
            case 76: OP('L', sgn * Math.PI / 2);break;
            case 85: OP('U', sgn * Math.PI / 2);break;
            case 68: OP('D', sgn * Math.PI / 2);break;
            case 70: OP('F', sgn * Math.PI / 2);break;
            case 66: OP('B', sgn * Math.PI / 2);break;
        }
    }
}

function handleMouseDown(evt) {
    if (evt.button === 2) {
        controller.enableRotate = false;
        last.x = event.clientX;
        last.y = event.clientY;
        last.rotatingAllCubes = true;
    }
    if (!canRotate)return;
    canRotate = false;
    let cube = getIntersectCube((event.clientX / width) * 2 - 1, -(event.clientY / height) * 2 + 1);
    if (cube !== null) {//point to the cube
        last.intersectPoint = cube.point;
        if (appro(Math.abs(cube.point.x), unit * 1.5))
            last.point = 'X';
        else if (appro(Math.abs(cube.point.y), unit * 1.5))
            last.point = 'Y';
        else if (appro(Math.abs(cube.point.z), unit * 1.5))
            last.point = 'Z';
        last.x = event.clientX;
        last.y = event.clientY;
        last.rotatingNineCubes = true;
        controller.enableRotate = false;
    } 
}
function handleMouseUp(evt) {
    if (controller.enableRotate) {
        let vec1 = new THREE.Vector3(400, 300, 500).normalize();
        let vec2 = camera.position.clone().normalize();
        let rad = Math.acos(vec1.dot(vec2));
        let axis = vec2.cross(vec1).normalize();
        requestAnimationFrame(function(timestamp){cameraRotate(axis, rad, timestamp,0);});
        return;
    }
    controller.enableRotate = true;
    if (last.rotatingNineCubes) {
        last.rotatingNineCubes = false;
        let sgn = last.total > 0 ? 1 : -1;
        let count = sgn * last.total / 100 / Math.PI;
        count = (count - Math.floor(count) > 0.25) ? Math.floor(count) + 1 : Math.floor(count);
        let correct = sgn * count * 100 * Math.PI;
        let objs = [];
        for (let cube of last.objs)
             objs.push(cube);
        let rad = (correct - last.total) / 200;
        let axis = last.axis;
        window.requestAnimFrame(function(timestamp){rotate(objs,axis,rad,timestamp,0);});
        last.total = 0;
        last.objs.splice(0, last.objs.length);
        last.main='';
        last.point='';
        last.axis='';
        last.intersectPoint = null;
    }
    if (last.rotatingAllCubes) {
        last.rotatingAllCubes = false;
        let axis = last.axis;
        let rad = Math.PI / 2 * last.sgn;
        window.requestAnimFrame(function(timestamp){rotate(cubes,axis,rad,timestamp,0);});
        last.axis = '';
    }

}

function handleMouseMove(evt) {
    if (last.rotatingNineCubes) {
        let diff = 0;
        switch (last.main) {
            case 'X': diff = evt.clientX - last.x; last.x = evt.clientX; break;
            case 'Y': diff = evt.clientY - last.y; last.y = evt.clientY; break;
            default:
                let dx = evt.clientX - last.x;
                let dy = evt.clientY - last.y;
                if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return;
                let cube = getIntersectCube((event.clientX / width) * 2 - 1, -(event.clientY / height) * 2 + 1);
                if (cube === null) return;
                let ddx = Math.abs(cube.point.x - last.intersectPoint.x);
                let ddy = Math.abs(cube.point.y - last.intersectPoint.y);
                let ddz = Math.abs(cube.point.z - last.intersectPoint.z);
                diff = dx > dy ? dx : dy;
                last.main = Math.abs(dx) > 2 * Math.abs(dy) ? 'X' : 'Y';
                switch(last.point) {
                     case 'X': last.axis = ddz < ddy ? 'Z' : 'Y'; break;
                     case 'Y': last.axis = ddx < ddz ? 'X' : 'Z'; break;
                     case 'Z': last.axis = ddx < ddy ? 'X' : 'Y'; break;
                 }
                switch (last.axis) {
                    case 'X':
                        let x = Math.round(last.intersectPoint.x / 50) * 50;
                        for (let cube of cubes) {
                            if (appro(cube.position.x, x))
                                last.objs.push(cube);
                        }
                        last.sgn = 1;
                        //last.sgn = appro(last.intersectPoint.z, -1.5 * unit) || appro(last.intersectPoint.y, 1.5 * unit)? -1 : 1
                        break;
                    case 'Y':
                        let y = Math.round(last.intersectPoint.y / 50) * 50;
                        for (let cube of cubes) {
                            if (appro(cube.position.y, y))
                                last.objs.push(cube);
                        }
                        last.sgn = 1;
                        break;
                    case 'Z':
                        let z = Math.round(last.intersectPoint.z / 50) * 50;
                        for (let cube of cubes) {
                            if (appro(cube.position.z, z))
                                last.objs.push(cube);
                        }
                        last.sgn = -1;
                        //last.sgn = appro(last.intersectPoint.y, 1.5 * unit) || appro(last.intersectPoint.x, 1.5 * unit) ? -1 : 1;
                        break;
                }
        }
        diff *= last.sgn;
        last.total += diff;
        switch(last.axis) {
            case 'X': rotateOnX(last.objs, diff / 200);break;
            case 'Y': rotateOnY(last.objs, diff / 200);break;
            case 'Z': rotateOnZ(last.objs, diff / 200);break;
        }
    }
    else if (last.rotatingAllCubes) {
        let dx = evt.clientX - last.x;
        let dy = evt.clientY - last.y;
        if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return;
        if (Math.abs(dx) > Math.abs(dy)) {
            last.axis = 'Y';
            last.sgn = dx > 0 ? 1 : -1;
        } else {
            last.sgn = dy > 0 ? 1 : -1;
            if (evt.clientX < width / 2) {
                last.axis = 'X';
            } else {
                last.axis = 'Z';
                last.sgn = -last.sgn;
            }
        }
    }
}







//use for backend.js
function modeling() {
    let clockwise = 1;
    let anticlockwise = 2;
    let cp = [0, 0, 0, 0, 0, 0, 0, 0];
    let co = [0, 0, 0, 0, 0, 0, 0, 0];
    let ep = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; 
    for (let cube of cubes) {
        let x = Math.round(cube.position.x / unit);
        let y = Math.round(cube.position.y / unit);
        let z = Math.round(cube.position.z / unit);
        let direction = getDirection(cube);
        let orientation;
        let kind = getKind(cube);
        if (Math.abs(x) + Math.abs(y) + Math.abs(z) === 3) {
            if (direction === 'y') orientation = 0;
            else {
                if ((x * y * z === 1 && direction === 'x') || (x * y * z === -1 && direction === 'z'))
                    orientation = clockwise;
                else
                    orientation = anticlockwise;
            }
            let loc = getCornelLoc(x, y, z);
            co[loc] = orientation;
            cp[loc] = kind;
        } else if (Math.abs(x) + Math.abs(y) + Math.abs(z) === 2) {
            if (y === 0)
                orientation = (direction === 'z') ? 0 : 1;
            else
                orientation = (direction === 'y') ? 0 : 1;
            let loc = getEdgeLoc(x, y, z);
            eo[loc] = orientation;
            ep[loc] = kind;
        }
    }
    for (let x of cp) console.info(x);
    for (let x of co) console.info(x);
    for (let x of ep) console.info(x);
    for (let x of eo) console.info(x);
}
function getKind(cube) {
    let colorIndexs = [];
    for (let i = 0; i < 6; ++i)
        for (let j = 0; j < 6; ++j) {
            if (canvases[i] === cube.material[j].map.image) {
                colorIndexs.push(i);
                break;
            }
        }
    if (colorIndexs.length === 2) {
        if (colorIndexs[0] === 0) {
            if (colorIndexs[1] === 4) return 0;
            if (colorIndexs[1] === 2) return 1;
            if (colorIndexs[1] === 5) return 2;
            if (colorIndexs[1] === 3) return 3;
        }
        if (colorIndexs[0] === 1) {
            if (colorIndexs[1] === 4) return 4;
            if (colorIndexs[1] === 2) return 5;
            if (colorIndexs[1] === 5) return 6;
            if (colorIndexs[1] === 3) return 7;
        }
        if (colorIndexs[0] === 2) {
            if (colorIndexs[1] === 4) return 8;
            if (colorIndexs[1] === 5) return 9;
        }
        if (colorIndexs[0] === 3) {
            if (colorIndexs[1] === 5) return 10;
            if (colorIndexs[1] === 4) return 11;
        }
    } else {
        if (colorIndexs[0] === 0 && colorIndexs[1] === 2 && colorIndexs[2] === 4) return 0;
        if (colorIndexs[0] === 0 && colorIndexs[1] === 2 && colorIndexs[2] === 5) return 1;
        if (colorIndexs[0] === 0 && colorIndexs[1] === 3 && colorIndexs[2] === 5) return 2;
        if (colorIndexs[0] === 0 && colorIndexs[1] === 3 && colorIndexs[2] === 4) return 3;
        if (colorIndexs[0] === 1 && colorIndexs[1] === 2 && colorIndexs[2] === 4) return 4;
        if (colorIndexs[0] === 1 && colorIndexs[1] === 2 && colorIndexs[2] === 5) return 5;
        if (colorIndexs[0] === 1 && colorIndexs[1] === 3 && colorIndexs[2] === 5) return 6;
        if (colorIndexs[0] === 1 && colorIndexs[1] === 3 && colorIndexs[2] === 4) return 7;
    }
}
function getDirection(cube) {//blue & green first, red & orange second, white & yellow last. return 'x','y','z'
    let masterMaterialIndex = -1;
    for (let i = 0; i < 6; ++i) {
        if (cube.material[i].map.image === canvases[0] || cube.material[i].map.image === canvases[1])
            masterMaterialIndex = i;
    }
    if　(masterMaterialIndex === -1)
        for (let i = 0; i < 6; ++i) {
            if (cube.material[i].map.image === canvases[2] || cube.material[i].map.image === canvases[3])
                masterMaterialIndex = i;
        }
    for (let i = 0; i < 12; i += 2) {
        if (cube.geometry.faces[i].materialIndex === masterMaterialIndex) {
            let v1 = cube.geometry.vertices[cube.geometry.faces[i].a].clone();
            let v2 = cube.geometry.vertices[cube.geometry.faces[i].b].clone();
            let v3 = cube.geometry.vertices[cube.geometry.faces[i].c].clone();
            v1.applyMatrix4(cube.matrixWorld);
            v2.applyMatrix4(cube.matrixWorld);
            v3.applyMatrix4(cube.matrixWorld);
            let x = Math.abs(v1.x + v2.x + v3.x);
            let y = Math.abs(v1.y + v2.y + v3.y);
            let z = Math.abs(v1.z + v2.z + v3.z);
            if (appro(x, 4.5 * unit)) return 'x';
            if (appro(y, 4.5 * unit)) return 'y';
            if (appro(z, 4.5 * unit)) return 'z';
        }
    }
}
function getCornelLoc(x, y, z) {
    if (x === 1 && y === 1 && z === 1) return 0;
    if (x === -1 && y === 1 && z === 1) return 1;
    if (x === -1 && y === 1 && z === -1) return 2;
    if (x === 1 && y === 1 && z === -1) return 3;
    if (x === 1 && y === -1 && z === 1) return 4;
    if (x === -1 && y === -1 && z === 1) return 5;
    if (x === -1 && y === -1 && z === -1) return 6;
    if (x === 1 && y === -1 && z === -1) return 7; 
}
function getEdgeLoc(x, y, z) {
    if (x === 1 && y === 1 && z === 0) return 0;
    if (x === 0 && y === 1 && z === 1) return 1;
    if (x === -1 && y === 1 && z === 0) return 2;
    if (x === 0 && y === 1 && z === -1) return 3;
    if (x === 1 && y === -1 && z === 0) return 4;
    if (x === 0 && y === -1 && z === 1) return 5;
    if (x === -1 && y === -1 && z === 0) return 6;
    if (x === 0 && y === -1 && z === -1) return 7; 
    if (x === 1 && y === 0 && z === 1) return 8;
    if (x === -1 && y === 0 && z === 1) return 9;
    if (x === -1 && y === 0 && z === -1) return 10;
    if (x === 1 && y === 0 && z === -1) return 11; 
}
