# Graph Report - .  (2026-08-29)

## Corpus Check
- Corpus is ~20,543 words - fits in a single context window. You may not need a graph.

## Summary
- 317 nodes · 432 edges · 25 communities (15 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 225,681 input · 0 output

## Community Hubs (Navigation)
- Daily & Weekly Notes Views
- NPM Dependencies
- Note Display & Sharing Components
- Backend API Routes
- Dev Tooling & Build Config
- TypeScript Configuration
- Source Management & Local Storage
- Rich Text Editor Components
- App Shell & Providers
- Explore Page (Jelajahi)
- Project Documentation
- Dashboard Page
- Network Proxy Config
- NextAuth Type Definitions
- ESLint Configuration
- Next.js Config File
- PostCSS Configuration
- File Icon Asset
- Globe Icon Asset
- Next.js Logo Asset
- Vercel Logo Asset
- Window Icon Asset

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `formatDate()` - 15 edges
3. `getWeekRange()` - 12 edges
4. `getYouTubeThumbnail()` - 12 edges
5. `stripMarkdown()` - 9 edges
6. `authOptions` - 8 edges
7. `JelajahiPage()` - 7 edges
8. `CATEGORY_COLOR` - 7 edges
9. `include` - 7 edges
10. `NoteModal()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Custom Next.js Version (Breaking Changes Warning)` --conceptually_related_to--> `Next.js`  [AMBIGUOUS]
  AGENTS.md → README.md
- `NoteModal()` --calls--> `getWeekStartDate()`  [EXTRACTED]
  app/components/NoteModal.tsx → app/lib/utils.ts
- `NoteModal()` --calls--> `getYouTubeThumbnail()`  [EXTRACTED]
  app/components/NoteModal.tsx → app/lib/utils.ts
- `DailyPage()` --calls--> `formatDate()`  [EXTRACTED]
  app/daily/page.tsx → app/lib/utils.ts
- `JelajahiPage()` --calls--> `formatDate()`  [EXTRACTED]
  app/jelajahi/page.tsx → app/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Project Root Documentation Files** — claude_doc, agents_doc, readme_doc [INFERRED 0.75]
- **Next.js Ecosystem Tooling** — readme_nextjs, readme_create_next_app, readme_next_font, readme_vercel [INFERRED 0.70]

## Communities (25 total, 10 thin omitted)

### Community 0 - "Daily & Weekly Notes Views"
Cohesion: 0.07
Nodes (35): Props, NoteData, NoteModal(), Props, Source, srcBg, srcIcon, SrcType (+27 more)

### Community 1 - "NPM Dependencies"
Cohesion: 0.05
Nodes (43): @auth/prisma-adapter, bcryptjs, date-fns, lucide-react, @neondatabase/serverless, next, next-auth, dependencies (+35 more)

### Community 2 - "Note Display & Sharing Components"
Cohesion: 0.09
Nodes (28): Note, NoteCard(), NoteSource, Props, srcPill, Note, NotePreviewModal(), NoteSource (+20 more)

### Community 3 - "Backend API Routes"
Cohesion: 0.11
Nodes (9): handler, DELETE(), ownsNote(), PUT(), DELETE(), ownsSource(), PUT(), authOptions (+1 more)

### Community 4 - "Dev Tooling & Build Config"
Cohesion: 0.07
Nodes (28): dotenv, eslint, eslint-config-next, devDependencies, dotenv, eslint, eslint-config-next, tailwindcss (+20 more)

### Community 5 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "Source Management & Local Storage"
Cohesion: 0.19
Nodes (13): generateId(), Props, SourceModal(), sourceTypes, deleteNote(), deleteSource(), getNotes(), getSources() (+5 more)

### Community 7 - "Rich Text Editor Components"
Cohesion: 0.13
Nodes (9): EMOJIS, Props, PrefixTool, Props, SepTool, Tool, tools, WrapTool (+1 more)

### Community 8 - "App Shell & Providers"
Cohesion: 0.20
Nodes (9): Navbar(), navItems, SessionProvider(), Theme, ThemeContext, ThemeProvider(), useTheme(), geist (+1 more)

### Community 9 - "Explore Page (Jelajahi)"
Cohesion: 0.19
Nodes (13): ACCENT_DOT_COLORS, ACCENT_GRADIENTS, Author, formatMonth(), getAccentColor(), getAccentIndex(), JelajahiPage(), monthLabels (+5 more)

### Community 10 - "Project Documentation"
Cohesion: 0.17
Nodes (10): Custom Next.js Version (Breaking Changes Warning), node_modules/next/dist/docs (Custom Next.js Docs), create-next-app, Geist Font, Learn Next.js Tutorial, next/font, Next.js, Next.js Documentation (+2 more)

### Community 11 - "Dashboard Page"
Cohesion: 0.33
Nodes (8): calcWeeklyStreak(), Dashboard(), getISOWeekNumber(), getWeeklyActivityCells(), Note, NoteSource, Source, WeekCell

## Ambiguous Edges - Review These
- `Custom Next.js Version (Breaking Changes Warning)` → `Next.js`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **145 isolated node(s):** `handler`, `Props`, `EMOJIS`, `Props`, `Props` (+140 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Custom Next.js Version (Breaking Changes Warning)` and `Next.js`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `NPM Dependencies` to `Dev Tooling & Build Config`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `getYouTubeThumbnail()` connect `Note Display & Sharing Components` to `Daily & Weekly Notes Views`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `formatDate()` connect `Note Display & Sharing Components` to `Daily & Weekly Notes Views`, `Explore Page (Jelajahi)`, `Dashboard Page`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `handler`, `Props`, `EMOJIS` to the rest of the system?**
  _145 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Daily & Weekly Notes Views` be split into smaller, more focused modules?**
  _Cohesion score 0.06765327695560254 - nodes in this community are weakly interconnected._
- **Should `NPM Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._