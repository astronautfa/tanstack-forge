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

---

## Use it in the web app

```tsx
// apps/web...
import { Label } from "@app/ui/components/label";

function MyComponent() {
  return <Label>Hello World</Label>;
}
```

## Project Philosophy

Tanstack Forge is an opinionated stack designed to create the best possible experience for single-page applications. We focus on delivering applications that are both lightning-fast and feature-rich without compromising on developer experience.

By incorporating best practices directly into the template, we aim to eliminate common pain points and provide a solid foundation for building modern web applications.

## TODO

Styling and Configuration

[*] Fix Shadcn styling and configuration issues

Authentication with Better Auth and Prisma

[ ] Set up Prisma

[ ] Initialize Prisma in project
[ ] Create database schema for users
[ ] Set up relations between user and other models
[ ] Generate Prisma client
[ ] Create database migration scripts
[ ] Add utility functions for database operations

[ ] Integrate Better Auth

[ ] Install Better Auth package
[ ] Configure Better Auth providers (Google, GitHub, etc.)
[ ] Set up session management
[ ] Create authentication hooks
[ ] Implement JWT handling and refresh logic
[ ] Connect Better Auth with Prisma models

[ ] Authentication UI

[ ] Create login page

[ ] Build login form with validation
[ ] Add social login buttons
[ ] Implement error handling

[ ] Create signup page

[ ] Build registration form with validation
[ ] Add terms of service checkbox
[ ] Implement email verification flow

[ ] Create password reset flow

[ ] Build forgot password form
[ ] Create reset password page

[ ] Build profile management page
[ ] Implement protected routes

Email Functionality with Resend

[ ] Set up Resend

[ ] Install Resend package
[ ] Configure API keys and environment variables
[ ] Create email templates

[ ] Welcome email template
[ ] Password reset email template
[ ] Verification email template

[ ] Build email sending utility functions

API Routes with HonoJS

[ ] Set up HonoJS API routes

[ ] Configure API middleware
[ ] Implement authentication middleware
[ ] Create user management endpoints
[ ] Set up email sending endpoints
[ ] Implement error handling

React Query Integration

[ ] Configure React Query

[ ] Set up QueryClient provider
[ ] Create custom hooks for auth operations
[ ] Implement data fetching with authentication
[ ] Set up cache invalidation strategies
[ ] Add optimistic updates for better UX

Payment Processing

[ ] Stripe Integration

[ ] Install Stripe package
[ ] Configure Stripe API keys
[ ] Create subscription models in Prisma
[ ] Build checkout components
[ ] Implement webhook handling
[ ] Add payment success/failure flows

[ ] LemonSqueezy Integration

[ ] Install LemonSqueezy package
[ ] Configure LemonSqueezy API keys
[ ] Create product management in Prisma
[ ] Build checkout components
[ ] Implement webhook handling
[ ] Add payment success/failure flows

Documentation

[ ] Enhance documentation

[ ] Update README with setup instructions
[ ] Add authentication usage examples
[ ] Document API endpoints
[ ] Create email templates documentation
[ ] Add payment integration guides
[ ] Include troubleshooting section

## Future Roadmap

We're committed to expanding Tanstack Forge with additional features:

- **Authentication**: Comprehensive auth solution with Better Auth and Prisma
- **Database Integration**: Seamless Prisma ORM integration
- **Email Services**: Built-in email capabilities via Resend
- **Payment Processing**: Ready-to-use payment solutions with Stripe and LemonSqueezy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
