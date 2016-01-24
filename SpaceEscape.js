
var scene = new THREE.Scene();
var updateFcts  = [];


///////////////////////////////////get shader////////////////////////////////////
getShader = function( shaderStr ) {
    return shaderStr.replace( /#include\s+(\S+)/gi, function( match, p1 ){
                             var chunk = THREE.ShaderChunk[ p1 ];
                             return chunk ? chunk : "";
                             });
};
/////////////////////////////////////////////////////////////////////////////////

//SETUP RENDERES
var renderer  = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
renderer.shadowMapEnabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0xd3d3e3 );
document.body.appendChild( renderer.domElement );

//SETUP CAMERA
var aspect = window.innerWidth/window.innerHeight;
camera = new THREE.PerspectiveCamera( 30, aspect, 0.1, 10000);   // view angle, aspect ratio, near, far
camera.position.set(20,20,-36);
camera.lookAt(scene.position);
scene.add(camera);

////////////////////////////SELECT YOUR ENVIRONMENT////////////////////////////////////

///////////////////space//////////////////////
var spaceurls = [
                 'space/posz.jpg',
                 'space/negz.jpg',
                 'space/posy.jpg',
                 'space/negy.jpg',
                 'space/posx.jpg',
                 'space/negx.jpg'
                 ];

var cubemap = THREE.ImageUtils.loadTextureCube(spaceurls); // load textures
cubemap.format = THREE.RGBFormat;

var shader = THREE.ShaderLib['cube']; // init cube shader from built-in lib
shader.uniforms['tCube'].value = cubemap; // apply textures to shader

// create shader material
var skyBoxMaterial = new THREE.ShaderMaterial( {
                                              fragmentShader: shader.fragmentShader,
                                              vertexShader: shader.vertexShader,
                                              uniforms: shader.uniforms,
                                              depthWrite: false,
                                              side: THREE.BackSide
                                              });

// create skybox mesh
var skybox = new THREE.Mesh(
                            new THREE.CubeGeometry(80, 80, 80),
                            skyBoxMaterial
                            );
scene.add(skybox);
scene.fog = new THREE.Fog(0x080808, 40, 80);

//////////////
// CONTROLS //
//////////////

//  removed pan and zoom from .js file
controls = new THREE.OrbitControls( camera, renderer.domElement );

var unitCubeGeometry = new THREE.BoxGeometry( 1,1,1 );

// SCENE AXES:    (x,y,z) drawn in (red,greeen,blue)
var redMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
var greenMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var blackMaterial  = new THREE.MeshBasicMaterial( { color: 0x000000});
var xAxis = new THREE.Mesh( unitCubeGeometry, redMaterial );
var yAxis = new THREE.Mesh( unitCubeGeometry, greenMaterial );
var zAxis = new THREE.Mesh( unitCubeGeometry, blueMaterial );
var axisWidth = 0.2;
var axisLength = 10;
//scene.add( xAxis );   xAxis.scale.set(axisLength,axisWidth,axisWidth); xAxis.position.set(0.5*axisLength,0,0);
//scene.add( yAxis );   yAxis.scale.set(axisWidth,axisLength,axisWidth); yAxis.position.set(0,0.5*axisLength,0);
//scene.add( zAxis );   zAxis.scale.set(axisWidth,axisWidth,axisLength); zAxis.position.set(0,0,0.5*axisLength);
var originBox = new THREE.Mesh( unitCubeGeometry, blackMaterial );
originBox.visible=false;

scene.add( originBox );
xAxis.parent = yAxis.parent = zAxis.parent = originBox;


//// "shadow cameras" show the light source and direction
//
//// spotlight #1 -- yellow, dark shadow
//var spotlight = new THREE.SpotLight(0xffff00);
//spotlight.position.set(5,10,-13);
//spotlight.shadowCameraVisible = true;
//spotlight.shadowDarkness = 0.95;
//spotlight.intensity = 3;
//// must enable shadow casting ability for the light
//spotlight.castShadow = true;
//scene.add(spotlight);
//
//// create "light-ball" meshes
//var sphereGeometry = new THREE.SphereGeometry( 0.5, 16, 8 );
//var darkMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
//
//var wireframeMaterial = new THREE.MeshBasicMaterial(
//                                                    { color: 0xffff00, wireframe: true, transparent: true } );
//var shape = THREE.SceneUtils.createMultiMaterialObject(
//                                                       sphereGeometry, [ darkMaterial, wireframeMaterial ] );
//shape.position = spotlight.position;
//scene.add( shape );
//shape.parent = spotlight;

//////////////////////////////////lava texture////////////////////////////////
THREE.ImageUtils.crossOrigin = '';
var noiseTexture = THREE.ImageUtils.loadTexture( 'images/noise.jpg' );
noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;

var lavaTexture = THREE.ImageUtils.loadTexture( 'images/lava1.jpg' );
lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;

this.lavaUniforms =
                                                  ({
                                                  resolution: { type: "v2", value: new THREE.Vector2() },
                                                  baseTexture:  { type: "t", value: lavaTexture },
                                                  baseSpeed:    { type: "f", value: 0.05 },
                                                  noiseTexture: { type: "t", value: noiseTexture },
                                                  noiseScale:   { type: "f", value: 0.5337 },
                                                  alpha:        { type: "f", value: 1.0 },
                                                   time:         { type: "f", value: 1.0 }
                                                   });

var lavaMaterial = new THREE.ShaderMaterial(
                                              { uniforms: lavaUniforms,
                                              vertexShader: document.getElementById('vertexShader').textContent,
                                              fragmentShader: document.getElementById('guardfragmentShader').textContent
                                              } );

// LIGHTS:  needed for phong illumination model
// The following will be used by (1) three.js; and (2) your own shaders, passed via uniforms

lightColor = new THREE.Color(1,1,1);
ambientColor = new THREE.Color(0.5,0.5,0.5);
lightPosition = new THREE.Vector3(1,1,1);

/////////////////////////// THREE.JS ILLUMINATION ////////////////////////////

// LIGHT SOURCES
var light = new THREE.DirectionalLight(lightColor.getHex(), 1);
light.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
scene.add(light);

var ambientLight = new THREE.AmbientLight(ambientColor.getHex());
scene.add(ambientLight);



// FLOOR WITH CHECKERBOARD

//var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
var floorTexture = THREE.ImageUtils.loadTexture( 'images/chessboard.png' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set( 2, 2 );
var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var floorGeometry = new THREE.PlaneGeometry(30, 30);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.position.y = -0.1;

floor.rotation.x = Math.PI / 2;

floor.receiveShadow = true;
scene.add(floor);
floor.parent = originBox;

/////////////////////////// MY SHADERS ////////////////////////////

kAmbient = new THREE.Color(0x404040);    // ambient reflectance
kDiffuse = new THREE.Color(0x808080);    // diffuse reflectance
kSpecular = new THREE.Color(0x808080);   // specular reflectance (purposely 4x larger)
k0 = new THREE.Color(0x000000);          // use when we want to assign zero reflectance
shininess = 10.0;                        // Phong shininess (purposely 4x smaller)

//Customize fugitive texture
var textures = [THREE.ImageUtils.loadTexture('images/polishedmarble.jpg'),
                THREE.ImageUtils.loadTexture('images/oldwall.jpg'),
                THREE.ImageUtils.loadTexture('images/metal.jpg'),
                THREE.ImageUtils.loadTexture('images/sweater.jpg'),
                THREE.ImageUtils.loadTexture('images/bark.jpg'),
                THREE.ImageUtils.loadTexture('images/sulley.jpg')
                ]
//choose your texture;
this.textureOption = 0;
var fugitiveTxr = textures[textureOption];


////////////////MINECRAFT OPTION////////////////////////////////////////////////
var mineCraftMaterialArray = [];
mineCraftMaterialArray.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('images/minecraft.jpg') } ) );
mineCraftMaterialArray.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('images/minecraft.jpg')} ) );
mineCraftMaterialArray.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('images/minecraft-top.jpg') } ) );
mineCraftMaterialArray.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('images/minecraft.jpg') } ) );
mineCraftMaterialArray.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('images/minecraft.jpg') } ) );
mineCraftMaterialArray.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('images/minecraft.jpg') } ) );
var MineCraftCubeMaterials = new THREE.MeshFaceMaterial( mineCraftMaterialArray );

////////////////CUSTOM OBSTACLES////////////////////////////////////////////////
var mineCube = new THREE.Mesh( new THREE.BoxGeometry( 1,1,1 ), MineCraftCubeMaterials );
//scene.add( mineCube );
mineCube.scale.set(3,3,3);
mineCube.position.set(5.5,1.5,9.5);
mineCube.parent = originBox;

var earth = new THREE.Mesh(
                           new THREE.SphereGeometry(2, 32, 32),
                           new THREE.MeshPhongMaterial(
                                                       {
                                                       map: THREE.ImageUtils.loadTexture('images/earth.jpg'),
                                                       bumpMap: THREE.ImageUtils.loadTexture('images/earth-bump.jpg'),
                                                       bumpScale: 0.01,
                                                       specularMap: THREE.ImageUtils.loadTexture('images/waterspec.png'),
                                                       specular: new THREE.Color('grey').getHex()
                                                       }));

//scene.add(earth);
earth.position.set(-3,2.5,-5);

////////////
// CUSTOM //
////////////
// clock
this.clock = new THREE.Clock();


//FUGITIVE CUBE - player control

var fugitivePhongMaterial = new THREE.MeshPhongMaterial(
                                                        {   ambient: ambientColor.getHex(), color: lightColor.getHex, specular: 0x080808, shininess: 30, map: fugitiveTxr, shading: THREE.SmoothShading});
var fugitiveCubeGeometry = new THREE.BoxGeometry( 1,1,1 ); //box object

///////////////////////////Water Fugitive//////////////////////////////////
var waterTexture = THREE.ImageUtils.loadTexture( 'images/water.jpg' );
waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;

this.waterUniforms = {
//fogDensity: { type: "f", value: scene.fogDensity },
//fogColor: { type: "v3", value: scene.fogColor},
baseTexture: 	{ type: "t", value: waterTexture },
baseSpeed: 		{ type: "f", value: 1.15 },
noiseTexture: 	{ type: "t", value: noiseTexture },
noiseScale:		{ type: "f", value: 0.2 },
alpha: 			{ type: "f", value: 0.8 },
time: 			{ type: "f", value: 1.0 }};

var waterMaterial = new THREE.ShaderMaterial(
                                              { uniforms: waterUniforms,
                                              vertexShader: document.getElementById('vertexShader').textContent,
                                              fragmentShader: document.getElementById('fragmentShader').textContent,
                                             fog : false
                                              } );
waterMaterial.transparent = true;
fugitiveCube = new THREE.Object3D();

//fugitiveCube = new THREE.Mesh( fugitiveCubeGeometry, waterMaterial ); //mesh box and illumination material
///////////////////////////Water Fugitive//////////////////////////////////
scene.add( fugitiveCube ); //add to scene
fugitiveCube.scale.set(3,6,2); // scale
fugitiveCube.position.set(13,3,-13); //reposition
fugitiveCube.parent = originBox; // make it a child of the rotating checkerboard


this.fugitivePlayer = new THREE.Mesh();
this.waterMode = false;
if(waterMode){
    fugitivePlayer = new THREE.Mesh( fugitiveCubeGeometry, waterMaterial ); //mesh box and illumination material
} else {
    fugitivePlayer = new THREE.Mesh( fugitiveCubeGeometry, fugitivePhongMaterial ); //mesh box and illumination material
}

fugitiveCube.add(fugitivePlayer);



//OBSTACLES - alarms and guards
var alarmWidth = 0.2;
var alarmLength = 10;
//var redMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
//var redMaterial = new THREE.MeshPhongMaterial({   ambient: 0x000f00, color: 0xff0000, specular: 0x008000, shininess: 30, shading: THREE.SmoothShading});
var redMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.3 } );
var greenMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent: true, opacity: 0.5 } );
var blueMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.5 } );

var alarm1 = new THREE.Mesh( unitCubeGeometry, redMaterial );
alarm1.scale.set(axisWidth,axisLength,axisWidth);
alarm1.position.set(9.5,0.5*alarmLength,-9.5);
scene.add( alarm1 );
alarm1.parent = originBox;

var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.BackSide } );
var outlineMesh1 = new THREE.Mesh( unitCubeGeometry, outlineMaterial1 );
outlineMesh1.position = alarm1.position;
outlineMesh1.scale.set(0.5*axisWidth, 1.0,0.5*axisWidth);
alarm1.add( outlineMesh1 );

loadOBJguard( 'obj/male02.obj', 0.04, 13,0,-2,0,0,0);

// LIGHT
guardLight1 = new THREE.PointLight(0xaa2200);
guardLight1.position.set(13,0,-2);
guardLight1.intensity = 0.4;
scene.add(guardLight1);
guardLight1.parent=originBox;

var alarm3 = new THREE.Mesh( unitCubeGeometry, redMaterial );
scene.add( alarm3 );
alarm3.scale.set(axisWidth,axisLength,axisWidth);
alarm3.position.set(-5.4,0.5*alarmLength,-9.6);
alarm3.parent = originBox;

var outlineMesh3 = new THREE.Mesh( unitCubeGeometry, outlineMaterial1 );
outlineMesh3.position = alarm3.position;
outlineMesh3.scale.set(0.5*axisWidth, 1.0,0.5*axisWidth);
alarm3.add( outlineMesh3 );

var alarm4 = new THREE.Mesh( unitCubeGeometry, redMaterial );
scene.add( alarm4 );
alarm4.scale.set(axisWidth,axisLength,axisWidth);
alarm4.position.set(2,0.5*alarmLength,13);
alarm4.parent = originBox;

var outlineMesh4 = new THREE.Mesh( unitCubeGeometry, outlineMaterial1 );
outlineMesh4.position = alarm4.position;
outlineMesh4.scale.set(0.5*axisWidth, 1.0,0.5*axisWidth);
alarm4.add( outlineMesh4 );

var alarm5 = new THREE.Mesh( unitCubeGeometry, redMaterial );
scene.add( alarm5 );
alarm5.scale.set(axisWidth,axisLength,axisWidth);
alarm5.position.set(-5.6,0.5*alarmLength,2);
alarm5.parent = originBox;

var outlineMesh5 = new THREE.Mesh( unitCubeGeometry, outlineMaterial1 );
outlineMesh5.position = alarm5.position;
outlineMesh5.scale.set(0.5*axisWidth, 1.0,0.5*axisWidth);
alarm5.add( outlineMesh5 );

var alarm6 = new THREE.Mesh( unitCubeGeometry, redMaterial );
scene.add( alarm6 );
alarm6.scale.set(axisWidth,axisLength,axisWidth);
alarm6.position.set(2,0.5*alarmLength,-5.4);
alarm6.parent = originBox;

var outlineMesh6 = new THREE.Mesh( unitCubeGeometry, outlineMaterial1 );
outlineMesh6.position = alarm6.position;
outlineMesh6.scale.set(0.5*axisWidth, 1.0,0.5*axisWidth);
alarm6.add( outlineMesh6 );

var alarm7 = new THREE.Mesh( unitCubeGeometry, redMaterial );
scene.add( alarm7 );
alarm7.scale.set(axisWidth,axisLength,axisWidth);
alarm7.position.set(9.4,0.5*alarmLength,2);
alarm7.parent = originBox;

var outlineMesh7 = new THREE.Mesh( unitCubeGeometry, outlineMaterial1 );
outlineMesh7.position = alarm7.position;
outlineMesh7.scale.set(0.5*axisWidth, 1.0,0.5*axisWidth);
alarm7.add( outlineMesh7 );

loadOBJguard( 'obj/male02.obj', 0.04, -13,0,-2,0,0,0);
// LIGHT
guardLight2 = new THREE.PointLight(0xaa2200);
guardLight2.position.set(-13,0,-2);
guardLight2.intensity = 0.5;
scene.add(guardLight2);
guardLight2.parent=originBox;

var blueSphere = new THREE.Mesh(
                                new THREE.SphereGeometry(0.5, 32, 32),
                                blueMaterial);
scene.add(blueSphere);
blueSphere.position.set(9.5,0.4,-6);
blueSphere.parent = originBox;

///////////////////////////Life Bar///////////////////////////////
// image material translucence
var heartGeo = new THREE.PlaneGeometry(1,1,1,1);
var heartTexture = THREE.ImageUtils.loadTexture( 'images/life.png' );

this.health = [];
function buildHealth() {
    for (var j=0; j<health.length; j++){
        scene.remove(health[j]);
    };
    
    for ( var i = 0; i < 4; i ++ ) {
    var heart = new THREE.Mesh( heartGeo, new THREE.MeshLambertMaterial( { map: heartTexture, transparent: true, opacity: 0.75 } ) );
    scene.add(heart);
    heart.material.side = THREE.DoubleSide;
    heart.parent = fugitiveCube;
    heart.scale.set(0.2,0.1,1);
    heart.translateY(0.7);
    heart.translateX(-0.3 + (i)/5);
    health.push(heart);
    };
    if (!blueSphere.parent){
    scene.add(blueSphere);
    blueSphere.parent = originBox;
    }
};

buildHealth();

function loseHealth(){
    scene.remove(health[health.length-1]);
    health.pop();
    
    if (health.length <= 0){
        window.alert("GAME OVER!");
        location.reload ();
    }
}
/////////////////////////////////////////////////////////////////


//CAR
var defaultPhongMaterial = new THREE.MeshPhongMaterial( {
                                                       ambient: 0x004000, color: 0x008000, specular: 0x404040, shininess: 40.0});
loadOBJ( 'obj/minicooper.obj',0.05, -13,0,10,-1.57,0,0);

//KEYBOARD event

//c0l0 = initial position = 13, -13
//use range to restart in case of position = range of obstacles position
//it did not work for exactly position (3.7 scale), probably cause computation
//Method for calculate range of obstacles position:
//for z: range limits will be the integers which the number (number of line * 3.7 - 13) is between
//for x: range limits will be the integers which the number (13 - number of column * 3.7) is between

var keyboard  = new THREEx.KeyboardState(renderer.domElement);
renderer.domElement.setAttribute("tabIndex", "0");
renderer.domElement.focus();
//on keydown

function move(){
    
    //gameover
    if(
       ((fugitiveCube.position.z < -1)&&(fugitiveCube.position.z > -2)&&(fugitiveCube.position.x == 13)) //guard c0l3
       || ((fugitiveCube.position.z < -1)&&(fugitiveCube.position.z > -2)&&(fugitiveCube.position.x < -12.8)) //guard c7l3
       || ((fugitiveCube.position.x > 9.0)&&(fugitiveCube.position.x < 10))&&((fugitiveCube.position.z < -9)&&(fugitiveCube.position.z > -10)) //c1l1
       || ((fugitiveCube.position.x > 9.0)&&(fugitiveCube.position.x < 10))&&((fugitiveCube.position.z < 2)&&(fugitiveCube.position.z > 1)) //c1l4
       || ((fugitiveCube.position.x < -4.0)&&(fugitiveCube.position.x > -6))&&((fugitiveCube.position.z < -9)&&(fugitiveCube.position.z > -10)) //c5l1
       || ((fugitiveCube.position.x < -4.0)&&(fugitiveCube.position.x > -6))&&((fugitiveCube.position.z < 2)&&(fugitiveCube.position.z > 1)) //c5l4
       || ((fugitiveCube.position.z < -5)&&(fugitiveCube.position.z > -6))&&((fugitiveCube.position.x > 1)&&(fugitiveCube.position.x < 2)) //c3l2
       || ((fugitiveCube.position.z > 12))&&((fugitiveCube.position.x > 1)&&(fugitiveCube.position.x < 2)) //c3l7
       ){
        
        if(waterMode){
            if(fugitivePlayer.position.y < -0.3){
                window.alert("YOU'VE EVAPORATED");
                loseHealth();
                //check if STILL in water mode after return
                if(waterMode){
                fugitiveCube.remove(fugitivePlayer);
                fugitivePlayer = new THREE.Mesh( fugitiveCubeGeometry, waterMaterial ); //mesh box and illumination material
                fugitiveCube.position.set(13,3,-13);
                fugitiveCube.add(fugitivePlayer);
                }
            } else {
            fugitivePlayer.scale.y -= .3; // lose water
            fugitivePlayer.position.y -= 0.15; //move down
            }
        }else{
        fugitiveCube.position.set(13,3,-13);
        window.alert("COLLISION!");
        loseHealth();
        }
    }
   //winner
    if((fugitiveCube.position.x < -10.0)&&(fugitiveCube.position.z > 6))
    {
        window.alert("WINNER!");
        location.reload ();
    }
    
}
keyboard.domElement.addEventListener('keydown', function(event){
                                     
                                     if(!waterMode){
                                     if(fugitiveCube.position.x == 9.3 && fugitiveCube.position.y==3.0 && fugitiveCube.position.z==-5.6000000000000005){
                                     
                                     waterMode = true;
                                     fugitiveCube.remove(fugitivePlayer);
                                     fugitivePlayer = new THREE.Mesh( fugitiveCubeGeometry, waterMaterial ); //mesh box and illumination material
                                     fugitiveCube.add(fugitivePlayer);
                                     scene.remove(blueSphere);
                                     
                                     }
                                     }
                                     
                                     console.log(camera.position);
                                     if(!waterMode){
                                     if( keyboard.eventMatches(event, '1') ){
                                     textureOption = 0;

                                     fugitivePlayer.material.map = textures[textureOption];
                                     fugitivePlayer.material.needsUpdate = true;
                                     }
                                     if( keyboard.eventMatches(event, '2') ){
                                     textureOption = 1;
                                     
                                     fugitivePlayer.material.map = textures[textureOption];
                                     fugitivePlayer.material.needsUpdate = true;
                                     }
                                     if( keyboard.eventMatches(event, '3') ){
                                     textureOption = 2;
                                     
                                     fugitivePlayer.material.map = textures[textureOption];
                                     fugitivePlayer.material.needsUpdate = true;
                                     }
                                     if( keyboard.eventMatches(event, '4') ){
                                     textureOption = 3;
                                     
                                     console.log("texture option is " + textureOption);
                                     
                                     fugitivePlayer.material.map = textures[textureOption];
                                     fugitivePlayer.material.needsUpdate = true;
                                     }
                                     if( keyboard.eventMatches(event, '5') ){
                                     textureOption = 4;
                                     
                                     fugitivePlayer.material.map = textures[textureOption];
                                     fugitivePlayer.material.needsUpdate = true;
                                     }
                                     if( keyboard.eventMatches(event, '6') ){
                                     textureOption = 5;
                                     
                                     fugitivePlayer.material.map = textures[textureOption];
                                     fugitivePlayer.material.needsUpdate = true;
                                     }
                                     
                                     }
                                     if( keyboard.eventMatches(event, 'w') ){
                                     
                                     //movement
                                     if ((fugitiveCube.position.z + 3.7 >= -13)&&(fugitiveCube.position.z  + 3.7 <= 13)) {
                                     fugitiveCube.position.z += 3.7;
                                     }
                                     
                                     move();
                                     }
                                     
                                     if( keyboard.eventMatches(event, 's') ){
                                     
                                     //movement
                                     if ((fugitiveCube.position.z - 3.7 >= -13) && (fugitiveCube.position.z  - 3.7 <= 13)){
                                     fugitiveCube.position.z  -= 3.7;
                                     }
                                     move();
                                     }
                                     
                                     if( keyboard.eventMatches(event, 'a') ){
                                     
                                     //movement
                                     if ((fugitiveCube.position.x - 3.7 >= -13) && (fugitiveCube.position.x  - 3.7 <= 13)){
                                     fugitiveCube.position.x  -= 3.7;
                                     }
                                     move();
                                     }
                                     
                                     if( keyboard.eventMatches(event, 'd') ){
                                     
                                     //movement
                                     if ((fugitiveCube.position.x + 3.7 >= -13) && (fugitiveCube.position.x  + 3.7 <= 13)){
                                     fugitiveCube.position.x  += 3.7;
                                     }
                                     move();
                                     }
                                     
                                     if( keyboard.eventMatches(event, 'r') ){
                                     fugitiveCube.position.set(13,3,-13);
                                     this.health ==4;
                                     }
                                     
                                     })


//RENDER scene
updateFcts.push(function(){
                originBox.rotation.y += 0.002;
                controls.update();
                renderer.render( scene, camera );
                })

//LOOP
var lastTimeMsec= null
requestAnimationFrame(function animate(nowMsec){
                      requestAnimationFrame( animate );
                      lastTimeMsec  = lastTimeMsec || nowMsec-1000/60
                      var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
                      lastTimeMsec  = nowMsec
                      updateFcts.forEach(function(updateFn){
                                         updateFn(deltaMsec/1000, nowMsec/1000);
                                         
                                         var delta = clock.getDelta();
                                         lavaUniforms.time.value += delta;
                                         waterUniforms.time.value += delta;
                                         

                                         })
                      })