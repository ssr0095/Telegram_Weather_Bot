const { Telegraf } = require('telegraf');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.redirect('https://t.me/weatherBoy101Bot');
})

app.listen(port, () => {
  console.log(`server at http://localhost: ${port}`);
})

const bot = new Telegraf(process.env.TELEGRAM_BOT_KEY);

const websiteUrl = process.env.DOMAIN;

bot.start(async (msg) => {
  try {
    const response = await axios.get(websiteUrl);
    if (response.status === 200) {
      msg.reply('Welcome! Enter a City to explore 🏭');
    } else {
      msg.reply('Failed! Try again later.');
    }
  } catch (error) {
    msg.reply('Error while trying to wake up the website.');
    console.error(error);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at ${domain}:${port}`);
});

// Bot commands and handlers
bot.start((ctx) => {
  ctx.reply('Welcome! Enter a City to explore 🏭');
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
    // console.error('Error fetching weather data:', error);
  }
});

bot.launch();
