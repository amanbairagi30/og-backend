const puppeteer = require("puppeteer");
const fs = require('fs');
const path = require('path');

const generateOGImage = async (title, content, imagePath) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let imageBase64 = '';
  if (imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    imageBase64 = imageBuffer.toString('base64');
    const mimeType = getMimeType(path.extname(imagePath));
    imageBase64 = `data:${mimeType};base64,${imageBase64}`;
  }

  await page.setContent(`
    <html>
      <head>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          }
          .container {
            width: 1200px;
            height: 630px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
            box-sizing: border-box;
          }
          .title {
            font-size: 48px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
            max-width: 80%;
          }
          .content {
            font-size: 24px;
            color: #666;
            margin-bottom: 30px;
            text-align: center;
            max-width: 70%;
            line-height: 1.4;
          }
          .image-container {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
          }
          .post-image {
            max-width: 80%;
            max-height: 300px;
            object-fit: contain;
            border-radius: 10px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="title">${title}</h1>
          <p class="content">${content}</p>
          ${imageBase64 ? `
            <div class="image-container">
              <img src="${imageBase64}" alt="Post Image" class="post-image" />
            </div>
          ` : ''}
        </div>
      </body>
    </html>
  `);

  const ogImage = await page.screenshot({ type: 'jpeg' });

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