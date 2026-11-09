---
trigger: always_on
---


# Frontend Development Rules

## Technology Stack
Preferred technologies:
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios or Fetch API

Use existing project dependencies
before introducing new ones.

## Component Architecture
- Build reusable components.
- Keep components focused.
- Separate complex business logic.
- Avoid unnecessarily large components.
- Use clear component names.
- Maintain consistent folder structures.
- Extract reusable hooks when appropriate.

## React Best Practices
- Follow React's component lifecycle.
- Use hooks correctly.
- Avoid unnecessary useEffect.
- Avoid unnecessary re-renders.
- Use stable keys when rendering lists.
- Keep state as local as practical.
- Lift state only when necessary.
- Avoid mutating state directly.
- Use context or state libraries when justified.

## TypeScript
- Prefer explicit and meaningful types.
- Avoid using `any` unnecessarily.
- Define interfaces for complex data structures.
- Type component props.
- Type API responses.
- Handle nullable values.
- Use type-safe event handlers.
- Avoid unnecessary type assertions.

## UI/UX Design
- Create clean and consistent interfaces.
- Follow a consistent spacing system.
- Maintain visual hierarchy.
- Use readable typography.
- Keep buttons and forms consistent.
- Provide useful loading states.
- Provide meaningful error states.
- Provide empty states where appropriate.
- Ensure interfaces work on mobile devices.

## Responsive Design
Support:
- Mobile devices.
- Tablets.
- Laptops.
- Desktop screens.

Avoid fixed widths that break layouts.
Use responsive Tailwind utilities.

## Accessibility
- Use semantic HTML.
- Add appropriate labels to inputs.
- Support keyboard navigation.
- Maintain sufficient color contrast.
- Provide meaningful alt text.
- Use accessible buttons and forms.

## API Integration
- Keep API communication organized.
- Handle loading and error states.
- Validate user input.
- Handle unsuccessful responses.
- Avoid exposing API secrets.
- Prevent unnecessary duplicate requests.

## Performance
- Optimize expensive components.
- Use lazy loading when appropriate.
- Optimize image assets.
- Avoid unnecessary dependencies.
- Avoid unnecessary state updates.
- Use memoization only when beneficial.

## Styling
- Follow existing design conventions.
- Prefer reusable design tokens.
- Avoid excessive inline styles.
- Avoid inconsistent spacing and colors.
- Do not introduce multiple styling systems
  without a clear reason.

## Testing
Test important:
- Component behavior.
- User interactions.
- Form validation.
- Loading states.
- Error states.
- Responsive behavior.

## Important
Prioritize usability, accessibility,
maintainability and consistent design.
