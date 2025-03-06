# Smart Todo App

A modern todo application with natural language command capabilities built with Next.js, TypeScript, MongoDB, and Zod.

## Features

- Add, update, delete, and mark todos as complete/incomplete through the UI
- Use natural language commands to manage your todos
- MongoDB database for persistent storage
- TypeScript and Zod for type safety and validation

## Natural Language Commands

The app supports various natural language commands, such as:

- **Add a todo**: `Add a todo buy groceries`
- **Mark as done**: `Mark buy groceries as done`
- **Mark as undone**: `Mark buy groceries as not done`
- **Delete a todo**: `Delete buy groceries`
- **Clear all todos**: `Clear the todo list` or `Reset the todo`
- **Mark multiple todos**: `Mark the first todo as done` or `Mark the last 3 todos as done`

The app uses fuzzy matching to find the closest matching todo when you use commands.

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file based on `.env.example` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/todo-app
   ```

### Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Language**: TypeScript

## Project Structure

- `/src/app` - Next.js app router
- `/src/components` - React components
- `/src/lib` - Utility functions and database models
- `/src/app/api` - API routes for CRUD operations

## License

MIT
