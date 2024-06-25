const { Telegraf } = require('telegraf');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const token = process.env.TELEGRAM_BOT_KEY;
const domain = process.env.domain;  // Your online hosted domain

const bot = new Telegraf(token);

// Middleware to parse the body
app.use(bot.webhookCallback(`/bot${token}`));

// Set the webhook
bot.telegram.setWebhook(`${domain}/bot${token}`).catch((error) => {
  console.error('Error setting webhook:', error);
});

// Webhook handler
app.post(`/bot${token}`, (req, res) => {
  bot.handleUpdate(req.body)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error handling update:', error);
      res.sendStatus(500);
    });
});

// Define the root endpoint for health checks
app.get('/', (req, res) => {
  res.status(200).send('Bot is running.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at ${domain}:${port}`);
});

// Bot commands and handlers
bot.start((ctx) => {
  ctx.reply('Welcome! Enter a City to explore 🏭');
  console.log(ctx.message);
});

bot.on('message', async (ctx) => {
  const userInput = ctx.message.text;

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${userInput}&appid=${process.env.WEATHER_API_KEY}`
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
    console.error('Error fetching weather data:', error);
  }
});

bot.launch();
