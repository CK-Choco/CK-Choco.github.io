let countdownInterval;
let targetTimestamp;
let currentMode = 'holiday';

// 切換模式（政府節日 / 手選日期）
function toggleSwitch() {
    const container = document.getElementById('mode-switch');
    currentMode = (currentMode === 'holiday') ? 'custom' : 'holiday';
    
    container.classList.toggle('custom-mode', currentMode === 'custom');
    document.getElementById('opt-holiday').classList.toggle('active', currentMode === 'holiday');
    document.getElementById('opt-custom').classList.toggle('active', currentMode === 'custom');
    
    document.getElementById('holiday-wrapper').classList.toggle('hidden', currentMode !== 'holiday');
    document.getElementById('custom-wrapper').classList.toggle('hidden', currentMode !== 'custom');
    startTimer();
}

// 自動獲取跨年度日曆資料
async function loadAllHolidays() {
    const select = document.getElementById('holiday-select');
    const syncContainer = document.getElementById('sync-container');
    const syncText = document.getElementById('sync-text');
    const years = [new Date().getFullYear(), new Date().getFullYear() + 1]; 
    let allHolidays = [];
    let success = false;

    for (const year of years) {
        try {
            const resp = await fetch(`https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`);
            if (resp.ok) {
                const data = await resp.json();
                allHolidays = allHolidays.concat(data.filter(i => i.isHoliday && i.description));
                success = true;
            }
        } catch (e) { console.error(`${year} 資料抓取失敗`); }
    }

    if (success) {
        syncContainer.classList.add('online');
        syncText.innerText = "已自動同步最新日曆";
    }

    const now = new Date();
    select.innerHTML = "";
    allHolidays.forEach(h => {
        const dateObj = new Date(`${h.date.substring(0,4)}-${h.date.substring(4,6)}-${h.date.substring(6,8)}T00:00:00`);
        if (dateObj > now) {
            const opt = document.createElement('option');
            opt.value = dateObj.toISOString();
            opt.innerText = `${h.description} (${h.date.substring(4,6)}/${h.date.substring(6,8)})`;
            select.appendChild(opt);
        }
    });
    startTimer();
}

// 開始倒數計時
function startTimer() {
    if (countdownInterval) clearInterval(countdownInterval);
    const displayName = document.getElementById('display-name');

    if (currentMode === 'holiday') {
        const select = document.getElementById('holiday-select');
        if (!select.value) { displayName.innerText = "目前無節日資料"; return; }
        targetTimestamp = new Date(select.value).getTime();
        displayName.innerText = `距離 ${select.options[select.selectedIndex].text}`;
    } else {
        const val = document.getElementById('custom-date').value;
        if (!val) { displayName.innerText = "請選取日期"; return; }
        targetTimestamp = new Date(val).getTime();
        displayName.innerText = "距離 手選目標日期";
    }
    countdownInterval = setInterval(updateDisplay, 1000);
    updateDisplay();
}

// 更新畫面數字
function updateDisplay() {
    const diff = targetTimestamp - new Date().getTime();
    if (diff <= 0) {
        ['d','h','m','s'].forEach(id => document.getElementById(id).innerText = "00");
        return;
    }
    document.getElementById('d').innerText = Math.floor(diff / 86400000).toString().padStart(2,'0');
    document.getElementById('h').innerText = Math.floor((diff % 86400000) / 3600000).toString().padStart(2,'0');
    document.getElementById('m').innerText = Math.floor((diff % 3600000) / 60000).toString().padStart(2,'0');
    document.getElementById('s').innerText = Math.floor((diff % 60000) / 1000).toString().padStart(2,'0');
}

// 初始啟動
loadAllHolidays();