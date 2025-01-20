
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

renderer.setClearColor( 0xffffff, 0);

const text=document.querySelector(".text")
const TIME_LIMIT=40;

let gameStat="loading";
let isLookingBackward =true
function createCube(size, posX, rotY = 0, color =0xff4500 ){
    const geometry = new THREE.BoxGeometry( size.w, size.h, size.d )
    const material = new THREE.MeshBasicMaterial( { color } )
    const cube = new THREE.Mesh( geometry, material )
    cube.position.set(posX, 0, 0)
    cube.rotation.y = rotY
    scene.add( cube )
    return cube
}


function delay(ms){
    return new Promise(resolve => setTimeout(resolve,ms));
} 

class Doll{
    constructor(){
        const loader1 = new THREE.GLTFLoader();
        loader1.load("model/scene.gltf", (gltf)=> {
            scene.add(gltf.scene);
            gltf.scene.scale.set(.2,.35,.2);
            gltf.scene.position.set(-9,-0.5,0);
            gltf.scene.rotation.y=-0.5
            this.doll=gltf.scene;
        })

    }
    lookBack(){
       gsap.to(this.doll.rotation, { duration: 2, y:2.5 });
       setTimeout(()=> isLookingBackward=false,1000)
    }
    lookForward(){
        gsap.to(this.doll.rotation, { duration: 2, y:-0.5 });
        setTimeout(()=> isLookingBackward=true,700)
    }

 async start(){
        this.lookBack();
        await delay((Math.random()*1000)+3000);
        this.lookForward();
        await delay((Math.random()*1000)+3000);
        this.start();
    }
}

let doll=new Doll();

async function init(){
    await delay(700);
    text.innerText="Starting 3"
    await delay(700);
    text.innerText="Starting 2"
    await delay(700);
    text.innerText="Starting 1"
    await delay(700);
    text.innerText="GO!!"
    startGame();
}

function startGame(){
    gameStat="started";
    let progressBar = createCube({ w: 30, h: 0.17, d: 0 },0);
    progressBar.position.x=2
    progressBar.position.y=4.5
    gsap.to(progressBar.scale,{x:0,duration:TIME_LIMIT});
    setTimeout(()=>{
        doll.start()
    },2000)
    

}

init()

class Player{
    constructor(){
        const loader = new THREE.GLTFLoader();
        loader.load("player/scene.gltf",gltf=> {
            scene.add(gltf.scene);
            gltf.scene.scale.set(1,2.5,2);
            gltf.scene.position.x=13.5;
            gltf.scene.position.y=-2;
            gltf.scene.position.z=0;
            gltf.scene.rotation.y=-2;
            this.player=gltf.scene;
            this.playerinfo={
                positionX:gltf.scene.position.x=13.5,
                positionZ:gltf.scene.position.z=0,
                rotationY:gltf.scene.rotation.y=-2,
                velocity:0
            }
        })

       
    }
    run(){
      this.playerinfo.velocity=.03
    
    }
    
    stop(){
        gsap.to(this.playerinfo,{velocity:0, duration:.1})
    }

    check(){
         if(this.playerinfo && this.playerinfo.velocity>0 &&!isLookingBackward){
            text.innerText="You Lose!!!"
            gameStat='over'
            setTimeout(()=>{
                location.reload(true);
            },2000)
           
         }
        
         if(this.playerinfo && this.playerinfo.positionX <=-6){
            text.innerText="You win!!";
            gameStat='over'
            setTimeout(()=>{
                location.reload(true);
            },2000)
         }

        


     }
    update(){
        this.check()
        if (this.playerinfo && this.player){
                    this.playerinfo.positionX-=this.playerinfo.velocity;
            this.player.position.x=this.playerinfo.positionX; 
            
        }
         
    }
}

let player=new Player();
camera.position.z = 8;
camera.position.x = 2;
camera.position.y = 0;

function animate() {
    if(gameStat=='over')return
	renderer.render( scene, camera );
    requestAnimationFrame( animate );
    player.update();
}
animate();

window.addEventListener('resize',onWindowResize,false);
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight)
}

window.addEventListener('keydown',(e)=>{
    if(gameStat !="started") return
    if(e.key=="ArrowUp"){
        player.run();
    }
})

window.addEventListener('keyup',(e)=>{
    if(e.key=="ArrowUp"){
        player.stop();
    }
})
