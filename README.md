# ChatGPT Server

This is a simple Express.js server that acts as an interface for the OpenAI ChatGPT API. The server allows users to send messages and receive responses from the ChatGPT model using a queue system to manage requests efficiently.

## Features

- **Message Queue**: Utilizes Bull for rate-limiting API calls to avoid exceeding OpenAI's rate limits.
- **REST API**: Exposes an endpoint to interact with the ChatGPT model.
- **Basic Frontend**: Includes a simple HTML page to send messages and display responses.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (Node Package Manager)
- OpenAI API Key (You can get one by signing up at [OpenAI](https://beta.openai.com/signup/))

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
