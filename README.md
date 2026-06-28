# FateBook

FateBook is a Next.js application created with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Repository: [https://github.com/SandyGraham23/FateBook.git](https://github.com/SandyGraham23/FateBook.git)

## Overview

FateBook is built on the Next.js App Router structure.

The project is ready for local development and can be extended by editing the application files in the `app` directory.

The default entry page can be found at:

```txt
app/page.tsx
```

Changes made during development are reflected in the browser automatically.

## Features

- Built with [Next.js](https://nextjs.org)
- Created using `create-next-app`
- Uses the App Router project structure
- Supports local development with hot reloading
- Uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- Includes the [Geist](https://vercel.com/font) font family through Next.js font optimization

## Requirements

Before running the project, make sure you have a JavaScript package manager installed.

Common options include:

- npm
- Yarn
- pnpm
- Bun

You will also need a compatible Node.js environment for running a Next.js application.

## Getting Started

Clone the repository:

```bash
git clone https://github.com/SandyGraham23/FateBook.git
```

Move into the project directory:

```bash
cd FateBook
```

Install dependencies:

```bash
npm install
```

If you use a different package manager, install dependencies with the equivalent command for your environment.

## Running the Development Server

Start the development server with one of the following commands:

```bash
npm run dev
```

```bash
yarn dev
```

```bash
pnpm dev
```

```bash
bun dev
```

After the server starts, open the application in your browser:

[http://localhost:3000](http://localhost:3000)

## Editing the Application

To begin making changes, edit:

```txt
app/page.tsx
```

The page will update as you save changes while the development server is running.

Additional routes and UI can be added using the standard Next.js App Router conventions.

## Project Structure

A typical Next.js application created with `create-next-app` includes files and directories such as:

```txt
app/
public/
package.json
next.config.*
tsconfig.json
```

The exact structure may change as the project grows.

Use the `app` directory for application routes, layouts, and pages.

Use the `public` directory for static assets.

## Fonts

This project uses `next/font` to optimize and load Geist.

Next.js handles font optimization as part of the application build process.

## Build

To create a production build, run:

```bash
npm run build
```

If you use another package manager, use its equivalent build command.

## Start

After building the project, you can start the production server with:

```bash
npm run start
