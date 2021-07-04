var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
function draw() {
    ctx.rotate(Math.PI/2);
    ctx.fillText("12341241",0,-80);   // 使用默认设置绘制一个矩形
}
draw();


function randomInt(from, to){
    return parseInt(Math.random() * (to - from + 1) + from);
}