const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const OpenAI = require('openai');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const NOTES_DIR = 'C:\\Anteckningar';
const PROCESSED_DIR = path.join(NOTES_DIR, 'processed');

// Skapa processed-mappen om den inte finns
if (!fs.existsSync(PROCESSED_DIR)) {
  fs.mkdirSync(PROCESSED_DIR, { recursive: true });
}

// Uppdatera OpenAI-konfigurationen
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

// Skapa WebSocket server
const server = app.listen(PORT);
const wss = new WebSocket.Server({ server });

// Hantera WebSocket-anslutningar
wss.on('connection', (ws) => {
  console.log('Ny klient ansluten');
});

// Funktion för att meddela alla anslutna klienter
const notifyClients = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Funktion för att rensa text med AI
async function cleanText(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Du är en professionell textredaktör. Din uppgift är att förbättra texten genom att:\n" +
                   "1. Korrigera stavning och grammatik\n" +
                   "2. Förbättra meningsuppbyggnad\n" +
                   "3. Göra texten mer formell och professionell\n" +
                   "4. Lägga till skiljetecken där det behövs\n" +
                   "6. Om det är en lista, gör det till en snygg lista\n" +
                   "5. Formatera texten på ett tydligt sätt\n\n" +
                   "Om texten är på svenska, svara på svenska. Om texten är på engelska, svara på engelska."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error cleaning text:', error);
    return text;
  }
}

// Bevaka mappen för nya filer
const watcher = chokidar.watch(NOTES_DIR, {
  ignored: /(^|[\/\\])\../, // Ignorera dolda filer
  persistent: true
});

watcher.on('add', async (filepath) => {
  // Ignorera filer i processed-mappen
  if (filepath.includes('processed')) return;

  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const cleanedContent = await cleanText(content);
    
    const filename = path.basename(filepath);
    const processedPath = path.join(PROCESSED_DIR, `cleaned_${filename}`);
    
    fs.writeFileSync(processedPath, cleanedContent);
    
    notifyClients({
      type: 'fileProcessed',
      filename: filename
    });
    
    console.log(`Processed file: ${filename}`);
  } catch (error) {
    console.error('Error processing file:', error);
  }
});

// API-endpoint för att hämta lista på bearbetade filer
app.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(PROCESSED_DIR)
      .filter(file => file.startsWith('cleaned_'))
      .map(file => {
        const stats = fs.statSync(path.join(PROCESSED_DIR, file));
        return {
          name: file.replace('cleaned_', ''),
          processedAt: stats.mtime
        };
      });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta fillistan' });
  }
});

console.log(`Server running on port ${PORT}`); 