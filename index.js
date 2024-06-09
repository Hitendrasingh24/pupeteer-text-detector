const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/check', async (req, res) => {
    const { text } = req.body;

    try {
        const browser = await puppeteer.launch();
        // const browser = await puppeteer.launch({ headless: false }); 
        const page = await browser.newPage();
        await page.goto('https://www.scribbr.co.uk/ai-detector/');
        
        await page.type('.content.p-3', text);
        await page.click('.btn.btn--purple-gradient.btn--small');

        await page.waitForSelector('.percentage.purple.d-block.text-center.text-purple-gradient', { timeout: 10000 });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const percentageText = await page.$eval('.percentage.purple.d-block.text-center.text-purple-gradient', el => el.textContent);

        console.log('Extracted text:', percentageText);

        const percentageMatch = percentageText.match(/\d+/);
        const percentage = percentageMatch ? percentageMatch[0] : '0';

        await browser.close();

        res.json({ percentage });
    } catch (error) {
        console.error('Error checking text:', error);
        res.status(500).send('Error checking text');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
