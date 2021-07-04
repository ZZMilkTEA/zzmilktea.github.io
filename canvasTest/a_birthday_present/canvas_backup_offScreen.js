window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var ww = window.innerWidth,
    wh = window.innerHeight,
    canvas = document.getElementsByTagName("canvas")[0],
    ctx = canvas.getContext("2d"),
    canvasWidth = ww,
    canvasHeight = wh,
    particles = [],
    quantity = 6000,    //总粒子数量
    count = 0,
    x = ww / 2,
    y = wh / 2,
    range = 50,
    mousedown = false;
birthRate = 3;
digits = 0;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

//离屏canvas
var myEntity = {
    width:ww,
    height:wh,
    offscreenCanvas: new Object(),
    render:function (context) {
        var imageData = this.offscreenContext.getImageData(0,0, this.width, this.height);
        context.putImageData(imageData,0,0);
    }
};
myEntity.offscreenCanvas = document.createElement("canvas");
myEntity.offscreenCanvas.width = canvasWidth;
myEntity.offscreenCanvas.height = canvasHeight;
myEntity.offscreenContext = myEntity.offscreenCanvas.getContext("2d");


//文字转粒子数据
function Shape(x ,y) {
    this.x = x;
    this.y = y;
    this.size = 100;
    this.text = ["祝小寿星叶梓21周岁生日快乐!","Happy Birthday!","Alles gute zum geburtstag!"];
    this.position = [];
    this.accuracy = 7;
}

Shape.prototype.getImage = function (){
    myEntity.offscreenContext.textAlign = "center";
    myEntity.offscreenContext.font = this.size + "px arial";
    myEntity.offscreenContext.fillText(this.text[0], this.x, this.y);
    myEntity.offscreenContext.fillText(this.text[1], this.x, this.y - 130);
    myEntity.offscreenContext.fillText(this.text[2], this.x, this.y + 130);

    var imageData = myEntity.offscreenContext.getImageData(0,0, canvas.width, canvas.height);
    var buffer32 = new Uint32Array(imageData.data.buffer);
    for (var i = 0;i < canvas.width; i += this.accuracy){
        for (var j = 0;j < canvas.height; j += this.accuracy){
            if (buffer32[j * canvas.width + i]){
                this.position.push({posX:i,posY:j});
            }
        }
    }
    myEntity.offscreenContext.clearRect(0,0,canvas.width,canvas.height);
};
var shape = new Shape(ww/2,wh/2);
shape.getImage();



//判断是否在两者之间
function between(x, min, max) {
    return x >= min && x <= max;
}


function draw() {
    //画背景
    myEntity.offscreenContext.fillStyle = "black";
    myEntity.offscreenContext.fillRect(0, 0, ww, wh);
    //每一帧计数
    count += birthRate;
    digits = 0;
    if (count >= quantity){
        count = quantity;
    }

    //生成粒子
    if (count < quantity) {
        for (let i = 0; i < birthRate; i++) {
            var particle = {
                position: {         //位置
                    x: parseInt(Math.random() * ww),
                    y: parseInt(Math.random() * wh)
                },
                destination: {      //目标
                    x: parseInt(Math.random() * ww),
                    y: parseInt(Math.random() * wh)
                },
                size: randomInt(2, 3),     //大小
                color: colorRgb(255, 0, randomInt(0, 255)),//颜色
                isOutOfWords: true,
                shiningData : {r:0,g:0,b:0},
                shining: function () {
                    this.shiningData = {r:this.color}
                }
            };

            particles.push(particle);
        }
    }

    //粒子移动
    for (var i = 0; i < particles.length; i++) {
        let particle = particles[i];
        if (!particle.isOutOfWords){
            digits++;
        }

        particle.position.x += (particle.destination.x - particle.position.x) * 0.0135;
        particle.position.y += (particle.destination.y - particle.position.y) * 0.0135;

        //如果有粒子在鼠标范围内
        if (isInCircle(particle.position,{x:x,y:y},range)) {
            for (let i = 0; i < shape.position.length; i++) {
                if (isInCircle(particle.destination,{x:shape.position[i].posX,y:shape.position[i].posY},3)) {
                    particle.isOutOfWords = false;
                }
            }
            if (particle.isOutOfWords) {
                let rangeA = Math.abs(1.4/(particle.position.x - x)*(particle.position.x - x));
                let rangeB = Math.abs(1.4/(particle.position.y - y)*(particle.position.y - y));
                let range = (rangeA + rangeB)/2;
                particle.destination.x = x + range *(particle.position.x - x) + (particle.position.x - x);
                particle.destination.y = y + range *(particle.position.y - y) + (particle.position.y - y);
            }
        }


        //所有粒子随机时间获得新目的地
        if (Math.random() < .002) {
            if(particle.isOutOfWords) {
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
        }
        if (Math.random() < .002) {
            particle.color
        }


        //绘制粒子
        myEntity.offscreenContext.beginPath();
        myEntity.offscreenContext.fillStyle = particle.color;
        myEntity.offscreenContext.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2, true);
        myEntity.offscreenContext.fill();
        myEntity.offscreenContext.closePath();
    }

    //绘制鼠标范围
    myEntity.offscreenContext.beginPath();
    myEntity.offscreenContext.fillStyle = "rgba(255,255,255,.1)";
    myEntity.offscreenContext.lineWidth = 10;
    myEntity.offscreenContext.arc(x, y, range, 0, Math.PI * 2, true);
    myEntity.offscreenContext.fill();
    myEntity.offscreenContext.closePath();

    // myEntity.offscreenContext.fillText(shape.text,ww/2,wh/2);
    myEntity.offscreenContext.fillStyle = "yellow";
    myEntity.offscreenContext.font = "12px arial"
    myEntity.offscreenContext.fillText("当前的粒子数量:"+ count + "  粒子就位率:" + (digits/quantity*100).toFixed(2) + "%",80,20);
    myEntity.render(ctx);
    requestAnimFrame(draw);
}

document.body.addEventListener("mousemove", function(e) {
    x = e.clientX;
    y = e.clientY;
});

document.body.addEventListener("mousewheel", function(e) {
    if (e.wheelDelta > 0) {
        range = Math.min(500, range += 30);
    } else {
        range = Math.max(0, range -= 30);
    }
});

draw();

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

function isInCircle(position,center,radius) {
    if (dist(Math.abs(position.x - center.x),Math.abs(position.y - center.y)) <= radius){
        return true;
    }
    else {
        return false
    }
}