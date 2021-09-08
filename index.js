import TelegramBot from "node-telegram-bot-api";
import Web3 from "web3";
import { WETH } from "./WETH.js";

import dotenv from "dotenv";
dotenv.config();

console.log(process.env);
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const TOKEN = process.env["TG_TOKEN"];
const CHAT_ID = process.env["CHAT_ID"];
const PROVIDER = new Web3.providers.HttpProvider(
  `https://mainnet.infura.io/v3/${process.env["INFURA_ID"]}`
);

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TOKEN, { polling: false });

const web3 = new Web3(PROVIDER);
const contract = new web3.eth.Contract(WETH, WETH_ADDRESS);

contract
  .getPastEvents("Transfer", { fromBlock: "latest", toBlock: "latest" })
  .then((ev) => {
    const data = ev[0].returnValues;
    const amount = (Number(data.wad) / 10 ** 18).toString().replace(".", "\\.");

    const message =
      "*" +
      data.src +
      "* sent *" +
      amount +
      " WETH* to *" +
      data.dst +
      "* in transaction [" +
      ev[0].transactionHash +
      `](https://etherscan\\.io/tx/${ev[0].transactionHash})`;
    bot
      .sendMessage(CHAT_ID, message, {
        parse_mode: "MarkdownV2",
      })
      .then((msg) => {
        console.log(msg);
        console.log("Message sent!");
      })
      .catch((e) => {
        console.log(
          "Error while sending message: ",
          e.response.body.description
        );
        console.log("Body sent: ", e.response.request.body);
      });
  })
  .catch((e) => {
    console.log("Error in getting Event data: ", e);
  });
