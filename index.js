const express = require('express');
const multer = require('multer');
const generateOGImage = require('./utils/generateOGImage');
const fs = require('fs');
const path = require('path');

const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors())
// Configure multer to store files with their original extension
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

app.use(express.json());

app.post('/generate-og-image', upload.single('image'), async (req, res) => {
    try {

        const { title, content } = req.body;
        const imagePath = req.file ? req.file.path : null;

        console.log('Generating OG Image with:', { title, content, imagePath });

        const ogImage = await generateOGImage(title, content, imagePath);
        
        const ogImagePath = `og-images/${Date.now()}.jpeg`;
        fs.writeFileSync(ogImagePath, ogImage);
        
        const orgImageUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

        res.status(200).json({ ok: true, originalImageUrl: orgImageUrl, imageUrl: `http://localhost:5000/${ogImagePath}` });

    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, message: error });
    }
});

app.use('/og-images', express.static('og-images'));
app.use('/uploads', express.static('uploads')); // Serve uploaded files

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});