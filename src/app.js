import got from "got";
import { load } from "cheerio";
import express from "express";
import { getScrapUrl } from "./utils/index.js";
import { Decimal } from "decimal.js";

function setupBodyParser(e) {
  return e.use(express.json()).use(express.urlencoded({ extended: true }));
}

function setupRoutes(e) {
  e.get("/", (_req, res) => {
    res.json({ message: "Ok!" });
  });

  e.post("/webhooks", async (req, res) => {
    const telegramReq = req.body.message;
    const chatId = telegramReq.chat.id;
    const text = telegramReq.text;

    if (isNaN(text)) {
      res.json({ message: "Success!" });
      return;
    }

    const resp = await got.get(getScrapUrl()).text();

    const $ = load(resp);
    const dollarToYen = $('td:contains("JPY")')
      .parent()
      .children("td")
      .eq(2)
      .text();

    const dollarToBaht = $('td:contains("THB")')
      .parent()
      .children("td")
      .eq(4)
      .text();

    if (isNaN(dollarToBaht) || isNaN(dollarToYen)) return;

    const rate = new Decimal((+dollarToBaht).toFixed(2)).div(
      new Decimal((+dollarToYen).toFixed(2))
    );
    const baht = rate.mul(new Decimal(text));
    const fee = baht.mul(new Decimal(0.02));
    const total = baht.add(fee);

    await got.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        json: {
          chat_id: chatId,
          text: `${total.toFixed(2)} บาท`,
        },
      }
    );

    res.json({ message: "Success!" });
  });

  return e;
}

export const app = [setupBodyParser, setupRoutes].reduce(
  (e, middleware) => middleware(e),
  express()
);
