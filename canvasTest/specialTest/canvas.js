window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();



//全局变量
var ww = window.innerWidth,
    wh = window.innerHeight,
    canvas = document.getElementsByTagName("canvas")[0],ctx
    ctx = canvas.getContext("2d"),
    canvasWidth = ww,
    canvasHeight = wh,
    particles = [],
    quantity = 6900,    //总粒子数量
    count = 0,
    x = ww / 2,
    y = wh / 2,
    range = 140,
    mousedown = false;
    birthRate = 3;
    digits = 0;
    moveSpeed = 1;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

//离屏canvas
var myEntity = {
    width:ww,
    height:wh,
    offscreenCanvas: {},
    render:function (context) {
        var imageData = this.offscreenContext.getImageData(0,0, this.width, this.height);
        context.putImageData(imageData,0,0);
    }
};
myEntity.offscreenCanvas = document.createElement("canvas");
myEntity.offscreenCanvas.width = canvasWidth;
myEntity.offscreenCanvas.height = canvasHeight;
myEntity.offscreenContext = myEntity.offscreenCanvas.getContext("2d");
var offScrCtx = myEntity.offscreenContext;


//文字转粒子数据
function Shape(x ,y ,text) {
    this.x = x;
    this.y = y;
    this.size = 250;
    this.text = text;
    this.position = [];
    this.accuracy = 7;
}

Shape.prototype.getImage = function (){
    offScrCtx.textAlign = "center";
    offScrCtx.font = this.size + "px arial";
    offScrCtx.fillText(this.text, this.x, this.y);

    var imageData = offScrCtx.getImageData(0,0, canvas.width, canvas.height);
    var buffer32 = new Uint32Array(imageData.data.buffer);
    for (var i = 0;i < canvas.width; i += this.accuracy){
        for (var j = 0;j < canvas.height; j += this.accuracy){
            if (buffer32[j * canvas.width + i]){
                this.position.push({posX:i,posY:j});
            }
        }
    }
    offScrCtx.clearRect(0,0,canvas.width,canvas.height);
};
var shape = new Shape(ww/2,wh/2,"Hello,world!");
shape.getImage();



//判断是否在两者之间
function between(x, min, max) {
    return x >= min && x <= max;
}


function draw() {
    offScrCtx.clearRect(0,0,canvas.width,canvas.height);

    digits = 0;
    if (count >= quantity){
        count = quantity;
    }

    //每一帧生成粒子
    if (count < quantity) {
        for (let i = 0; i < birthRate; i++) {
            let color = {r:255, g:0, b:randomInt(0, 255)};
            if (Math.random() < .5) {
                color = {r:randomInt(0, 255), g:0, b:255};;
            }

            var particle = {
                position: {         //位置
                    x: parseInt(Math.random() * ww),
                    y: parseInt(Math.random() * wh)
                },
                destination: {      //目标
                    x: parseInt(Math.random() * ww),
                    y: parseInt(Math.random() * wh)
                },
                size: randomInt(1, 2),     //大小
                drawColor: color,//显示颜色
                oriColor: color,//原始颜色
                drawColorFix(){
                    if(this.drawColor.r > 255){
                        this.drawColor.r = 255;
                    }
                    else if(this.drawColor.r < this.oriColor.r){
                        this.drawColor.r = this.oriColor.r;
                    }

                    if(this.drawColor.g > 255){
                        this.drawColor.g = 255;
                    }
                    else if(this.drawColor.g < this.oriColor.g){
                        this.drawColor.g = this.oriColor.g;
                    }

                    if(this.drawColor.b > 255){
                        this.drawColor.b = 255;
                    }
                    else if(this.drawColor.b < this.oriColor.b){
                        this.drawColor.b = this.oriColor.b;
                    }
                },
                isOutOfWords: true,     //是否在字外面

                move(){
                    this.position.x += (this.destination.x - this.position.x) * 0.0135 * moveSpeed;
                    this.position.y += (this.destination.y - this.position.y) * 0.0135 * moveSpeed;
                },

                draw(){
                    offScrCtx.fillStyle = colorRgb(this.drawColor.r,this.drawColor.g,this.drawColor.b);
                    offScrCtx.fillRect(this.position.x-this.size,this.position.y-this.size,2*this.size,2*this.size);
                },
                shiningData : { r:0, g:0,b:0,
                    isShining:false,
                    isLightening: false,
                    shiningTime: 30},
                toShining() {
                    this.shiningData = {    r:(255 - this.oriColor.r)/this.shiningData.shiningTime,
                        g:(255 - this.oriColor.g)/this.shiningData.shiningTime,
                        b:(255 - this.oriColor.b)/this.shiningData.shiningTime,
                        isShining:true,
                        isLightening:true,
                        shiningTime: 30};
                    this.drawColor = {r:this.drawColor.r + this.shiningData.r, g:this.drawColor.g + this.shiningData.g,b :this.drawColor.b + this.shiningData.b};
                }
            };

            particles.push(particle);
        }
    }
    //每一帧计数
    count += birthRate;

    //每一帧粒子行为
    for (var i = 0; i < particles.length; i++) {
        let particle = particles[i];

        //随机开始闪烁
        if (Math.random() < .005) {
            if (!particle.shiningData.isShining){
                particle.toShining();
            }
        }
        //闪烁过程
        if (particle.shiningData.isShining){
            particle.drawColorFix();
            if (particle.shiningData.isLightening){
                if (particle.drawColor.r == 255 && particle.drawColor.g == 255 && particle.drawColor.b == 255){
                    particle.shiningData.isLightening = false;
                }
                else {
                    particle.drawColor = {r:particle.drawColor.r + particle.shiningData.r, g:particle.drawColor.g + particle.shiningData.g, b:particle.drawColor.b + particle.shiningData.b};
                }
            }
            else if(particle.drawColor.r == particle.oriColor.r && particle.drawColor.g == particle.oriColor.g && particle.drawColor.b == particle.oriColor.b) {
                particle.shiningData.isShining = false;
            }
            else {
                particle.drawColor = {r:particle.drawColor.r - particle.shiningData.r,g:particle.drawColor.g - particle.shiningData.g,b:particle.drawColor.b - particle.shiningData.b}
            }
        }

        //已经就位的粒子
        if (!particle.isOutOfWords){
            digits++;
            particle.move();
            particle.draw();
            continue;
        }

        //如果没有就位的粒子在鼠标范围内
        if (isInCircle(particle.position,{x:x,y:y},range)) {
            let rangeA = Math.abs(1.4/(particle.position.x - x)*(particle.position.x - x));
            let rangeB = Math.abs(1.4/(particle.position.y - y)*(particle.position.y - y));
            let range = (rangeA + rangeB)/2;
            particle.destination.x = x + range *(particle.position.x - x) + (particle.position.x - x);
            particle.destination.y = y + range *(particle.position.y - y) + (particle.position.y - y);

            for (let i = 0; i < shape.position.length; i++) {
                if (isInCircle(particle.destination,{x:shape.position[i].posX,y:shape.position[i].posY},3)) {
                    particle.isOutOfWords = false;
                    break;
                }
            }
        }


        //所有粒子随机时间获得新目的地
        if (Math.random() < .002) {
            particle.destination = {
                x: parseInt(Math.random() * ww),
                y: parseInt(Math.random() * wh)
            }
            for (let i = 0; i < shape.position.length; i++) {
                if (isInCircle(particle.destination,{x:shape.position[i].posX,y:shape.position[i].posY},3)) {
                    particle.isOutOfWords = false;
                }
            }
        }


        //绘制粒子
        particle.move();
        particle.draw();
    }

    //绘制鼠标范围
    offScrCtx.beginPath();
    offScrCtx.fillStyle = "rgba(255,255,255,.1)";
    offScrCtx.lineWidth = 10;
    offScrCtx.arc(x, y, range, 0, Math.PI * 2, true);
    offScrCtx.fill();
    offScrCtx.closePath();

    // offScrCtx.fillText(shape.text,ww/2,wh/2);
    offScrCtx.fillStyle = "yellow";
    offScrCtx.font = "12px arial"
    offScrCtx.fillText("当前的粒子数量:"+ count + "  粒子就位率:" + (digits/quantity*100).toFixed(2) + "%",140,20);


    if(digits/quantity*100 > 70){
        moveSpeed -= (moveSpeed - 0.3)/25;
    }

    myEntity.render(ctx);

    requestAnimFrame(draw);
}

document.body.addEventListener("mousemove", function(e) {
    x = e.clientX;
    y = e.clientY;
});
document.body.addEventListener("touchmove", function(e) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
});

document.body.addEventListener("mousewheel", function(e) {
    if (e.wheelDelta > 0) {
        range = Math.min(500, range += 30);
    } else {
        range = Math.max(0, range -= 30);
    }
});
//兼容火狐滚轮事件
document.addEventListener('DOMMouseScroll',function(e) {
    if (e.detail > 0) {
        range = Math.max(0, range -= 30);
    } else {
        range = Math.min(500, range += 30);
    }
});




window.onresize = function() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    canvas.width = ww;
    canvas.height = wh;
}

//定义rgb颜色
function colorRgb(r,g,b) {
    return "rgb(" + r + "," + g + "," + b + ")";
}
//定义argb颜色
function colorArgb(a,r,g,b) {
    return "argb("+ a + "," + r + "," + g + "," + b + ")";
}
//生成随机整数函数
function randomInt(from, to){
    return parseInt(Math.random() * (to - from + 1) + from);
}
//生成随机浮点数函数
function randomFloat(from, to){
    return Math.random() * (to - from + 1) + from;
}

//勾股定理  输入直角边求斜边
function  dist(a,b) {
    return Math.sqrt(a*a + b*b);
}

//判断是否在两者之间
function between(x, min, max) {
    return x >= min && x <= max;
}

function isInCircle(position,center,radius) {
    if (dist(Math.abs(position.x - center.x),Math.abs(position.y - center.y)) <= radius){
        return true;
    }
    else {
        return false;
    }
}

draw();