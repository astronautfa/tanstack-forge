# Tanstack Forge

A modern, opinionated monorepo template for building lightning-fast, feature-rich single-page applications.

## Stack

- [React 19](https://react.dev/)
- [React Compiler Beta](https://github.com/react-compiler/react-compiler)
- [Tanstack Router](https://tanstack.com/router)
- [Tanstack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Zod](https://zod.dev/)
- [pnpm](https://pnpm.io/)
- [BiomeJS](https://biomejs.dev/)
- [Turborepo](https://turbo.build/)

## How to use

```bash
# Clone the repo
git clone https://github.com/astronautfa/tanstack-forge

# or

gh repo clone astronautfa/tanstack-forge
```

```bash
# Install dependencies
pnpm install
```

```bash
# Run the development server
pnpm dev
```

## Turborepo Commands

This project uses Turborepo for optimized builds and task running:

```bash
# Run development server for all workspaces
pnpm dev

# Build all workspaces
pnpm build

# Lint all workspaces
pnpm lint

# Fix linting in all workspaces
pnpm lint:fix

# Format all workspaces
pnpm format

# Fix formatting in all workspaces
pnpm format:fix

# Run tests in all workspaces
pnpm test
```

## Installing Shadcn UI Components

```bash
# Go to the packages/ui directory
cd packages/ui
```

```bash
# Install the component
pnpm dlx shadcn@2.1.6 add [COMPONENT]
```

```bash
# Example
pnpm dlx shadcn@latest add label
```

## Use it in the web app

```tsx
// apps/web...
import { Label } from "@app/ui/components/label";

function MyComponent() {
  return Hello World;
}
```

## Project Philosophy

Tanstack Forge is an opinionated stack designed to create the best possible experience for single-page applications. We focus on delivering applications that are both lightning-fast and feature-rich without compromising on developer experience.

By incorporating best practices directly into the template, we aim to eliminate common pain points and provide a solid foundation for building modern web applications.

## TODO

### Styling and Configuration

- [x] Fix Shadcn styling and configuration issues

### Authentication with Better Auth and Prisma

- [ ] Authentication UI
  - [ ] Build profile management page

### API Routes with HonoJS

- [ ] Set up HonoJS API routes
  - [ ] Configure API middleware
  - [ ] Implement authentication middleware
  - [ ] Create user management endpoints
  - [ ] Set up email sending endpoints
  - [ ] Implement error handling

### React Query Integration

- [ ] Configure React Query
  - [ ] Set up QueryClient provider
  - [ ] Create custom hooks for auth operations
  - [ ] Implement data fetching with authentication
  - [ ] Set up cache invalidation strategies
  - [ ] Add optimistic updates for better UX

### Payment Processing

- [ ] Stripe Integration
  - [ ] Install Stripe package
  - [ ] Configure Stripe API keys
  - [ ] Create subscription models in Prisma
  - [ ] Build checkout components
  - [ ] Implement webhook handling
  - [ ] Add payment success/failure flows

- [ ] LemonSqueezy Integration
  - [ ] Install LemonSqueezy package
  - [ ] Configure LemonSqueezy API keys
  - [ ] Create product management in Prisma
  - [ ] Build checkout components
  - [ ] Implement webhook handling
  - [ ] Add payment success/failure flows

### Documentation

- [ ] Enhance documentation
  - [ ] Document API endpoints
  - [ ] Create email templates documentation
  - [ ] Add payment integration guides
  - [ ] Include troubleshooting section

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
