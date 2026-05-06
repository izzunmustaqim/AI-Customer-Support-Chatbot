# Retheme Chatbot to Match Sandhurst Advisory Branding

Rebrand the chatbot's visual identity from the current dark purple/indigo glassmorphic theme to match the Sandhurst Advisory corporate website at https://sandhurstadvisory.com.my/.

## Sandhurst Advisory Brand Colors (Extracted)

From the website's CSS and SVG fills:

| Token | Current (Purple/Indigo) | New (Sandhurst) | Usage |
|-------|------------------------|-----------------|-------|
| **Primary** | `#6366f1` (Indigo) | `#001d39` (Dark Navy) | Headers, primary buttons, nav |
| **Secondary** | `#8b5cf6` (Purple) | `#985e23` (Warm Bronze/Gold) | Accents, highlights, CTA buttons |
| **Background** | `#0a0e1a` (Near Black) | `#ffffff` (White) | Page background |
| **Surface** | `rgba(255,255,255,0.04)` | `#f8f9fa` (Light Grey) | Cards, chat bubbles |
| **Text Primary** | `#f1f5f9` (White) | `#1a1a2e` (Dark) | Main text |
| **Text Secondary** | `#94a3b8` (Grey) | `#555555` (Medium Grey) | Descriptions |
| **Accent Glow** | `rgba(99,102,241,0.3)` | `rgba(152,94,35,0.2)` | Button glows |
| **Success** | `#10b981` (Green) | `#10b981` (Green) | Keep same |

> [!IMPORTANT]
> **Major shift: Dark theme → Light theme.** This affects nearly every CSS variable and all glassmorphism effects need to be converted to light-mode card styles.

## Open Questions

> [!IMPORTANT]
> 1. **Do you want me to visit the Sandhurst website in the browser to get exact colors?** The browser tool is temporarily unavailable — I'm using colors from the CSS/SVG data I found. The actual site may have slightly different shades.
> 2. **Keep the landing page or remove it?** Currently there's a hero page at `/` — should it stay (rebranded) or should `/assessment` be the main page?
> 3. **Sandhurst logo:** Do you have the logo file? I can add it to the header instead of the robot icon.

## Proposed Changes

### Design System (Foundation)

#### [MODIFY] [globals.css](file:///c:/Source%20Code/AI%20chatbot/src/app/globals.css)
- Change all CSS custom properties from dark to light theme
- Update color palette: indigo/purple → navy/bronze
- Change `color-scheme: dark` → `color-scheme: light`
- Update body background from dark to white
- Remove dark glassmorphic radial gradients
- Update scrollbar colors for light theme
- Update typography colors for dark-on-light readability

---

### Landing Page

#### [MODIFY] [page.tsx](file:///c:/Source%20Code/AI%20chatbot/src/app/page.tsx)
- Update hero text/branding to match Sandhurst
- Change gradient text colors

#### [MODIFY] [page.module.css](file:///c:/Source%20Code/AI%20chatbot/src/app/page.module.css)
- Light background styling
- Update button colors

---

### Assessment Page (Full-Page Chat)

#### [MODIFY] [assessment.css](file:///c:/Source%20Code/AI%20chatbot/src/app/assessment/assessment.css)
- Light header background with navy border
- White/light grey chat area
- Bronze accent for avatar
- Update error styling for light theme

---

### Chat Components (6 CSS files)

#### [MODIFY] [chat-widget.module.css](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/chat-widget.module.css)
- FAB button: navy/bronze instead of indigo
- Chat window: light background
- Header: navy background with white text

#### [MODIFY] [message-bubble.module.css](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/message-bubble.module.css)
- User bubble: navy background
- Assistant bubble: light grey background
- Option/checkbox buttons: bronze accent

#### [MODIFY] [chat-input.module.css](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/chat-input.module.css)
- Input field: light background with navy border
- Send button: bronze/navy

#### [MODIFY] [message-list.module.css](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/message-list.module.css)
- Typing indicator colors
- Welcome message styling

#### [MODIFY] [feedback-modal.module.css](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/feedback-modal.module.css)
- Modal: light background
- Stars: bronze color
- Submit button: navy

#### [MODIFY] [contact-form.module.css](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/contact-form.module.css)
- Form: light background
- Input fields: light theme
- Submit button: navy/bronze

---

### Dashboard (Optional)

#### [MODIFY] Dashboard CSS files
- Same light theme conversion
- Navy/bronze chart colors

---

## Summary of Affected Files

| File | Change Type | Effort |
|------|-----------|--------|
| `globals.css` | Major — all CSS variables | High |
| `page.tsx` | Minor — text/branding | Low |
| `page.module.css` | Medium — light theme | Medium |
| `assessment.css` | Medium — light theme | Medium |
| `chat-widget.module.css` | Medium — colors | Medium |
| `message-bubble.module.css` | Medium — bubble colors | Medium |
| `chat-input.module.css` | Small — input colors | Low |
| `message-list.module.css` | Small — indicator colors | Low |
| `feedback-modal.module.css` | Small — modal colors | Low |
| `contact-form.module.css` | Small — form colors | Low |
| **Total** | **10 CSS files + 1 TSX** | **~45 min** |

## Verification Plan

### Automated Tests
- Run `npx jest` — all 54 tests should still pass (CSS-only changes don't affect logic)

### Manual Verification
- Open `/` landing page — should look like Sandhurst website
- Open `/assessment` — navy header, white chat area, bronze accents
- Test chat widget — light theme, branded colors
- Test on mobile — responsive layout still works
