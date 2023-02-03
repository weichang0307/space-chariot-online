const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use('/',express.static('./page'))

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('player-join',(data)=>{
    let car=new objects.Car(100,100)
    car.velocity=[100,0]
    car.color=data.color
    car.socket=socket
    world_.add(car)
    cars.push(car)
    io.sockets.emit('addition-player',{color:data.color})
  })
  socket.on('update',(data)=>{
    for(let i of cars){
        if(i.socket===socket){
            if(data.control[0]){
                i.get_force('lb').force=myVector.rotate([0,-1000],i.angle)
                i.power.lb=(i.power.lb+1)%5
            }else{
                i.get_force('lb').force=[0,0]
                i.power.lb=0
            }
            if(data.control[1]){
                i.get_force('lf').force=myVector.rotate([0,1000],i.angle)
                i.power.lf=(i.power.lf+1)%5
            }else{
                i.get_force('lf').force=[0,0]
                i.power.lf=0
            }
            if(data.control[2]){
                i.get_force('rf').force=myVector.rotate([0,1000],i.angle)
                i.power.rf=(i.power.rf+1)%5
            }else{
                i.get_force('rf').force=[0,0]
                i.power.rf=0
            }
            if(data.control[3]){
                i.get_force('rb').force=myVector.rotate([0,-1000],i.angle)
                i.power.rb=(i.power.rb+1)%5
            }else{
                i.get_force('rb').force=[0,0]
                i.power.rb=0
            }
            if(data.control[4]){
                i.fire()
            }
        }
    }
  })
  socket.emit('init',prepare_data_init())
  socket.on('disconnecting',()=>{
        for(let i in cars){
            if(cars[i].socket===socket){
                world_.delete(cars[i])
                
                io.sockets.emit('delete-car',i)
                cars.splice(i,1)
            }
        }
    })
});



let myPhysic=require('./my_modules/myPhysic')
let myVector=require('./my_modules/myVector')
let objects=require('./objects')

let fps=50
let ws=[]
let tt=0


let cars=[]
let barriers=[]



let world_=new myPhysic.world(0,0,1)
function init(){

    ws.push(new myPhysic.polygon(1000,2000,[[-2000,-10],[2000,-10],[2000,10],[-2000,10]],Infinity))
    ws.push(new myPhysic.polygon(1000,0,[[-2000,-10],[2000,-10],[2000,10],[-2000,10]],Infinity))
    ws.push(new myPhysic.polygon(2000,1000,[[-10,-2000],[10,-2000],[10,2000],[-10,2000]],Infinity))
    ws.push(new myPhysic.polygon(0,1000,[[-10,-2000],[10,-500],[10,2000],[-10,2000]],Infinity))
    for(let i of ws){
        i.isgravity=false
        world_.add(i)
    }

    for(let i=0;i<10;i++){
        let r=Math.random()*100+50
        let ps=[]
        for(let rad=0;rad<Math.PI*2;rad+=Math.random()*1+1){
            let p0=[r*Math.cos(rad),r*Math.sin(rad)]
            ps.push(p0)
        }
        b0=new myPhysic.polygon(Math.random()*1800+100,Math.random()*1800+100,ps,r**2/100)
        b0.velocity=[Math.random()*40-20,Math.random()*40-20]
        b0.omega[2]=Math.random()-0.5
        b0.mass=b0.area*0.001
        world_.add(b0)
        barriers.push(b0)
    }


    world_.setCoefficient('default','default',1,0.5)

    
}


function update(){

    for(let i in cars){
        if(cars[i].hp<=0){
            world_.delete(cars[i])
            
            io.sockets.emit('delete-car',i)
            cars[i].socket.emit('killed',0)
            cars.splice(i,1)
        }
    }

    io.sockets.emit('update',prepare_data_update())

    tt+=1000/fps

    for(let i of cars){
        i.update({})
    }

    


    world_.update(1/fps)

}

function prepare_data_update(){
    let barriers_position=[]
    let barriers_angle=[]
    for(let i of barriers){
        barriers_position.push(i.position)
        barriers_angle.push(i.angle)
    }
    let cars_position=[]
    let cars_angle=[]
    let cars_power=[]
    let cars_bullets=[]
    let cars_hpbar=[]
    for(let i of cars){
        cars_position.push(i.position)
        cars_angle.push(i.angle)
        cars_power.push(i.power)
        let bullets=[]
        for(let y of i.bullets){
            let bullet=y.position.concat([y.state])
            bullets.push(bullet)
        }
        cars_bullets.push(bullets)
        if(i.hpbar_transparent===2){
            cars_hpbar.push(i.hp)
            
        }else{
            cars_hpbar.push(0)
        }
    }
    return {
        barriers_position:barriers_position,
        barriers_angle:barriers_angle,
        cars_position:cars_position,
        cars_angle:cars_angle,
        cars_power:cars_power,
        cars_bullets:cars_bullets,
        cars_hpbar:cars_hpbar
    }
}

function prepare_data_init(){
    let barriers_points=[]
    for(let i of barriers){
        barriers_points.push(i.points)
    }
    let cars_color=[]
    for(let i of cars){
        cars_color.push(i.color)
    }
    return {
        barriers_points:barriers_points,
        cars_color:cars_color
    }
}





init()
setInterval(update,1000/fps)















































server.listen(3000, () => {
  console.log('listening on *:3000');
});



