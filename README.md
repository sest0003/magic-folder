# Magic Folder

A web application that helps you organize and manage your files with AI assistance.

## Description

Magic Folder is a React-based web application that provides an intelligent file management system. It uses AI to help users organize, categorize, and manage their files more efficiently.

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```
git clone https://github.com/sest0003/magic-folder.git
cd magic-folder
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
OPENAI_API_KEY=your_api_key_here
PORT=3001
```

## Running the Application

1. Start the server:
```
node server.js
```

2. In a new terminal, start the React development server:
```
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Features

- AI-powered file organization
- Real-time file monitoring
- Automatic file categorization
- User-friendly interface

## Technologies Used

- React
- Node.js
- Express
- OpenAI API
- WebSocket
- Chokidar

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

ISC