const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth'); // For parsing Word files
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Gemini API client
const cors = require('cors');

const app = express();
const genAI = new GoogleGenerativeAI('AIzaSyCVX_2Su6G7n67R5mYtVESVaCwxx4AZpWc'); // Replace with your API key

// Enable CORS to allow requests from your React app
app.use(cors());

// Set up storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// Function to parse Word file and extract text
async function parseWord(filePath) {
    const { value: text } = await mammoth.extractRawText({ path: filePath });
    return text;
}

async function queryGemini(data, question) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent([question, JSON.stringify(data)]);
        
        if (!result || !result.response || !result.response.text) {
            throw new Error("Invalid response format from Gemini API");
        }

        return result.response.text();
    } catch (error) {
        console.error("Error querying Gemini API:", error);
        throw new Error("Error generating response from Gemini API.");
    }
}


// Handle upload requests
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const question = req.body.question;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        // Ensure only .docx files are processed
        let fileContent;
        if (fileExtension === '.docx') {
            fileContent = await parseWord(req.file.path);
        } else {
            return res.status(400).json({ error: 'Unsupported file type' });
        }

        const answer = await queryGemini(fileContent, question);
        res.json({ answer });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: 'Failed to process request' });
    } finally {
        fs.unlinkSync(req.file.path); // Remove uploaded file after processing
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
