const puppeteer = require("puppeteer");
const fs = require('fs');
const path = require('path');

const generateOGImage = async (title, content, imagePath) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 630 });

    let imageBase64 = '';
    if (imagePath) {
        const imageBuffer = fs.readFileSync(imagePath);
        imageBase64 = imageBuffer.toString('base64');
        const mimeType = getMimeType(path.extname(imagePath));
        imageBase64 = `data:${mimeType};base64,${imageBase64}`;
    }

    await page.setContent(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
 <style>
            body, html {
                margin: 0;
                padding: 0;
                font-family: 'Arial', sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }
            .container {
                width: 1200px !important;
                height: 630px !important;
                position: relative;
            }
            .image-wrapper {
                width: 100%;
                height: 100%;
            }
            .image-wrapper img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .overlay {
                position: absolute;
                bottom: 0;
                width: 100%;
                height: 7rem;
                display : flex;
                align-items: center;
                justify-content: center;
            }
            .overlay-content {
                width: 100%;
                height: 100%;
                background: #fff;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);

                padding: 0.5rem;
                box-sizing: border-box;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .header p {
                font-weight: 600;
            }
            .header img {
                width: 1.5rem;
                height: 1.5rem;
                border-radius: 50%;
                object-fit: cover;
            }
            .content {
                font-weight: 600;
                margin-top: 0.2rem;
                font-size: 0.8rem;
            }
        </style>
        </head>
        <body>
            <div class="container">
                <div class="image-wrapper">
                    <img src="${imageBase64 || 'https://medial.app/image/medial-preview.png'}" alt="banner" />
                </div>
                <div class="overlay">
                    <div class="overlay-content">
                        <div class="header">
                            <p>${title}</p>
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXLBf2-ewOK4kykF964sspaLIhK8FC7uIvz3_7drUpuSBdAGynDnw36i9PHfyTlYknDP4&usqp=CAU" alt="medial" />
                        </div>
                        <p class="content">${content?.slice(0, 500)}</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
  `);

    const ogImage = await page.screenshot({ type: 'jpeg', fullPage: true });

    await browser.close();
    return ogImage;
};

function getMimeType(extension) {
    const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif'
    };
    return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
}

module.exports = generateOGImage;