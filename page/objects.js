

class Car extends polygon{
    constructor(x,y){
        super(x,y,[[0,0],[70,0],[75,25],[70,50],[0,50],[-5,25]],10,'defult',0.3,0.7)
        this.add_force('rf',[30,0],[0,0])
        this.add_force('rb',[30,0],[0,0])
        this.add_force('lf',[-30,0],[0,0])
        this.add_force('lb',[-30,0],[0,0])
        this.power={rf:0,rb:0,lf:0,lb:0}
        this.bullets=[]
        this.control_keys={rf:'KeyY',rb:'KeyG',lf:'KeyE',lb:'KeyD',fire:'KeyV'}
        this.cooldown=0
        this.hp=5
        this.hpbar_transparent=2
        this.color='red'
        this.collision=(e)=>{
            if(e.object.type==='ball'){
                this.hp-=1
                this.hpbar_transparent=2
            }
        }

    }
    fire(){
        if(this.cooldown<=0){
           this.cooldown=1
            let p=myVector.add(this.position,myVector.rotate([0,-35],this.angle))
            let bb=new Bullet(p[0],p[1],this)
            bb.velocity=myVector.add(this.velocity,myVector.rotate([0,-3000],this.angle))
            this.velocity=myVector.minus(this.velocity,myVector.rotate([0,-300],this.angle))
            this.world.add(bb)
            this.bullets.push(bb) 
        }
        
    }
    keydown(e){
        if(e.code===this.control_keys.fire){
            this.fire()
        }
        if(e.code==='Space'){
            this.hpbar_transparent=2
        }
    }
    keyup(e){
        for(let i in this.control_keys){
            if(e.code===this.control_keys[i]&&i!=='fire'){
                this.get_force(i).force=[0,0]
                this.power[i]=0
                break
            }
            
        }

    }
    update(){
        this.cooldown-=1/50
        if(this.hpbar_transparent>0&&this.hp>0){
            this.hpbar_transparent-=0.1
            if(this.hpbar_transparent<0){
                this.hpbar_transparent=0
            }
        }

    }
    draw(ctx_=ctx){
        let color=this.color
        //draw bullets
        for(let i of this.bullets){
            this.draw_bullet(i)
        }

        //draw car
        ctx_.save()
        ctx_.translate(this.position[0],this.position[1])
        ctx_.rotate(this.angle)
            //body
            ctx_.fillStyle=color
            ctx_.fillRect(-20,-25,40,50)
            //left engine
            ctx_.beginPath()
            ctx_.moveTo(-25,25)
            ctx_.lineTo(-20,0)
            ctx_.lineTo(-25,-25)
            ctx_.lineTo(-35,-25)
            ctx_.lineTo(-40,0)
            ctx_.lineTo(-35,25)
            ctx_.closePath()
            ctx_.fill()
            //right engine
            ctx_.beginPath()
            ctx_.moveTo(25,25)
            ctx_.lineTo(20,0)
            ctx_.lineTo(25,-25)
            ctx_.lineTo(35,-25)
            ctx_.lineTo(40,0)
            ctx_.lineTo(35,25)
            ctx_.closePath()
            ctx_.fill()
            //canon
            ctx_.beginPath()
            ctx_.arc(0,5,15,0,Math.PI*2)
            ctx_.closePath()
            ctx_.fillStyle='rgb(100,100,100)'
            ctx_.fill()
            ctx_.fillStyle='rgb(100,100,100)'
            ctx_.fillRect(5-10,0-40,10,40)
            //power
            let grd=ctx_.createLinearGradient(-5,0,5,0)
            grd.addColorStop(0,'blue')
            grd.addColorStop(0.5,'white')
            grd.addColorStop(1,'blue')
            ctx_.fillStyle=grd
            for(let i in this.power){
                if(this.power[i]!==0){
                    let length=40*this.power[i]/5
                    ctx_.save()

                    let x_
                    let y_
                    let isupsidedown=false
                    if(i==='lf'||i==='lb'){
                        x_=-30
                        if(i=='lf'){
                            y_=-25
                        }else{
                            y_=25
                            isupsidedown=true
                        }
                    }else{
                        x_=30
                        if(i==='rf'){
                            y_=-25
                        }else{
                            y_=25
                            isupsidedown=true
                        }
                    }
                    
                    ctx_.translate(x_,y_)
                    if(isupsidedown){
                        ctx_.rotate(Math.PI)
                    }
                    ctx_.beginPath()
                    ctx_.moveTo(-5,0)
                    ctx_.lineTo(5,0)
                    ctx_.lineTo(0,-length)
                    ctx_.closePath()
                    ctx_.fill()
                    ctx_.restore()
                    this.power[i]%=5
                }
                
            }

            //draw hp bar
            ctx_.globalAlpha=this.hpbar_transparent
            ctx_.rotate(-this.angle)
            ctx_.fillStyle='rgb(0,225,0)'
            ctx_.fillRect(-40,-60,80*this.hp/5,10)
            ctx_.strokeStyle='white'
            ctx_.lineWidth =3
            ctx_.strokeRect(-40,-60,80,10)
            ctx_.globalAlpha=1

            







        ctx_.restore()
        
    }
    draw_bullet(bullet,ctx_=ctx){
        let state=bullet[2]
        let position=bullet.slice(0,2)
        ctx_.save()
        ctx_.translate(position[0],position[1])
            if(state===0){
                ctx_.beginPath()
                ctx_.arc(0,0,5,0,Math.PI*2)
                ctx_.closePath()
                ctx_.fillStyle='white'
                ctx_.fill()
            }else{
                ctx_.globalAlpha=(10-state)/10
                ctx_.fillStyle='orange'

                ctx_.beginPath()
                ctx_.arc(0,0,state*10,0,Math.PI*2)
                ctx_.closePath()
                ctx_.fill()
                ctx_.beginPath()
                ctx_.arc(0,0,state*6,0,Math.PI*2)
                ctx_.closePath()
                ctx_.fill()

                ctx_.globalAlpha=1
            }
            


        ctx_.restore()
    }
}
    

class Information{
    constructor(x,y){
        this.position=[x,y]
        this.state=0
        this.text='Player1 \n控制引擎:E,D,Y,G  發射子彈:V \nPlayer2 \n控制引擎:7,4,9,6  發射子彈:0 \n \n一共有五滴血 被子彈打到扣一滴 \n按空白鍵可察看雙方血量'
        this.textArray=this.text.split('\n')
    }
    onclick(click_point){
        if(this.state===0){
            if(click_point[0]>1500&&click_point[1]<100){
                this.state=1
            }
        }else if(this.state===1){
            this.state=0
        }
    }
    draw(ctx_=ctx){
        ctx_.globalAlpha=0.5
        if(this.state===0){
            ctx_.beginPath()
            ctx_.arc(this.position[0],this.position[1],25,0,Math.PI*2)
            ctx_.closePath()
            ctx_.strokeStyle='white'
            ctx_.lineWidth=5
            ctx_.stroke()

            ctx_.font='45px serif'
            ctx_.fillStyle='white'
            ctx_.fillText('i',1543,63)
        }else if(this.state===1){
            ctx_.fillStyle='black'
            ctx_.fillRect(0,0,1600,800)
            ctx_.globalAlpha=1
            ctx_.font='45px serif'
            ctx_.fillStyle='white'
            for(let i in this.textArray){
                ctx_.fillText(this.textArray[i],100,100+50*i)
            }
            
        }

        

        ctx_.globalAlpha=1


    }
}


class Camera{
	constructor(mx=0,my=0,x=0,y=0,deg,sx=1,sy=1){
		this.middle=[mx,my]
		this.position=[x,y]
		this.rotation=deg
		this.scale=[sx,sy]
	}
	start(ctx_=ctx){
		ctx_.save()
		ctx_.translate(this.middle[0],this.middle[1])
		ctx_.rotate(this.rotation)
		ctx_.scale(this.scale[0],this.scale[1])
		ctx_.translate(-this.position[0],-this.position[1])
	}
	end(ctx_=ctx){
		ctx_.restore()
	}
	
}