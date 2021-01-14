require("dotenv").config();
const { JSDOM } = require("jsdom");
const fetch = require("node-fetch");
const { Webhook, MessageBuilder } = require("discord-webhook-node");
const webhook = new Webhook(process.env.WEBHOOK_URL);

async function getLatestVersion() {
  const response = await fetch(process.env.PAGE_URL);
  const text = await response.text();
  const dom = await new JSDOM(text);
  const element = dom.window.document.querySelector(process.env.QUERY_SELECTOR);

  return element.textContent.replace(/\s/g, "");
}

let shouldCheck = true;
setInterval(async () => {
  if (!shouldCheck) {
    return;
  }

  const latestVersion = await getLatestVersion();
  if (latestVersion == process.env.INSTALLED_VERSION) {
    return;
  }

  const embed = new MessageBuilder()
  .setTitle("BIOS Update available!")
  .setURL(process.env.PAGE_URL)
  .setThumbnail(process.env.WEBHOOK_THUMBNAIL)
  .addField("Installed version", process.env.INSTALLED_VERSION, true)
  .addField("New version", latestVersion, true)
  .setColor('#00b0f4')
  .setTimestamp();

  await webhook.send(`<@${process.env.OWNER_ID}>`);
  await webhook.send(embed);
  shouldCheck = false;
}, process.env.CHECK_INTERVAL);
