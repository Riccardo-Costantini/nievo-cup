import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Configurazione dell'ambiente per evitare errori in contesti puramente statici (no local server fallback)
env.allowLocalModels = false;

// Elementi del DOM
const modelStatusContainer = document.getElementById('model-status-container');
const modelStatusText = document.getElementById('model-status-text');
const modelProgressBar = document.getElementById('model-progress-bar');
const modelProgressPercent = document.getElementById('model-progress-percent');

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

const processContainer = document.getElementById('process-container');
const statProcessed = document.getElementById('stat-processed');
const statRemaining = document.getElementById('stat-remaining');
const statEta = document.getElementById('stat-eta');
const currentFileName = document.getElementById('current-file-name');
const batchProgressBar = document.getElementById('batch-progress-bar');
const batchProgressPercent = document.getElementById('batch-progress-percent');

const resultContainer = document.getElementById('result-container');
const downloadAllBtn = document.getElementById('download-all-btn');
const previewGrid = document.getElementById('preview-grid');

// Variabili di Stato dell'Applicazione
let segmenter = null;
let processedImages = []; // Array di oggetti { name: string, blob: Blob }
let processingQueue = [];
let totalInBatch = 0;
let startTime = 0;
let processDurations = [];

// 1. Inizializzazione del modello AI (RMBG-1.4 ottimizzato per il web)
async function initModel() {
    try {
        segmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    const progress = Math.round(data.progress);
                    modelProgressBar.style.width = `${progress}%`;
                    modelProgressPercent.textContent = `${progress}%`;
                } else if (data.status === 'ready') {
                    modelStatusText.textContent = 'Modello caricato con successo!';
                    modelProgressBar.style.width = '100%';
                    modelProgressPercent.textContent = '100%';
                    setTimeout(() => {
                        modelStatusContainer.classList.add('hidden');
                        // Sblocca la drop zone ad inizializzazione completata
                        dropZone.classList.remove('disabled');
                        fileInput.removeAttribute('disabled');
                    }, 800);
                }
            }
        });
    } catch (error) {
        console.error("Errore durante il caricamento del modello:", error);
        modelStatusText.textContent = "Errore nel caricamento del modello AI.";
    }
}

// 2. Gestione eventi Drag & Drop ed Input File
function setupEventListeners() {
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            if (!dropZone.classList.contains('disabled')) {
                dropZone.classList.add('drag-over');
            }
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        if (dropZone.classList.contains('disabled')) return;
        const dt = e.dataTransfer;
        const files = Array.from(dt.files);
        if (files.length > 0) handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) handleFiles(files);
    });

    downloadAllBtn.addEventListener('click', downloadAllAsZip);
}

// 3. Normalizzazione e preparazione della coda batch
async function handleFiles(files) {
    // Nascondi area risultati precedente
    resultContainer.classList.add('hidden');
    previewGrid.innerHTML = '';
    processedImages = [];
    processDurations = [];
    
    // Filtra file validi
    processingQueue = files.filter(file => {
        const name = file.name.toLowerCase();
        return file.type.startsWith('image/') || name.endsWith('.heic');
    });

    if (processingQueue.length === 0) return;

    totalInBatch = processingQueue.length;
    processContainer.classList.remove('hidden');
    
    updateBatchUI(0);
    startTime = Date.now();
    
    // Avvia l'elaborazione sequenziale
    processNextInQueue();
}

// 4. Elaborazione sequenziale (Coda) per preservare la RAM
async function processNextInQueue() {
    if (processingQueue.length === 0) {
        // Fine della coda
        processContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        return;
    }

    const currentProcessedIndex = totalInBatch - processingQueue.length;
    updateBatchUI(currentProcessedIndex);

    let currentFile = processingQueue.shift();
    currentFileName.textContent = currentFile.name;
    const itemStartTime = Date.now();

    try {
        // Controllo e conversione se il file è in formato Apple HEIC
        if (currentFile.name.toLowerCase().endsWith('.heic')) {
            currentFileName.textContent = `[Conversione HEIC...] ${currentFile.name}`;
            const convertedBlob = await heic2any({
                blob: currentFile,
                toType: 'image/png'
            });
            // heic2any può ritornare un array se l'heic contiene più immagini, prendiamo la prima
            const actualBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            const newName = currentFile.name.replace(/\.[^/.]+$/, "") + ".png";
            currentFile = newFileFromBlob(actualBlob, newName);
        }

        currentFileName.textContent = `[Rimozione Sfondo AI...] ${currentFile.name}`;

        // Trasforma il file in un URL per l'elaborazione del modello AI
        const objectURL = URL.createObjectURL(currentFile);
        
        // Esecuzione dell'estrazione dello sfondo via Transformers.js
        const output = await segmenter(objectURL);
        
        // Rilascio immediato della memoria dell'oggetto URL
        URL.revokeObjectURL(objectURL);

        // Converte l'output del modello (oggetto Image di Transformers.js) in Blob PNG
        const outputBlob = await output.toBlob();
        const finalName = currentFile.name.replace(/\.[^/.]+$/, "") + "_no_bg.png";

        // Salva in memoria per il file ZIP finale
        processedImages.push({ name: finalName, blob: outputBlob });

        // Calcola tempistiche per stima ETA
        const itemDuration = (Date.now() - itemStartTime) / 1000;
        processDurations.push(itemDuration);

        // Aggiungi elemento visivo alla griglia delle anteprime
        appendPreviewImage(outputBlob);

    } catch (error) {
        console.error(`Errore durante l'elaborazione di ${currentFile.name}:`, error);
    }

    // Processa ricorsivamente il file successivo
    setTimeout(processNextInQueue, 50);
}

// Interfaccia ausiliaria per creare un oggetto File da un Blob
function newFileFromBlob(blob, filename) {
    return new File([blob], filename, { type: blob.type });
}

// Aggiornamento dell'interfaccia utente delle statistiche batch e calcolo dinamico dell'ETA
function updateBatchUI(processedCount) {
    const remainingCount = totalInBatch - processedCount;
    statProcessed.textContent = processedCount;
    statRemaining.textContent = remainingCount;

    const percent = Math.round((processedCount / totalInBatch) * 100);
    batchProgressBar.style.width = `${percent}%`;
    batchProgressPercent.textContent = `${percent}%`;

    if (processDurations.length > 0 && remainingCount > 0) {
        // Calcolo della media mobile del tempo di elaborazione per singolo file
        const avgDuration = processDurations.reduce((a, b) => a + b, 0) / processDurations.length;
        const totalEtaSeconds = Math.round(avgDuration * remainingCount);
        
        const minutes = Math.floor(totalEtaSeconds / 60);
        const seconds = totalEtaSeconds % 60;
        statEta.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (remainingCount === 0) {
        statEta.textContent = "00:00";
    } else {
        statEta.textContent = "--:--";
    }
}

// Visualizzazione immediata in griglia del risultato
function appendPreviewImage(blob) {
    const imgUrl = URL.createObjectURL(blob);
    const wrapper = document.createElement('div');
    wrapper.className = 'preview-item';
    
    const img = document.createElement('img');
    img.src = imgUrl;
    img.onload = () => URL.revokeObjectURL(imgUrl); // Ottimizzazione della memoria post-caricamento dell'immagine del DOM

    wrapper.appendChild(img);
    previewGrid.appendChild(wrapper);
}

// 5. Compressione ed esportazione massiva in pacchetto ZIP
async function downloadAllAsZip() {
    if (processedImages.length === 0) return;

    downloadAllBtn.disabled = true;
    const originalText = downloadAllBtn.innerHTML;
    downloadAllBtn.textContent = 'Creazione pacchetto ZIP...';

    const zip = new JSZip();
    
    // Aggiunta iterativa dei file convertiti nell'archivio
    processedImages.forEach(item => {
        zip.file(item.name, item.blob);
    });

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(content);
        
        // Trigger del download programmatico nativo del browser
        const downloadLink = document.createElement('a');
        downloadLink.href = zipUrl;
        downloadLink.download = `immagini_senza_sfondo_${Date.now()}.zip`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(zipUrl);
    } catch (err) {
        console.error("Impossibile generare il file ZIP", err);
    } finally {
        downloadAllBtn.disabled = false;
        downloadAllBtn.innerHTML = originalText;
    }
}

// Avvio applicazione
window.addEventListener('DOMContentLoaded', () => {
    initModel();
    setupEventListeners();
});
