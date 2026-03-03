# NotebookAI - Personal Research Assistant

NotebookAI is a "Minimum Viable Product" (MVP) for a personal research assistant, inspired by Google NotebookLM. It allows you to upload sources (PDFs, links, YouTube videos) and interact with them using grounded AI.

## 🛠️ Features

- **Source Grounding**: Upload up to 50 sources. The AI treats these as the "absolute truth."
- **Instant Summaries**: Automatic overview of every added file.
- **Grounded Chat**: Ask questions and get answers based ONLY on your sources.
- **Notebook Guide**: Automatically generated FAQs, Timelines, and Table of Contents.
- **Audio Overviews**: Turn your notes into a 2-host AI podcast.
- **Interactive Mind Map**: Visualize connections between your sources and key concepts.

## 🚀 Getting Started (Local Installation)

To run this app on your local machine (e.g., Kali Linux):

1. **Clone the repository**:
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd notebook-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open in your browser**:
   Navigate to `http://localhost:3000`.

## 📋 Technology Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons, Framer Motion
- **AI**: Google Gemini API (@google/genai)
- **Visualization**: D3.js
- **Markdown**: React Markdown

## 🎙️ The "Wow" Factor

- **Audio Overviews**: Uses Gemini 2.5 Flash TTS with multi-speaker support to simulate a podcast.
- **Mind Map**: Dynamic force-directed graph showing how your documents connect.

---
*Built with Google AI Studio*
