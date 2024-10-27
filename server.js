// server.js
const express = require('express');
const axios = require('axios');
const Bull = require('bull');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Queue setup
const chatQueue = new Bull('chatQueue', {
  limiter: {
    max: 1,  // Allow 1 request at a time
    duration: 5000,  // 5 seconds delay between requests
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

// Handle GET requests to the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the ChatGPT Server! Use POST /askChatGPT to ask questions.');
});

// Endpoint to handle ChatGPT requests
app.post('/askChatGPT', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Add job to the queue
        const job = await chatQueue.add({ message });

        // Wait for the job to be completed and get the result
        job.finished().then((result) => {
            return res.json(result);
        }).catch((error) => {
            console.error('Job processing error:', error);
            return res.status(500).json({ error: 'An error occurred while processing your request.' });
        });
    } catch (error) {
        console.error('Queue error:', error);
        return res.status(500).json({ error: 'An error occurred while adding your request to the queue.' });
    }
});

// Process the queue jobs
chatQueue.process(async (job) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: job.data.message }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { reply: response.data.choices[0].message.content };
  } catch (error) {
    if (error.response && error.response.status === 429) {
      return { reply: 'Too many requests. Please try again later.' };
    }
    return { reply: 'An error occurred while connecting to the API.' };
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});







// co-pilot code
// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');

// const app = express();
// const port = 3000;

// app.use(bodyParser.json());

// app.post('/chat', async (req, res) => {
//     const userMessage = req.body.message;

//     try {
//         const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
//             prompt: userMessage,
//             max_tokens: 150,
//             n: 1,
//             stop: null,
//             temperature: 0.7,
//         }, {
//             headers: {
//                 'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         const botMessage = response.data.choices[0].text.trim();
//         res.json({ message: botMessage });
//     } catch (error) {
//         console.error('Error communicating with OpenAI:', error);
//         res.status(500).json({ error: 'Error communicating with OpenAI' });
//     }
// });

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });