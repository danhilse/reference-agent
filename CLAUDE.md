# CLAUDE.md - Reference Agent Guidelines

## Build Commands
- `npm run dev` - Start development server (turbo)
- `npm run build` - Build Next.js project
- `npm run start` - Start production server
- `npm run preview` - Build and start production server

## Lint/Format Commands
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run typecheck` - Check TypeScript types
- `npm run check` - Run both lint and type checks
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check formatting

## Code Style Guidelines
- **TypeScript**: Use strict type checking, define interfaces for props
- **Components**: Use functional components with React hooks
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Imports**: Use path aliases (`~/` for src/), group and sort imports
- **CSS**: Use Tailwind with className strings, follow existing patterns
- **Formatting**: Follow Prettier configuration, clear component exports
- **Error Handling**: Use try/catch blocks, provide meaningful errors
- **UI Components**: Follow shadcn/ui component system conventions