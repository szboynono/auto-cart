import dotenv from "dotenv";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import schedule from "node-schedule";

const delay = (time) => {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

dotenv.config();

const sendEmail = async (html: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  await transporter.sendMail(
    {
      from: `"AUTOCART ALERT" <${process.env.EMAIL}>`, // sender address
      to: "feilinfu729@gmail.com", // list of receivers
      subject: "We got a hit ✔", // Subject line
      html, // html body
    },
    (err) => {
      if (err) {
        console.log("err: ", err);
      } else {
        console.log("sent!");
      }
    }
  );
};

const run = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  console.log("go to the page");
  await page.goto(
    "https://www.hermes.com/ca/en/category/women/bags-and-small-leather-goods/bags-and-clutches/#|",
    { waitUntil: "networkidle2" }
  );
  await delay(1000);
  const bagsRef = await page.$$(".product-item-name");
  const bags = await Promise.all(
    bagsRef.map((elRef) =>
      page.evaluate((element) => element.textContent, elRef)
    )
  );
  console.log('bags', bags);
  const wishList = ["Lindy", "Trim", "Medor"];
  const hitList = [];
  wishList.forEach((name: string) => {
    bags.forEach((bag: string) => {
      if (bag.toLowerCase().includes(name.toLowerCase())) {
        hitList.push(bag);
      }
    });
  });
  await browser.close();
  if (!hitList) return;
  console.log('HIT!', hitList);
  // write up the email
  const contentArr = [`<h1>Hit! These bags are ready!</h1><a href="https://www.hermes.com/ca/en/category/women/bags-and-small-leather-goods/bags-and-clutches/#|">Get it here!</a>`];
  hitList.forEach((el) => {
    contentArr.push(`<p>${el}</p>`);
  });
  // sendEmail(contentArr.join(''));
};

schedule.scheduleJob("*/30 * * * *", () => run());
