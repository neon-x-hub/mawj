# 🌊 Mawj (موج) — Bulk Content Creation Tool – ***v0.3.1***

**Create stunning cards, videos and booklets at scale with blazing speed and ease.**

---

## Table of Contents

- [🌊 Mawj (موج) — Bulk Content Creation Tool – ***v0.3.1***](#-mawj-موج--bulk-content-creation-tool--v031)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Installation](#installation)
    - [**Option 1: Install via Pre-Packaged Installer**](#option-1-install-via-pre-packaged-installer)
    - [**Option 2: Build from Source (Requires Node.js)**](#option-2-build-from-source-requires-nodejs)
      - [**Prerequisites**](#prerequisites)
      - [**Steps to Install and Run**](#steps-to-install-and-run)
    - [Future Plans](#future-plans)
  - [Usage](#usage)
  - [Configuration](#configuration)
  - [Import \& Export](#import--export)
  - [Security and Vulnerability Checks](#security-and-vulnerability-checks)
  - [Performance](#performance)
  - [Installers](#installers)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

---

## Introduction

**Mawj** (موج), meaning "waves" in Arabic, is an open-source bulk content creation tool designed primarily for Arabic speakers, with a special focus on Dawah content creators. It addresses the unique needs of producing large volumes of templated content — such as series of cards, videos, and other media — often used in Dawah and related fields.

By combining a simple yet powerful template-based system with support for CSV and JSON data uploads, Mawj enables creators to generate personalized, high-quality content quickly and efficiently. Its dynamic text sizing, automatic font detection (including Arabic fonts), and GPU-accelerated rendering make it a perfect fit for producing beautiful and meaningful media in the Arabic language.

Whether you are designing educational series, social campaigns, or inspirational messages, Mawj empowers you to create content at scale with minimal effort, helping you spread your message with impact and speed.

---

## Features

- **Template-Based Content Creation**
  Design reusable templates with customizable placeholders to produce consistent and professional-looking cards and videos. This approach is ideal for Dawah series, campaigns, or any repeated messaging that benefits from a uniform style.

- **Bulk Data Upload with CSV and JSON Support**
  Upload your datasets in CSV or JSON format to generate large batches of content automatically. Whether you have a list of verses, quotes, or names, Mawj dynamically merges your data into templates to create personalized outputs effortlessly.

- **Integrated and User-Friendly Image Template Editor**
  Create and edit image templates directly within Mawj using an intuitive editor designed for simplicity and flexibility. Customize text positions, images, colors, and more, without needing external design software.

- **Blazing Fast Rendering Performance**
  Generate 100 JPG images in just 8 seconds and produce a 12-minute video in only 1.2 minutes. This speed empowers you to create large volumes of content quickly, saving valuable time in your projects.

- **Advanced Video and Image Output Settings**
  Control output formats, codecs, bitrates, and leverage GPU acceleration for faster rendering. This ensures your videos and images meet your desired quality and compatibility standards.

- **Powerful Data Management and Search**
  Organize your data with project folders and search through datasets using regular expressions (regex). This gives you precise control over what content to generate and easy access to your stored data.

- **Dynamic Text Sizing for Beautiful Results**
  Automatically adjusts text size to perfectly fit containers, handling different text lengths gracefully. This ensures your templates remain visually balanced and professional, regardless of variable content.

- **Automatic Font Recognition and Usage**
  Mawj detects and utilizes fonts installed on your machine — including Arabic and custom fonts — so you can maintain brand consistency and beautiful typography without manual font setup.

- **Robust Import/Export System**
  Export entire projects with templates, data, and generated outputs to share or backup. Import projects safely with a smart scanning system that detects vulnerabilities, allowing you to selectively keep templates or data without risking your setup.

- **Cross-Project Template Reuse and Project Organization**
  Use templates across multiple projects and organize your work with folders, making it easy to manage large volumes of content and collaborate across campaigns.

- **OS-Level Control from the Browser**
  Even though Mawj runs in the browser, it can interact with your operating system in powerful ways — such as opening generated files with your system’s default viewers or instantly navigating to output folders.

- **Network Audio Retrieval and Trimming**
  For video creation, Mawj can fetch audio directly from the network and trim it into specific segments. This allows you to create multiple videos from a single audio source, each using a different portion of the track.

---

Mawj combines simplicity, power, and speed to serve the needs of Dawah content creators and Arabic-speaking communities seeking to create impactful, high-quality media at scale.

Here’s an updated version of your installation documentation, structured to **guide users depending on whether they want to install using a pre-packaged installer or build from source with Node.js**:

---

## Installation

Mawj is a local-host web application built with Next.js, designed to run on your own machine. There are two ways to get started:

1. **Use the pre-packaged installer** (recommended for most users).
2. **Build the project from source** if you already have Node.js installed.

---

### **Option 1: Install via Pre-Packaged Installer**

If you just want to get Mawj running quickly:

1. Go to the [Installers By Version](#installers)
2. Select the installer corresponding to your operating system and version.
3. After extaction, you will find two files: `setup.bat` and `runner.bat`.
4. First, you would run `setup.bat` to check and install requirements.
5. After, setup is complete, you can run Mawj by double-clicking on `runner.bat`.
6. Lastely, you just open your browser on `http://localhost:3000` and start working.

> ⚠️ The installer includes a compatible Node.js version, so you don’t need to install Node.js manually.
>     However, for video creation, you still need to install Ffmpeg separately.

---

### **Option 2: Build from Source (Requires Node.js)**

If you already have **Node.js installed** and want to build Mawj from source:

#### **Prerequisites**

* **Node.js** (version 16 or higher recommended)
  Mawj requires Node.js to run the development server and build the project. Download it from [nodejs.org](https://nodejs.org/).

* **FFmpeg** (for video creation)
  To enable video rendering capabilities, install FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html).
  *Currently, Mawj officially supports Windows only.*

---

#### **Steps to Install and Run**

1. **Clone the repository**

```bash
git clone https://github.com/neon-x-hub/mawj.git
cd mawj
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to start using Mawj.

4. **Build for production** (optional)

```bash
npm run build
npm run start
```

---

**Notes:**

* For **quick setup**, the pre-packaged installer is the easiest way.
* If you already have Node.js and want **full control**, building from source is recommended.

---

### Future Plans

* Simplified one-click installers for end users **(very soon)**.
* Cross-platform support including Linux and macOS.
* Automated build scripts to streamline setup and updates.

---

If you encounter any issues with installation or setup, please check the [Issues](https://github.com/neon-x-hub/mawj/issues) page or contact the maintainer.

---

## Usage

## Configuration

[~ Video Tutorial Coming Soon ~]

---

## Import & Export

Mawj provides a robust system for importing and exporting projects, designed to help you manage your work efficiently and securely.

- **Export Your Projects**
  Easily export entire projects including templates, datasets, and generated outputs. This allows you to back up your work or share it with collaborators while preserving all necessary assets and configurations.

- **Import Projects Safely**
  When importing projects from a ZIP archive, Mawj performs a smart vulnerability scan to detect any potentially malicious files or unsafe content. You can then choose exactly which parts to keep—whether templates, datasets, or outputs—ensuring your workspace remains secure and clean.

- **Selective Importing**
  If you receive a full project with outputs you don’t need, Mawj lets you import only the templates and accompanying data, helping keep your environment lean and focused.

This import/export system makes it easy to reuse templates across multiple projects and collaborate without worrying about security risks or unnecessary clutter.

---

## Security and Vulnerability Checks

Mawj takes the security of your projects seriously by offering smart scanning and reporting features when importing files:

- **Decompression Size Alert**
  Before fully importing a project archive, Mawj shows you the total size after decompression. This helps you decide if you want to proceed, avoiding unexpectedly large or resource-heavy imports.

- **File Type Inspection and Reporting**
  Mawj analyzes the contents of imported files and generates a report highlighting any suspicious or unexpected file types that typically should not be part of a Mawj project export. This feature helps you detect potential malicious intent hidden inside project archives.

- **User Discretion and Best Practices**
  Despite these automated scans, Mawj strongly recommends only importing projects from trusted sources. Always use proper antivirus software and practice safe handling of files from unknown or unverified origins.

This layered approach to security helps keep your workspace safe while allowing flexibility in importing and collaborating on projects.

---

## Performance

Mawj is designed for speed, making large-scale content creation fast and efficient without compromising quality.

- **Image Rendering Speed**
  Generate **100 JPG images in just 8 seconds**, thanks to optimized rendering pipelines and template caching.

- **Video Rendering Speed**
  A **12-minute video can be produced in around 1.2 minutes**, significantly reducing production time compared to traditional tools.

- **GPU Acceleration**
  Mawj supports GPU-accelerated rendering for even faster performance. Currently, GPU support is available only for **NVIDIA graphics cards**.
  To enable GPU acceleration:
  1. Ensure you have a compatible NVIDIA GPU.
  2. Install the latest NVIDIA drivers for your system.
  3. Enable GPU mode in Mawj’s rendering settings.

- **Optimized Output Configuration**
  Mawj includes helpful tips throughout the interface to guide you in choosing the optimal file formats, codecs, and bitrates for your use case. This ensures the best balance between speed, quality, and file size.

By combining efficient algorithms with GPU acceleration, Mawj delivers unmatched performance for bulk content creation workflows.

---

## Installers

Choose an installer based on the version you want and on you OS:

Version 0.2.0:
- Windows 10/11 x64 | [Installer](https://t.me/mirath_unnubuwa/397)


---

## Contributing

Mawj is an open-source project, and contributions are welcome from anyone who wishes to improve it.
You can help by:
- Reporting bugs and suggesting features.
- Submitting pull requests for code enhancements.
- Improving documentation or adding tutorials.

Please ensure that your contributions align with the project’s values and intended use.

---

## License

Mawj is offered as a free and open-source tool, released **for the sake of Allah** to support creative and beneficial work.
You are free to use, modify, and distribute it under the following condition:

> **Your usage must not violate Islamic law (Shari’ah) as derived from the Qur’an and the authentic Sunnah of the Prophet Muhammad ﷺ.**

Any use of Mawj for purposes prohibited in Islam is not permitted.
By using this software, you acknowledge your responsibility to ensure that your work with Mawj complies with these guidelines.

---

*"And cooperate in righteousness and piety, but do not cooperate in sin and aggression."* — Qur’an 5:2

---

## Contact

If you have questions, suggestions, or want to collaborate, you can reach me at:

- **GitHub Issues:** [Submit an issue](https://github.com/neon-x-hub/mawj/issues)
- **GitHub Profile:** [@neon-x-hub](https://github.com/neon-x-hub)
- **Telegram:** [@abderrahmane_m](https://t.me/abderrahmane_m)
