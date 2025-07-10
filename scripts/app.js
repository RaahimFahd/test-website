document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const playerContainer = document.getElementById('player-container');
    const filenameDisplay = document.getElementById('filename-display');

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        playerContainer.innerHTML = '';
        filenameDisplay.textContent = `Selected: ${file.name}`;

        // Handle audio (mp3)
        if (ext === 'mp3') {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.autoplay = true;
            audio.src = URL.createObjectURL(file);
            playerContainer.appendChild(audio);

            // Download button
            const downloadBtn = document.createElement('a');
            downloadBtn.href = audio.src;
            downloadBtn.download = file.name;
            downloadBtn.textContent = "Download Audio";
            downloadBtn.className = "file-link";
            playerContainer.appendChild(downloadBtn);
        }
        // Handle video (mp4) with option to extract audio
        else if (ext === 'mp4') {
            const video = document.createElement('video');
            video.controls = true;
            video.autoplay = true;
            video.src = URL.createObjectURL(file);
            video.style.width = '100%';
            playerContainer.appendChild(video);

            // Extract audio button
            const extractBtn = document.createElement('button');
            extractBtn.textContent = "Extract & Download MP3 Audio";
            extractBtn.className = "extract-btn";
            extractBtn.onclick = async () => {
                extractBtn.disabled = true;
                filenameDisplay.textContent = "Extracting audio, please wait...";
                await extractAudioFromMp4(file, playerContainer, filenameDisplay);
            };
            playerContainer.appendChild(extractBtn);

            // Download original video
            const downloadBtn = document.createElement('a');
            downloadBtn.href = video.src;
            downloadBtn.download = file.name;
            downloadBtn.textContent = "Download Original MP4";
            downloadBtn.className = "file-link";
            playerContainer.appendChild(downloadBtn);
        }
        // Handle PDF
        else if (ext === 'pdf') {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.target = "_blank";
            link.textContent = "Open PDF";
            link.className = "file-link";
            playerContainer.appendChild(link);
        }
        // Handle Word
        else if (ext === 'doc' || ext === 'docx') {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.download = file.name;
            link.textContent = "Download Word Document";
            link.className = "file-link";
            playerContainer.appendChild(link);
        }
        // Handle Excel
        else if (ext === 'xls' || ext === 'xlsx') {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.download = file.name;
            link.textContent = "Download Excel File";
            link.className = "file-link";
            playerContainer.appendChild(link);
        }
        // Unsupported
        else {
            filenameDisplay.textContent = '';
            alert('Unsupported file type.');
        }
    });
});

// Extract audio from MP4 using ffmpeg.js
async function extractAudioFromMp4(file, playerContainer, filenameDisplay) {
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: false });
    await ffmpeg.load();
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));
    await ffmpeg.run('-i', 'input.mp4', '-q:a', '0', '-map', 'a', 'output.mp3');
    const data = ffmpeg.FS('readFile', 'output.mp3');
    const audioBlob = new Blob([data.buffer], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Remove previous content
    playerContainer.innerHTML = '';

    // Create audio player
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.autoplay = true;
    audio.src = audioUrl;
    playerContainer.appendChild(audio);

    // Download button
    const downloadBtn = document.createElement('a');
    downloadBtn.href = audioUrl;
    downloadBtn.download = file.name.replace(/\.mp4$/i, '.mp3');
    downloadBtn.textContent = "Download Extracted MP3";
    downloadBtn.className = "file-link";
    playerContainer.appendChild(downloadBtn);

    filenameDisplay.textContent = `Extracted: ${downloadBtn.download}`;
}