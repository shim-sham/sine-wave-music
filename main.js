const input=document.getElementById("input")
var canvas = document.getElementById("canvas")
var ctx=canvas.getContext("2d")

const audioCtx = new AudioContext();
const gainNode=audioCtx.createGain()
const oscillator = audioCtx.createOscillator()
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine"
oscillator.start();
var reset = false
var amplitude = 40;
var counter = 0;
var interval = null
var width = ctx.canvas.width
var height = ctx.canvas.height

var timePerNote = 0;
var length=0;


noteNames = new Map();
noteNames.set("c",261.63);
noteNames.set("c#",277.18);
noteNames.set("d",293.66);
noteNames.set("d#",311.13);
noteNames.set("e",329.63);
noteNames.set("f",349.23);
noteNames.set("f#",369.99);
noteNames.set("g",392.00);
noteNames.set("g#",415.30);
noteNames.set("a",440.00);
noteNames.set("a#",466.16);
noteNames.set("b",493.88);


function line(){
    y=height/2 + (amplitude * Math.sin(2*Math.PI * freq * x * 0.5 * length))
    ctx.lineTo(x,y);
    ctx.stroke()
    x = x+1;
    counter++;
    if (counter>timePerNote/20){
        clearInterval(interval)
    }
}
gainNode.gain.value=0;
function frequency(pitch){
    freq=pitch/10000
    gainNode.gain.setValueAtTime(50, audioCtx.currentTime);
    console.log(pitch)
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + timePerNote/1000 -0.1);
    
}
function handle(){
    reset=true
    var usernotes = String(input.value);
    var noteslist = [];
    length=usernotes.length
    timePerNote = 6000/length
    audioCtx.resume();
    gainNode.gain.value = 0;
    userInput=String(input.value).toLowerCase()
    for (i = 0; i < usernotes.length; i++) {
        var currentNote = usernotes.charAt(i).toLowerCase()
        if(i < usernotes.length - 1 && usernotes.charAt(i + 1) === '#') {
            var sharpNote = currentNote + '#';
            console.log(sharpNote)
            if(noteNames.has(sharpNote)) {
                noteslist.push(noteNames.get(sharpNote));
                i++;
                console.log(sharpNote)
            }
        } else if(noteNames.has(currentNote)) {
            noteslist.push(noteNames.get(currentNote));
            console.log(currentNote)
        }
        console.log(noteslist)
    }
   let j=0
   repeat = setInterval(()=>{
    if (j<noteslist.length){
        frequency(parseInt(noteslist[j]));
        console.log(parseInt(noteslist[j]))
        drawWave()
        j++
    }else{
        clearInterval(repeat)
    }
   },timePerNote)

}
function drawWave() {
    clearInterval(interval);
    if (reset){
        ctx.clearRect(0, 0, width, height);
        x = 0;
        y = height/2;
        ctx.moveTo(x, y);
        ctx.beginPath()
    }
    counter = 0;
    interval = setInterval(line,20)
    reset=false
}
document.addEventListener('click', () => {
  if (!audioCtx) {
    initAudio();
  }
});