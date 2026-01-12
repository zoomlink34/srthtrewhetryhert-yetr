const firebaseConfig = { databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const mover = document.getElementById('canvas-mover');
const mCanvas = document.getElementById('mainCanvas');
const mCtx = mCanvas.getContext('2d');
const soldOutLabel = document.getElementById('sold-out-overlay');
const counter = document.getElementById('pixel-count-display');

// ১০ মিলিয়ন পিক্সেল এরিয়া (৫০০০ x ২০০০ পিক্সেল)
mCanvas.width = 5000; 
mCanvas.height = 2000; 
const LIMIT = 10000000;

let scale = 0.2, posX = 0, posY = 0, isDragging = false, startX, startY;

// মাউস দিয়ে নাড়াচাড়া (Drag) করার লজিক
const viewport = document.getElementById('pixel-viewport');

viewport.onmousedown = (e) => {
    isDragging = true;
    viewport.style.cursor = 'grabbing';
    startX = e.clientX - posX;
    startY = e.clientY - posY;
};

window.onmouseup = () => {
    isDragging = false;
    viewport.style.cursor = 'grab';
};

window.onmousemove = (e) => {
    if (isDragging) {
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        updateTransform();
    }
};

// মাউস হুইল দিয়ে জুম করার লজিক
viewport.onwheel = (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    if (e.deltaY > 0) {
        scale *= (1 - zoomSpeed); // Zoom Out
    } else {
        scale *= (1 + zoomSpeed); // Zoom In
    }
    // জুম লিমিট (০.১ থেকে ৫ গুণ পর্যন্ত)
    scale = Math.max(0.1, Math.min(scale, 5));
    updateTransform();
};

function updateTransform() {
    mover.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// প্রাথমিক পজিশন সেট
updateTransform();

// ডাটাবেস থেকে পিক্সেল আপডেট এবং সোল্ড আউট চেক
db.ref('pixels').on('value', snap => {
    const data = snap.val() || {};
    let totalSold = 0;
    
    Object.keys(data).forEach(k => { 
        totalSold += parseInt(data[k].pixelCount || 0); 
    });
    
    counter.innerText = totalSold.toLocaleString();
    
    // ১০ মিলিয়ন পূর্ণ হলে লাল সোল্ড আউট দেখাবে
    if(totalSold >= LIMIT) {
        soldOutLabel.style.display = "block";
    } else {
        soldOutLabel.style.display = "none";
    }
    
    render(data);
});

// গ্রিড এবং পিক্সেল ড্রয়িং
function render(pixelData) {
    mCtx.clearRect(0, 0, 5000, 2000);
    
    // হালকা গ্রিড লাইন
    mCtx.strokeStyle = "#EEEEEE";
    mCtx.lineWidth = 0.5;
    for(let x=0; x<=5000; x+=10) { mCtx.beginPath(); mCtx.moveTo(x,0); mCtx.lineTo(x,2000); mCtx.stroke(); }
    for(let y=0; y<=2000; y+=10) { mCtx.beginPath(); mCtx.moveTo(0,y); mCtx.lineTo(5000,y); mCtx.stroke(); }
    
    // বিক্রি হওয়া পিক্সেলগুলো ম্যাপে দেখানো (যদি ইমেজ থাকে)
    Object.keys(pixelData).forEach(id => {
        const p = pixelData[id];
        if(p.imageUrl) {
            const img = new Image();
            img.src = p.imageUrl;
            img.onload = () => {
                // এখানে পিক্সেলের পজিশন লজিক আপনার ডাটাবেস অনুযায়ী বসবে
                // উদাহরণ: mCtx.drawImage(img, p.x, p.y, p.w, p.h);
            };
        }
    });
}
