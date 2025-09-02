# 🕐 Viventiva

_Remember to Live - A Tool for Conscious Time_

A philosophical React application that transforms your finite weeks into a canvas for intentional living. More than a time tracker, this is an instrument for examining the fundamental questions of human existence within the bounds of mortality.

## ✨ Features

- **Life Visualization**: See your entire life mapped out as a grid where each square represents one week
- **Milestone Tracking**: Add and categorize important life events with rich details
- **Color Coding**: Paint weeks with different colors to visualize life patterns and phases
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Data Persistence**: Your life data is safely stored locally in your browser
- **Export/Import**: Backup and restore your data with JSON export/import functionality
- **Theme Support**: Clean, modern interface with thoughtful design

## 🏷️ Categories

- 🩷 **Personal** - Life events, relationships, personal growth
- 💼 **Career** - Jobs, promotions, professional milestones
- 🎓 **Education** - Schools, degrees, learning achievements
- 🏠 **Family** - Family events, marriages, children
- 🎯 **Goals** - Future aspirations and planned objectives
- ⭐ **Achievements** - Completed goals and major accomplishments

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 18 or higher recommended)
- **npm** or **yarn** package manager

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd 25-MyLife
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage

1. **Setup**: Enter your birth date and life expectancy
2. **Visualization**: View your life as a grid where each square represents one week
3. **Milestones**: Click on any week to add milestones or life events
4. **Color Coding**: Select a color and paint weeks to categorize them
5. **Navigation**: Use the year controls to navigate through different life periods

## 📁 Project Structure

```
src/
├── components/
│   ├── MainApp.jsx          # Main application component with week grid
│   ├── SetupPage.jsx        # Initial user setup and onboarding
│   ├── SettingsPage.jsx     # Settings and data management
│   ├── WeekBox.jsx          # Individual week square component
│   └── MilestonePanel.jsx   # Milestone creation and editing panel
├── utils/
│   ├── constants.js         # App constants, categories, and defaults
│   ├── dateUtils.js         # Date calculations and week utilities
│   ├── storageUtils.js      # Local storage management
│   └── themeUtils.js        # Theme and styling utilities
├── App.jsx                  # Root component and routing
├── main.jsx                 # Application entry point
└── index.css                # Global styles and Tailwind imports
```

## 📜 Available Scripts

| Command            | Description                                       |
| ------------------ | ------------------------------------------------- |
| `npm run dev`      | Start development server on http://localhost:5173 |
| `npm run build`    | Build optimized production bundle                 |
| `npm run preview`  | Preview production build locally                  |
| `npm run lint`     | Run ESLint code analysis                          |
| `npm run lint:fix` | Automatically fix ESLint issues                   |

## 🛠️ Technologies Used

- **React 18.3** - Modern React with hooks and concurrent features
- **Vite 6.0** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable SVG icons
- **PostCSS** - CSS processing and optimization
- **ESLint 9** - Code linting and quality assurance

## 🌐 Browser Support

This application supports all modern browsers with ES2020+ support:

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

## 💾 Data Storage

Your life data is stored locally in your browser using localStorage. This means:

- ✅ Your data stays private and never leaves your device
- ✅ No account registration or login required
- ⚠️ Remember to export your data regularly as backups
- ⚠️ Clearing browser data will remove your life timeline

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

**Start visualizing your life today and gain a new perspective on your time!** ⏰
