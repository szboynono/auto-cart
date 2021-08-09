import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';

dotenv.config()

const sendEmail = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"AUTOCART ALERT" <${process.env.EMAIL}>`, // sender address
    to: "szboylbd@hotmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  }, (err) => {
    if (err) {
      console.log('err: ', err)
    } else {
      console.log('sent!')
    }
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  console.log('go to the page')
  await page.goto('https://www.bestbuy.ca/en-ca/product/playstation-5-dualsense-wireless-controller-charging-station/14962276', { waitUntil: 'networkidle2' });

  const [button] = await page.$x("//button[contains(., 'Add to Cart')][@disabled]");

  

  if (!button) {
    const [activeButton] = await page.$x("//button[contains(., 'Add to Cart')]");
    if (activeButton) {
      sendEmail()
      console.log('BUY IT NOW!!!')
    }
  } else {
    console.log('button not enabled')
  }

  await browser.close();
})();