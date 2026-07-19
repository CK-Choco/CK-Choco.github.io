// script.js 檔案內容
document.addEventListener('click', function() {
  const video = document.getElementById('bgVideo');
  if (video) {
    video.muted = false; // 解除靜音
    video.play().catch(error => {
      console.log("播放被瀏覽器阻擋了：", error);
    });
  }
}, { once: true });

