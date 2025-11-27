# AgentOps Dashboard (Frontend)

The modern, responsive frontend for **AgentOps**, built to manage AI Workflows and monitor executions in real-time.

This application provides a clean UI to build workflows, configure AI agents, and visualize the chaining process where the output of one AI becomes the input for the next.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)

## ✨ Features
- **Interactive Workflow Builder**: Create and edit workflows with an intuitive UI.
- **Agent Configuration**: Customize AI models, prompts, and creativity (temperature) using sliders and forms.
- **Real-time Monitoring**: Watch the execution status of each agent step (Pending -> Running -> Completed) via polling.
- **Responsive Design**: Built with Tailwind CSS for a clean, mobile-friendly look.
- **Feedback System**: Integrated Toasts and Alerts for better user experience using Shadcn UI.

## 🛠 Tech Stack
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI (Radix Primitives)
- **State/Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios (with Interceptors for JWT)
- **Routing**: React Router DOM
- **Icons**: Lucide React

## ✅ Prerequisites
- Node.js (v18 or later)
- The **AgentOps Controller** (Backend) must be running on port 3000 (or as configured).

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentops_website
  
2. **Install the dependencies:**

    ```bash
    npm install
    ```

3.  **Create a `.env` file from the example:**

    ```bash
    cp .env.example .env
    ```

4.  **Set the API URL in your new `.env` file**:

    ```
    VITE_API_URL='https://cyberfeed-controller.vercel.app'
    ```

---

## Available Scripts

* **To run the app in development mode:**
    Open your browser to `http://localhost:5173`

    ```bash
    npm run dev
    ```

* **To build the app for production:**

    ```bash
    npm run build
    ```

* **To lint the project files:**

    ```bash
    npm run lint
    ```