# 📊 Application Architecture Diagram

## 🎯 Project Overview

This TypeScript-powered Astro application creates interactive architecture diagrams showing relationships between frontend pages and backend API servers. Features include advanced card interactions, zoom/pan capabilities, dynamic SVG connections, and real-time relationship visualization based on configurable API mappings.

## 🚀 Quick Start

```bash
# ติดตั้ง dependencies
npm install

# เริ่ม development server
npm run dev

# Build สำหรับ production
npm run build

# Preview production build
npm run preview
```

## 🌟 Key Features

- **📱 Interactive Cards** - Hover to see relationships and strategic card movement
- **🔗 Dynamic SVG Connections** - Visual API relationship lines with method-specific colors
- **🎯 Smart Positioning** - Cards move strategically while dimming unrelated elements
- **🔍 Zoom & Pan** - Mouse/touch controls with focal point preservation and keyboard shortcuts
- **📊 Configuration-Driven** - Relationships defined through JSON data files
- **🎨 Smooth Animations** - Hardware-accelerated CSS transforms and transitions
- **📱 Mobile Responsive** - Touch gestures and adaptive layouts
- **🎯 TypeScript** - Type-safe development with comprehensive interfaces
- **🧪 Tested** - Comprehensive test suite with Vitest

## 🏗️ Project Structure

```
app-diagram/
├── 📁 src/
│   ├── 📁 components/           # Astro components (ArchitectureDiagram, Cards, etc.)
│   ├── 📁 data/                # JSON configuration (pages.json, servers.json)
│   ├── 📁 layouts/             # Page layout templates
│   ├── 📁 pages/               # Astro route pages
│   ├── 📁 scripts/             # TypeScript modules (compiled to public/)
│   │   ├── 📁 components/       # Component-specific logic
│   │   └── 📁 shared/          # Shared utilities and managers
│   ├── 📁 styles/              # Modular CSS architecture
│   │   ├── base.css            # Global styles and Tailwind
│   │   ├── animations.css      # Animation definitions
│   │   ├── cards.css          # Card component styles
│   │   ├── components.css     # Reusable component styles
│   │   ├── connections.css    # SVG connection styles
│   │   └── layout.css         # Layout and responsive utilities
│   └── 📁 types/               # TypeScript type definitions
├── 📁 public/                   # Static assets and compiled scripts
├── 📁 tests/                   # Vitest test suite
├── 📁 docs/                    # Comprehensive documentation
└── 📄 Configuration files      # TypeScript, Astro, Tailwind configs
```

## 📚 Documentation

### 📖 Complete Guides
- **🚀 [Setup Guide](./docs/SETUP.md)** - Installation, configuration, and development setup
- **🏛️ [Architecture](./docs/ARCHITECTURE.md)** - Technical architecture and design patterns
- **🔧 [API Reference](./docs/API_REFERENCE.md)** - TypeScript modules and API documentation
- **🛠️ [Development](./docs/DEVELOPMENT.md)** - Development workflow and best practices
- **🔧 [Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and debugging guide

### 🎯 Quick Navigation
- **New to the project?** Start with [Setup Guide](./docs/SETUP.md)
- **Need to debug?** Check [Troubleshooting](./docs/TROUBLESHOOTING.md)
- **Understanding the code?** Read [Architecture](./docs/ARCHITECTURE.md)
- **Building features?** Follow [Development](./docs/DEVELOPMENT.md)
- **API integration?** Use [API Reference](./docs/API_REFERENCE.md)

## 🔧 Technical Stack

- **⚡ Astro 4.x** - Modern static site generator with component islands
- **🔄 TypeScript** - Full type safety with comprehensive interfaces and ES Modules
- **🎨 Tailwind CSS** - Utility-first CSS framework with modular architecture
- **📱 Responsive Design** - Mobile-first with touch gesture support
- **🎯 SVG Graphics** - Vector-based connection lines and interactive elements
- **🧪 Vitest** - Modern testing framework with comprehensive coverage
- **📊 JSON Configuration** - Data-driven relationships and content

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the [Development Guide](./docs/DEVELOPMENT.md)
4. Test thoroughly
5. Update documentation if needed
6. Submit Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

### Getting Help
1. Check the [troubleshooting guide](./docs/TROUBLESHOOTING.md)
2. Review the [API reference](./docs/API_REFERENCE.md)
3. Use browser dev tools for debugging

---

*Built with ❤️ using Astro, TypeScript, and modern web technologies.*