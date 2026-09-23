const fs = require('fs');

const charBoundsRaw = "{}";

// Removed BIP39 word list dependencies to make repository smaller
const bip39Words = [];
const bip39WordsE = [];

// Read gg sans base64 font
const fontPath = './assets/gg-sans-regular.woff2';
const fontBase64 = fs.readFileSync(fontPath).toString('base64');

// Read background image
const imagePath = './assets/image10.png';
const imageBase64 = fs.readFileSync(imagePath).toString('base64');
const imageSrc = `data:image/png;base64,${imageBase64}`;

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DOM Pixel Perfect Seed Visualizer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @font-face {
            font-family: 'gg sans';
            src: url(data:font/woff2;base64,${fontBase64}) format('woff2');
        }
        body {
            background-color: #121218;
            color: #e5e5e5;
            font-family: 'gg sans', "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 16px;
            font-weight: 400;
            letter-spacing: normal;
            word-spacing: 0px;
            line-height: 22px;
            -webkit-font-smoothing: auto;
            text-rendering: optimizeLegibility;
        }
        #visualizer-wrapper {
            width: 100%;
            flex: 1;
            min-height: 0;
            overflow: hidden; /* Hide scrollbars for drag-to-pan */
            background: #1a1a20;
            border: 1px solid #444;
            border-radius: 8px;
            margin-top: 10px;
            position: relative;
            cursor: grab;
            user-select: none;
        }

        #render-area {
            position: absolute;
            width: 563px;
            height: 32px;
            background: #111;
            /* transform scale will be updated by JS */
            transform-origin: 0 0;
            left: 50%;
            top: 50%;
            margin-top: -16px;
            margin-left: -281px;
        }
        
        #main-canvas {
            position: absolute;
            left: 0;
            top: 0;
            image-rendering: pixelated; /* Ensure text and map are smooth when zoomed */
            width: 563px;
            height: 32px;
            pointer-events: none;
        }
        
        .zoom-controls {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 10px;
            background: #2b2b36;
            border-radius: 8px;
            margin-top: 20px;
        }
    </style>
</head>
<body class="h-screen overflow-hidden p-4 flex flex-col">
    <!-- Thẻ ẩn để ép trình duyệt load font gg sans -->
    <div style="font-family: 'gg sans'; position: absolute; visibility: hidden; pointer-events: none;">preload font</div>
    
    <!-- Hidden background image source for canvas -->
    <img id="bg-image-source" src="${imageSrc}" style="display: none;">

    <div class="max-w-6xl mx-auto w-full h-full flex flex-col pt-2">
        <h1 class="text-3xl font-bold mb-1 text-center text-blue-400 flex-shrink-0">Pixel Perfect Seed Visualizer</h1>
        <p class="text-center text-gray-400 text-xs mb-4 flex-shrink-0">Created by <span class="font-bold text-yellow-400">MANGOISME</span> to support the <a href="https://discord.com/channels/880987707214544966/1531390188998365374" target="_blank" class="font-bold text-green-400 hover:text-green-300 underline">OBSIDIAN CHALLENGE — FREE THE TURTLE</a> organized by <span class="font-bold text-purple-400">Precioso</span>.</p>

        <!-- ZOOM & CANVAS AREA ON TOP -->
        <div class="zoom-controls flex-shrink-0">
            <span class="text-sm font-semibold text-gray-300">Zoom Map:</span>
            <input type="range" id="zoom-slider" min="1" max="20" step="0.5" value="1" class="w-48">
            <span id="zoom-level" class="text-blue-400 font-bold">1x</span>
            
            <label class="ml-6 flex items-center cursor-pointer">
                <input type="checkbox" id="toggle-map" checked class="sr-only peer">
                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 relative"></div>
                <span class="ml-3 text-sm font-medium text-gray-300">Show Map Background</span>
            </label>

            <span class="text-xs text-gray-500 ml-auto">Drag to pan | Scroll to zoom</span>
        </div>

        <div id="visualizer-wrapper">
            <div id="render-area" style="transform: scale(1) translate(0px, 0px);">
                <canvas id="main-canvas" width="563" height="32"></canvas>
            </div>
        </div>
        
        <div class="mt-2 mb-4 text-center text-gray-400 text-sm flex-shrink-0" id="stats-msg">
            <p>Canvas Render | Background Map Offset: X -12px, Y 11px</p>
        </div>

        <!-- INPUTS BELOW -->
        <div class="mb-4 bg-[#2b2b36] p-4 rounded-xl shadow-lg border border-[#3f3f4e] flex-shrink-0 flex items-end gap-3">
            <div class="flex-1">
                <label class="block text-sm font-semibold text-gray-400 mb-2">Paste full 12-word seed phrase:</label>
                <input type="text" id="paste-input" placeholder="Example: certain obtain smoke palace smart sense head ridge artist nature piano file" autocomplete="off" class="w-full bg-[#1a1a20] border border-[#444] text-white p-3 rounded-lg focus:border-blue-500 outline-none">
            </div>
            <button id="btn-guide" class="px-5 py-3 bg-[#3f3f4e] hover:bg-[#4f4f60] text-gray-200 text-sm rounded-lg font-semibold transition-colors border border-[#555]">Rules Guide</button>
            <button id="btn-reset" class="px-5 py-3 bg-[#3f3f4e] hover:bg-[#4f4f60] text-gray-200 text-sm rounded-lg font-semibold transition-colors border border-[#555]">Reset</button>
            <button id="btn-download" class="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-semibold transition-colors border border-blue-500">Download PNG</button>
        </div>

        <div class="grid grid-cols-3 md:grid-cols-4 gap-4 bg-[#2b2b36] p-4 rounded-xl shadow-lg border border-[#3f3f4e] flex-shrink-0">
            ${[...Array(12)].map((_, i) => {
                const num = i + 1;
                let fixedValue = '';
                let readOnly = '';
                let labelText = 'Word ' + num;
                let labelColor = 'text-gray-500';
                let placeholder = 'Enter word...';
                
                if (num === 3) { 
                    labelText = 'Word 3 (Must be smoke)';
                    labelColor = 'text-yellow-400';
                }
                if (num === 8) { 
                    labelText = 'Word 8 (Ends with e)';
                    labelColor = 'text-yellow-400';
                }
                if (num === 9) { 
                    fixedValue = 'artist'; readOnly = 'readonly'; 
                    labelText = 'Word 9 (Fixed)';
                    labelColor = 'text-green-500';
                }
                if (num === 10) { 
                    fixedValue = 'nature'; readOnly = 'readonly'; 
                    labelText = 'Word 10 (Fixed)';
                    labelColor = 'text-green-500';
                }
                if (num === 11) { 
                    fixedValue = 'piano'; readOnly = 'readonly'; 
                    labelText = 'Word 11 (Fixed)';
                    labelColor = 'text-green-500';
                }
                
                let dataListId = 'bip39-words';
                if (num === 8) { dataListId = 'bip39-words-e'; }
                
                return '<div class="input-group">' +
                    '<label class="block text-xs font-bold ' + labelColor + ' mb-1">' + labelText + '</label>' +
                    '<input type="text" id="word-' + num + '" value="' + fixedValue + '" ' + readOnly + ' list="' + dataListId + '" placeholder="' + placeholder + '" autocomplete="off" class="w-full bg-[#1a1a20] border border-[#444] text-white px-3 py-2 rounded-lg text-sm focus:border-blue-500 focus:outline-none ' + (readOnly ? 'opacity-80 cursor-not-allowed font-bold text-green-400' : '') + '">' +
                '</div>';
            }).join('')}
        </div>
    </div>
    
    <!-- Rules Guide Modal -->
    <div id="guide-modal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div class="bg-[#2b2b36] p-6 rounded-xl border border-[#3f3f4e] max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold text-blue-400 mb-2 text-center">Pixel Perfect Seed Visualizer</h2>
            <p class="text-center text-gray-300 mb-4 text-sm">Created by <span class="font-bold text-yellow-400">MANGOISME</span> to support the <a href="https://discord.com/channels/880987707214544966/1531390188998365374" target="_blank" class="font-bold text-green-400 hover:text-green-300 underline">OBSIDIAN CHALLENGE — FREE THE TURTLE</a> organized by <span class="font-bold text-purple-400">Precioso</span>.</p>
            
            <h3 class="text-lg font-bold text-gray-200 mt-4 mb-2 border-b border-[#3f3f4e] pb-1">Puzzle Constraints & Rules</h3>
            <ul class="text-gray-300 space-y-2 list-disc pl-5 text-sm mb-4">
                <li><strong>Word Count:</strong> Exactly 12 words.</li>
                <li><strong>Uniqueness:</strong> All 12 words must be completely unique (no duplicates).</li>
                <li><strong>Word 3:</strong> Must be <span class="text-blue-300 font-mono bg-[#1a1a20] px-1 rounded border border-[#3f3f4e]">smoke</span></li>
                <li><strong>Word 8:</strong> Must end with the letter <span class="text-blue-300 font-mono bg-[#1a1a20] px-1 rounded border border-[#3f3f4e]">e</span></li>
                <li><strong>Words 9, 10, 11:</strong> Must be <span class="text-blue-300 font-mono bg-[#1a1a20] px-1 rounded border border-[#3f3f4e]">artist nature piano</span></li>
                <li><strong>Confirmed Word:</strong> The word <span class="text-blue-300 font-mono bg-[#1a1a20] px-1 rounded border border-[#3f3f4e]">palace</span> is confirmed to be in the phrase, but its exact position is unknown.</li>
            </ul>

            <div class="bg-[#1a1a20] p-4 rounded-lg border border-[#444] mb-4">
                <p class="text-gray-400 text-xs text-justify"><strong>Disclaimer:</strong> This tool is an open-source, independent community project. It is not affiliated with, endorsed, or sponsored by Discord or the challenge organizers. All puzzle hints and constraints are sourced from Precioso or verified community decodings. It operates entirely locally and does NOT store, transmit, or send your 12-word seed phrases anywhere.</p>
            </div>
            
            <button id="close-guide" class="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors border border-blue-500">Understood</button>
        </div>
    </div>
    
    <datalist id="bip39-words">
        ${bip39Words.map(w => `<option value="${w}">`).join('\n        ')}
    </datalist>
    <datalist id="bip39-words-e">
        ${bip39WordsE.map(w => `<option value="${w}">`).join('\n        ')}
    </datalist>

    <script>
        // Discord font character dimensions
        const charBounds = ${charBoundsRaw};
        const SPACE = 3.515625;
        const TARGET_WIDTH = 359.0;
        const TARGET_X = -12 + TARGET_WIDTH; // X coordinate on Canvas

        const inputs = Array.from({length: 12}, (_, i) => document.getElementById(\`word-\${i+1}\`));
        const pasteInput = document.getElementById('paste-input');
        const canvas = document.getElementById('main-canvas');
        const ctx = canvas.getContext('2d');
        const bgImg = document.getElementById('bg-image-source');
        
        const zoomSlider = document.getElementById('zoom-slider');
        const zoomLevel = document.getElementById('zoom-level');
        const renderArea = document.getElementById('render-area');
        const wrapper = document.getElementById('visualizer-wrapper');
        const toggleMap = document.getElementById('toggle-map');
        const statsMsg = document.getElementById('stats-msg');

        let scale = 1;
        let panX = 0;
        let panY = 0;
        let isDragging = false;
        let startX = 0;
        let startY = 0;

        function updateTransform() {
            renderArea.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${scale})\`;
            zoomSlider.value = scale;
            zoomLevel.textContent = scale.toFixed(1) + 'x';
        }

        zoomSlider.addEventListener('input', (e) => {
            scale = parseFloat(e.target.value);
            updateTransform();
        });
        
        toggleMap.addEventListener('change', () => {
            updateVisualizer();
        });

        // Mouse Wheel Zoom
        wrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.5 : 0.5;
            let newScale = scale + delta;
            if (newScale < 1) newScale = 1;
            if (newScale > 20) newScale = 20;
            scale = newScale;
            updateTransform();
        }, { passive: false });

        // Drag to Pan
        wrapper.addEventListener('mousedown', (e) => {
            isDragging = true;
            wrapper.style.cursor = 'grabbing';
            startX = e.clientX - panX;
            startY = e.clientY - panY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            updateTransform();
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            wrapper.style.cursor = 'grab';
        });

        pasteInput.addEventListener('input', (e) => {
            const pastedText = e.target.value.trim();
            if (!pastedText) return;
            
            const words = pastedText.split(/\\s+/);
            for (let i = 0; i < Math.min(words.length, 12); i++) {
                if (!inputs[i].readOnly) {
                    inputs[i].value = words[i];
                }
            }
            updateVisualizer();
        });

        function getWordWidth(w) {
            return charBounds[w] ? charBounds[w].width : ctx.measureText(w).width;
        }

        function calculateMathWidth(words) {
            if (words.length === 0) return 0;
            let total = 0;
            for (let i = 0; i < words.length; i++) {
                total += getWordWidth(words[i]);
                if (i < words.length - 1) total += SPACE;
            }
            return total;
        }

        function updateVisualizer() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background if toggled ON
            if (toggleMap.checked && bgImg.complete) {
                ctx.drawImage(bgImg, 0, 0);
            }
            
            // Lấy trực tiếp 8 từ đầu tiên từ 8 ô input đầu
            const first8 = [];
            for (let i = 0; i < 8; i++) {
                const w = inputs[i].value.trim();
                if (w) first8.push(w);
            }
            
            const word12 = inputs[11].value.trim();
            
            if (first8.length > 0 || word12) {
                // Apply exact Discord font properties to Canvas Context
                ctx.font = "400 16px 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
                ctx.letterSpacing = "0px";
                ctx.wordSpacing = "0px";
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.textBaseline = "alphabetic";
                
                // 1. Calculate Math Width for reporting
                const mathWidth = calculateMathWidth(first8);
                
                // Anchor right edge exactly at 367px based on first 8 words
                const textWithE = first8.join(' ');
                const canvasWidth = ctx.measureText(textWithE).width;
                const rightAnchorX = 367.0 - canvasWidth; 
                
                if (toggleMap.checked) {
                    // MAP MODE: Remove 'e', hide 9,10,11, draw 12 at 501px
                    let textToDraw = textWithE;
                    if (first8.length === 8 && textToDraw.endsWith('e')) {
                        textToDraw = textToDraw.slice(0, -1);
                    }
                    if (textToDraw) {
                        ctx.fillText(textToDraw, rightAnchorX, 21);
                    }
                    if (word12) {
                        ctx.fillText(word12, 501, 21);
                    }
                } else {
                    // TEXT ONLY MODE: Draw ALL 12 words as a single continuous string!
                    const all12 = [...first8];
                    for (let i = 8; i < 12; i++) {
                        const w = inputs[i].value.trim();
                        if (w) all12.push(w);
                    }
                    
                    if (all12.length > 0) {
                        const fullText = all12.join(' ');
                        // Start drawing exactly at the same X coordinate so the first 8 words align perfectly!
                        ctx.fillText(fullText, rightAnchorX, 21);
                    }
                }
                
                // 4. Update stats
                const mathStartDisplay = 359.0 - mathWidth;
                const msg = \`<span class="text-blue-400 font-bold">Start X: \${mathStartDisplay.toFixed(4)}px</span> &nbsp;|&nbsp; Right Anchor: 367px &nbsp;|&nbsp; Word 12 X: 501px\`;
                statsMsg.innerHTML = msg;
            }
        }
        
        // ACTION BUTTONS LOGIC
        const guideModal = document.getElementById('guide-modal');
        document.getElementById('btn-guide').addEventListener('click', () => {
            guideModal.classList.remove('hidden');
        });
        document.getElementById('close-guide').addEventListener('click', () => {
            guideModal.classList.add('hidden');
        });
        
        document.getElementById('btn-reset').addEventListener('click', () => {
            document.getElementById('paste-input').value = '';
            for(let i=1; i<=12; i++) {
                if (i !== 9 && i !== 10 && i !== 11) {
                    document.getElementById('word-' + i).value = '';
                }
            }
            updateVisualizer();
        });
        
        document.getElementById('btn-download').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'seed_visualizer_563x32.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });

        inputs.forEach(input => {
            input.addEventListener('input', updateVisualizer);
        });
        
        // Wait for image to load before first render
        if (bgImg.complete) {
            document.fonts.ready.then(updateVisualizer);
        } else {
            bgImg.onload = () => {
                document.fonts.ready.then(updateVisualizer);
            };
        }
    </script>
</body>
</html>`;

fs.writeFileSync('index.html', htmlTemplate);
console.log('✅ Successfully created index.html with native gg sans DOM rendering!');
