const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Set up environment variables (for safety, don't hardcode your tokens)
const token = process.env.TELEGRAM_BOT_TOKEN;
const domain = process.env.domain;
const port = process.env.PORT || 4000;

const bot = new Telegraf(token);

// Middleware to parse the body
app.use(bodyParser.json());

// Set webhook for the bot
bot.telegram.setWebhook(`${domain}/bot${token}`);

// Webhook handler
app.post(`/bot${token}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Define the root endpoint for health checks
app.get('/', (req, res) => {
  res.status(200).send('Bot is running.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Bot commands and handlers
bot.start((ctx) => {
  ctx.reply('Welcome! Enter a City to explore 🏭');
  console.log(ctx.message);
});

bot.hears('hii', (ctx) => {
  ctx.reply('Welcome! Enter a City to explore 🏭');
  console.log(ctx.message.text);
});

bot.on('message', async (ctx) => {
  const userInput = ctx.message.text;

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${userInput}&appid=${process.env.WEATHER_API}`
    );
    const data = response.data;
    const weather = data.weather[0].description;
    const temperature = data.main.temp - 273.15;
    const city = data.name;
    const humidity = data.main.humidity;
    const pressure = data.main.pressure;
    const windSpeed = data.wind.speed;
    const message = `The weather in ${city} is ${weather} with a temperature of ${temperature.toFixed(2)}°C. The humidity is ${humidity}%, the pressure is ${pressure}hPa, and the wind speed is ${windSpeed}m/s.`;

    ctx.reply(message);
  } catch (error) {
    ctx.reply("City doesn't exist.");
  }
});

bot.launch({
  webhook: {
    domain: domain,
    port: port
  }
});
