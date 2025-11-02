## 🚀 Getting Started

Mawj is designed to be simple to set up — especially if you’re comfortable with the command line.
You’ll be up and running in just a few steps.

## 🧰 Requirements

Before you begin, make sure you have the following installed:

Node.js (v18 or later)
👉 [Download from nodejs.org](https://nodejs.org/en/blog/release/v20.9.0)

FFmpeg (optional, but required for video rendering)
👉 [Download from ffmpeg.org for Windows](https://www.ffmpeg.org/download.html#build-windows)

If you struggled with installing ffmpeg, you can follow this 2min YouTube video:
[How to install ffmpeg easily?](https://www.youtube.com/watch?v=K7znsMo_48I)



---

## ⚙️ Installation

Once your environment is ready:
```bash
git clone https://github.com/neon-x-hub/mawj.git
cd mawj
npm install
```

if you don't have git or you don't want to use it, you can simply download the code base from https://github.com/neon-x-hub/mawj as a zip file. Then simply run in the directory of the code:
```bash
npm install
```

---

## ▶️ Running Mawj

To start the development server (recommended for most cases):
```bash
npm run dev
```

The development mode is usually more stable and easier to debug.
It also provides live reloading and better error feedback.

When you’re ready for production builds, you can use:
```bash
npm run build
npm start
```

---

💡 Tip

If you plan to render videos frequently, ensure FFmpeg is properly added to your system PATH — Mawj depends on it for video encoding.

💡 Tip

If you are lazy like me and don't want to open terminal each time just to write npm run dev, here is a simple bat file i use frequently to launch mawj

```bat
:: Here enter your path to the directory where the code base lives
@echo off
cd /d "C:\Users\ASUS\Desktop\prog\mawj"

start cmd /k "npm run dev"

timeout /t 5 >nul

:: This starts chrome tab for you directly
start chrome http://localhost:3000
```

## Next
- [configuration](./configuration.md)

## Previous
- [Introduction](./index.md)
