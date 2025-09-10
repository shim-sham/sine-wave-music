const input=document.getElementById("input")
var canvas = document.getElementById("canvas")
var ctx=canvas.getContext("2d")
const colourPicker = document.getElementById("colour")
const fill = document.getElementById("fill")
const audioCtx = new AudioContext();
const gainNode=audioCtx.createGain()
const oscillator = audioCtx.createOscillator()
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.start();

const recording_toggle = document.getElementById("recording");

var reset = false

var counter = 0;
var interval = null
var width = ctx.canvas.width
var height = ctx.canvas.height

var timePerNote = 0;
var length=0;

var volSlider = document.getElementById("vol-slider")



noteNames = new Map();
noteNames.set("c",261.63);
noteNames.set("c#",277.18);
noteNames.set("d",293.66);
noteNames.set("d#",311.13);
noteNames.set("e",329.63);
noteNames.set("e#",349.23);
noteNames.set("f",349.23);
noteNames.set("f#",369.99);
noteNames.set("g",392.00);
noteNames.set("g#",415.30);
noteNames.set("a",440.00);
noteNames.set("a#",466.16);
noteNames.set("b",493.88);

var blob, recorder = null;
var chunks = [];
var is_recording = false;


function startRecording(){
    const canvasStream = canvas.captureStream(20); 
    const combinedStream = new MediaStream();
    
    const audioDestination = audioCtx.createMediaStreamDestination();
    canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
    audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
    gainNode.connect(audioDestination);
    recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
    recorder.ondataavailable = e => {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    };
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        URL.revokeObjectURL(url);
    };
    recorder.start();
}
function toggle(){
    if (is_recording){
        is_recording = false;
        recording_toggle.innerHTML = "start recording"
        recorder.stop()
    } else {
        is_recording=true;
        recording_toggle.innerHTML = "stop recording";
        startRecording()
    }
}

function line(){
    if (document.getElementById("sine").checked){
    oscillator.type = "sine"
    }else if (document.getElementById("triangle").checked){
        oscillator.type="triangle"
    }else if (document.getElementById("saw").checked){
        oscillator.type="sawtooth"
    }else if (document.getElementById("square").checked){
        oscillator.type="square"
    }
    y=height/2 + (volSlider.value/100*40 * Math.sin(2*Math.PI * freq * x * 0.5 * length))
    ctx.lineTo(x,y);
    
    ctx.strokeStyle= colourPicker.value
    ctx.stroke()
    if (fill.checked){
        ctx.moveTo(x, height/2);
        ctx.closePath();
        ctx.fill()
    }
    
    

    x = x+1;
    counter++;
    if (counter>timePerNote/20){
        clearInterval(interval)
    }
}
function frequency(pitch){
    freq=pitch/10000
    gainNode.gain.setValueAtTime(volSlider.value, audioCtx.currentTime)
    setting=setInterval(()=> {gainNode.gain.value = volSlider.value}, 1)
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime)
    console.log(pitch)
    setTimeout(()=> {
        clearInterval(setting)
        gainNode.gain.value = 0
    },(timePerNote -10))
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + timePerNote/1000 -0.1);
    
}
function handle(){
    reset=true
    var usernotes = String(input.value);
    var noteslist = [];
    userInput=String(input.value).toLowerCase()
    for (i = 0; i < usernotes.length; i++) {
        var currentNote = usernotes.charAt(i).toLowerCase()
        if(i < usernotes.length - 1 && usernotes.charAt(i + 1) === '#') {
            var sharpNote = currentNote + '#';
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

    length=noteslist.length
    timePerNote = 6000/length
    audioCtx.resume();
    gainNode.gain.value = 0;
    if (noteslist.length>0){
        frequency(parseInt(noteslist[0]))
        drawWave()
    }
   let j=1
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
document.getElementById('ripto').addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.className = 'theme-ripto';
    }
});
document.getElementById('vona').addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.className = 'theme-vona';
    }
});
document.getElementById('academic').addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.className = 'theme-academic';
    }
});

