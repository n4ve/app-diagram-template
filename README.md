# 📊 Application Architecture Diagram

## 🎯 Project Overview

This Astro-based application visualizes interactive architecture diagrams showing relationships between frontend pages and backend API servers. The diagram features dynamic card interactions, zoom/pan capabilities, and real-time connection visualization based on API mappings.

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

- **📱 Interactive Cards** - Hover to see relationships and connections
- **🔗 Dynamic Connections** - SVG lines showing API relationships
- **🎯 Smart Positioning** - Cards move strategically to hide unrelated elements
- **📏 Zoom-Aware** - All interactions scale correctly with zoom level
- **📊 Data-Driven** - Relationships based on JSON configuration files
- **🎨 Smooth Animations** - CSS transitions and transforms for fluid UX

## 🏗️ Project Structure

```
app-diagram/
├── 📁 src/
│   ├── 📁 components/           # Astro components
│   ├── 📁 data/                # Configuration data (pages.json, servers.json)
│   ├── 📁 layouts/             # Page layouts
│   ├── 📁 pages/               # Astro pages
│   ├── 📁 scripts/             # Client-side TypeScript modules
│   ├── 📁 styles/              # CSS stylesheets
│   └── 📁 types/               # TypeScript type definitions
├── 📁 public/                   # Static assets
├── 📁 docs/                    # Documentation
└── 📄 Configuration files      # package.json, astro.config.mjs, etc.
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

- **⚡ Astro** - Static site generator with component islands
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **📱 Responsive Design** - Mobile-first approach
- **🔄 TypeScript** - Type-safe development with ES Modules and comprehensive type definitions

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