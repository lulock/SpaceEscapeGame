Name: Leila Methnani
Name: Milena Costa

We used up 2 of our 3 grace days for this project

Team work:
Meet and agreed in the idea of using a3 template as scenario for a game and divided the tasks as following:

Milena:
- Modify a3 template to create a basic scene for the game
- Position the elements
- Implement keyboard events
- Implement movements and messages
* References:
http://stemkoski.github.io/Three.js/Keyboard.html
https://github.com/jeromeetienne/threex.keyboardstate

Leila:
I worked on the textures and shading for this little game. I set up the skybox to make the environment in space. I added custom textures for the character piece (the box) that can be selected by pressing keys 1 through 6. I added life functionality to the game so that everytime you collide, you lose life. No more lives left will result in game over. I had fun with using a custom shader to create the lava and water effects. I added the feature of reducing the body of water if colliding with a laser beam or lava guard. I also played with point lighting and added one main light and tried to make it appear from the sun (matching with the shadows on the environment map of the skybox to make it look as accurate as I could). I added two point lights to the guards so they give off an orange light (as if from the lava) that can be seen reflected on the car and box when close enough to them. Because the water and lava shading uses custom shaders, I was not able to properly implement fog feature on those custom objects, but had I had more time I would have looked more into how to properly merge a custom shader with three.js provided shader functinoality (I understand it has something to do with MaterialUtilsMerge function as well as adding SHADER_CHUNKS to input and output values of custom shaders...) All in all I had a lot of fun playing around with three.js

References:

These three.js examples proved very interesting and helpful:
http://stemkoski.github.io/Three.js/index.html

Aerotwist also had some nice tutorials and step by step guides:
http://aerotwist.com/tutorials/getting-started-with-three-js/

Texture mapping basics:
http://solutiondesign.com/webgl-and-three-js-texture-mapping/

Point lights:
http://solutiondesign.com/webgl-and-three-js-lighting/
