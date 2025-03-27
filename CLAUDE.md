# CLAUDE.md - Reference Agent Guidelines

## Build Commands
- `npm run dev` - Start development server (turbo)
- `npm run build` - Build Next.js project
- `npm run start` - Start production server
- `npm run preview` - Build and start production server

## Lint/Format Commands
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run typecheck` - Check TypeScript types
- `npm run check` - Run both lint and type checks
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check formatting

## Code Style Guidelines
- **TypeScript**: Use strict typing with noUncheckedIndexedAccess, define interfaces/types for props
- **Components**: Functional components with React hooks, no class components
- **Naming**: PascalCase for components/types, camelCase for variables/functions/instances
- **Imports**: Use path aliases (`~/` for src/), group imports (React, libraries, internal)
- **CSS**: Use Tailwind with className strings, use clsx/tailwind-merge for conditionals
- **Formatting**: Follow Prettier configuration with tailwindcss plugin
- **Error Handling**: Use try/catch blocks, provide meaningful error messages/fallbacks
- **UI Components**: Follow shadcn/ui component patterns based on Radix primitives
- **File Structure**: Group related components in directories, use index files for exports