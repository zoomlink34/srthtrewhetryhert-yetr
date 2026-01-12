const firebaseConfig = { databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const mover = document.getElementById('canvas-mover');
const mCanvas = document.getElementById('mainCanvas');
const mCtx = mCanvas.getContext('2d');
const soldOutLabel = document.getElementById('sold-out-overlay');
const counter = document.getElementById('pixel-count-display');

mCanvas.width = 5000; mCanvas.height = 2000; // ১০ মিলিয়ন পিক্সেল গ্রিড
const LIMIT = 10000000;

db.ref('pixels').on('value', snap => {
    const data = snap.val() || {};
    let totalSold = 0;
    Object.keys(data).forEach(k => { totalSold += parseInt(data[k].pixelCount || 0); });
    
    counter.innerText = totalSold.toLocaleString();
    if(totalSold >= LIMIT) soldOutLabel.style.display = "block";
    render(data);
});

let scale = 0.2, posX = 0, posY = 0;
function update() { mover.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`; }

document.getElementById('pixel-viewport').onwheel = (e) => {
    scale *= e.deltaY > 0 ? 0.9 : 1.1;
    scale = Math.max(0.1, Math.min(scale, 5));
    update();
};
// ড্র্যাগিং এবং রেন্ডার লজিক এখানে থাকবে...
function render(d) { mCtx.clearRect(0,0,5000,2000); /* ড্রয়িং কোড */ }
