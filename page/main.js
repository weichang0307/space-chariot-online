let canvas=document.getElementById('canvas')
ww=1600
wh=800
let ctx=canvas.getContext('2d')
mysize()
let fps=10
let ws=[]
let tt=0

let car=null
let color=''
let barriers=[]
let cars=[]
let information
let inputer
let camera
let mode=0
let stars=[]

//socket

let socket=io('wss://space-chariot-online.onrender.com/')


function socket_init(){
    socket.on('connect',()=>{
        console.log('connect');
    })
    socket.on('disconnect',(reason)=>{
        console.log('disconnect reason: '+reason);
    })
    socket.on('update',(data)=>{
        for(let i in barriers){
            barriers[i].position=data.barriers_position[i]
            barriers[i].angle=data.barriers_angle[i]
        }
        for(let i in cars){
            cars[i].position=data.cars_position[i]
            cars[i].angle=data.cars_angle[i]
            
            cars[i].bullets=data.cars_bullets[i]
            if(data.cars_hpbar[i]>0){
                cars[i].hpbar_transparent=2
                cars[i].hp=data.cars_hpbar[i]
            }
            for(let y in data.cars_power[i]){
                if(data.cars_power[i][y]===0){
                    cars[i].power[y]=0
                }else if(cars[i].power[y]===0){
                    cars[i].power[y]=1
                }
            }
            
        }
    })
    socket.on('init',(data)=>{
        for(let i in data.barriers_points){
            b0=new polygon(0,0,data.barriers_points[i],10)
            barriers.push(b0)
        }
        for(let i in data.cars_color){
            let c0=new Car(0,0)
            c0.color=data.cars_color[i]
            cars.push(c0)
        }
    })
    socket.on('addition-player',(data)=>{
        let c0=new Car(0,0)
        c0.color=data.color
        cars.push(c0)
        if(c0.color===color){
            car=c0
        }
        
    })
    socket.on('delete-car',(data)=>{
        cars.splice(data,1)
    })
    socket.on('killed',()=>{
        car=null
        color=''
        mode=0
    })
}


let keys={}
let control_keys={rf:'KeyY',rb:'KeyG',lf:'KeyE',lb:'KeyD',fire:'KeyV'}
let cooldown=0
function init(){
    socket_init()
    
    for(let i=0;i<1000;i++){
        let x=Math.random()*2000
        let y=Math.random()*2000
        stars.push([x,y,Math.random(),Math.sign(Math.random()-0.5),Math.random()])
    }


    camera=new Camera(800,400,800,400)

    information=new Information(1550,50)


    window.addEventListener('keydown',keydown)
    window.addEventListener('keyup',keyup)
    document.addEventListener('click',onclick)

    if(!is_computer()){
        document.addEventListener('touchstart',touch)
        document.addEventListener('touchmove',touch)
        document.addEventListener('touchend',touch)
        document.addEventListener('touchcancel',touch)
    }

    
}
function touch(e){
    keys={}
    for(let i of e.changedTouches){
        let p=get_p_in_world(i.pageX,i.pageY)
        if(p[0]>800){
            if(p[1]<400){
                keys[control_keys.rf]=true
            }else{
                keys[control_keys.rb]=true

            }
            
        }else{
            if(p[1]<400){
                keys[control_keys.lf]=true
            }else{
                keys[control_keys.lb]=true

            }
        }
    }
}

function update(){

    tt+=1000/fps
    if(cooldown>0){
        cooldown-=1/fps
    }
    let control=[0,0,0,0,0]
    if(keys[control_keys.lb]){
        control[0]=1
    }
    if(keys[control_keys.lf]){
        control[1]=1
    }
    if(keys[control_keys.rf]){
        control[2]=1
    }
    if(keys[control_keys.rb]){
        control[3]=1
    }
    if(keys[control_keys.fire]){
        if(cooldown<=0){
            control[4]=1
            cooldown=1
        }
    }
    
    for(let i of cars){
        i.update()
    }
    
    socket.emit('update',{control:control})
    


}

function draw(){
    
    

    


    if(car){
        camera.position=car.position
    }
    camera.start()
    
    ctx.fillStyle='gray'
    ctx.fillRect(-1000,-1000,4000,4000)
    ctx.fillStyle='black'
    ctx.fillRect(10,10,2000-20,2000-20)
    ctx.fillStyle='white'
    for(let i of stars){
        
        ctx.globalAlpha=i[2]
        ctx.save()
        ctx.translate(i[0],i[1])
        ctx.scale(i[4]*2,i[4]*2)
        ctx.beginPath()
        ctx.moveTo(-1,-1)
        ctx.lineTo(-10,0)
        ctx.lineTo(-1,1)
        ctx.lineTo(0,10)
        ctx.lineTo(1,1)
        ctx.lineTo(10,0)
        ctx.lineTo(1,-1)
        ctx.lineTo(0,-10)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
        ctx.globalAlpha=1

        i[2]+=Math.random()*0.1*i[3]
        if(i[2]>1){
            i[2]=1
            i[3]=-1
        }
        if(i[2]<0){
            i[2]=0
            i[3]=1
        }
        

    }
    

    for(let i of barriers){
        world.draw_helper(i,'rgb(200,100,50)')
    }
    for(let i of cars){
        for(let y in i.power){
            if(i.power[y]>0){
                i.power[y]=1+i.power[y]%5
            }
        }
        i.draw()
    }
    camera.end()

    if(mode===0){
        ctx.globalAlpha=0.5
        ctx.fillStyle='black'
        ctx.fillRect(0,0,ww,wh)
        ctx.globalAlpha=1

        ctx.font='100px serif'
        ctx.fillStyle='white'
        ctx.fillText('CLICK TO START',700,550)
        

    }

    information.draw()

    requestAnimationFrame(draw)
}

function keydown(e){
    keys[e.code]=true
    if(e.code==='Space'){
        for(let i of cars){
            i.hpbar_transparent=2
        }
    }

}
function keyup(e){
    keys[e.code]=false
}
function onclick(e){
    let cp=get_p_in_world(e.pageX,e.pageY)
    information.onclick(cp)
    if(mode===0){
        let r=Math.random()*225
        let g=Math.random()*225
        let b=Math.random()*225
        socket.emit('player-join',{color:'rgb('+r+','+g+','+b+')'})
        color='rgb('+r+','+g+','+b+')'
        mode=1
    }
}

function is_computer(){
	let iscom=true
	let phone_char= ['Android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone']
	for(let i of phone_char){
		if(navigator.userAgent.match(i)){
			iscom=false
			break
		}
	}
	return iscom
}

function mysize(){
	if(window.innerHeight/window.innerWidth>=wh/ww){
		canvas.style.width=window.innerWidth+'px'
		canvas.style.height=wh*window.innerWidth/ww+'px'
		canvas.width=window.innerWidth
		canvas.height=wh*window.innerWidth/ww
		canvas.position='absolute'
		canvas.left=window.innerWidth-canvas.width/2
		canvas.top=0
		canvas.style.position='absolute'
		canvas.style.left=0+'px'
		canvas.style.top=0+'px'
	}else{
		canvas.style.width=ww*window.innerHeight/wh+'px'
		canvas.style.height=window.innerHeight+'px'
		canvas.width=ww*window.innerHeight/wh
		canvas.height=window.innerHeight
		canvas.style.position='absolute'
		canvas.style.left=(window.innerWidth-canvas.width)/2+'px'
		canvas.style.top=0+'px'
		
	}
	ctx.restore()

	if(window.innerHeight/window.innerWidth>=wh/ww){
		ctx.scale(window.innerWidth/ww,window.innerWidth/ww)
	}else{
		ctx.scale(window.innerHeight/wh,window.innerHeight/wh)
	}
	
	
}


function get_p_in_world(x,y){
	let fx=(x-parseFloat(canvas.style.left))*ww/canvas.width
	let fy=(y-parseFloat(canvas.style.top))*ww/canvas.width
	return [fx,fy]
}

init()
setInterval(update,1000/fps)
draw()


































