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

- [*] Fix Shadcn styling and configuration issues
- [ ] Integrate Better Auth with Prisma for authentication
- [ ] Create login/signup forms with Better Auth integration
- [ ] Add email sending functionality with Resend
- [ ] Implement payment processing with Stripe and LemonSqueezy
- [ ] Enhance documentation with more examples

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
