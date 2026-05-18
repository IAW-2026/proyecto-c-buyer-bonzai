# Design System Document: The Botanical Curator

## 1. Overview & Creative North Star: "The Living Archive"
This design system moves beyond the transactional nature of e-commerce or digital catalogs. Our Creative North Star is **The Living Archive**. It represents a shift from "app-like" layouts to a "High-End Editorial" experience. 

We reject the rigid, boxy constraints of traditional web design. Instead, we embrace **intentional asymmetry**, **breathable negative space**, and **tonal depth**. The interface should feel like a curated botanical journal—tactile, sophisticated, and quiet. We lead with the "Bonzai" spirit: the art of deliberate composition where what is left out is just as important as what is included.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Soil to Sky" philosophy. We use organic, earthy tones to create a sense of calm and permanence.

### The Palette (Material Design 3 Logic)
*   **Primary (Action):** `#03271a` (The Deep Evergreen). This is our anchor. Use it for high-intent actions and primary brand moments.
*   **Secondary:** `#526347` (Moss). Used for supportive elements and secondary CTAs.
*   **Surface/Background:** `#faf9f4` (Bone/Parchment). Our canvas. It should never feel like a "digital white."
*   **Tertiary:** `#341b00` (Raw Umber). Reserved for moments of high-contrast elegance or grounding accents.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. Traditional dividers feel clinical and cheap. Boundaries must be defined through:
1.  **Background Color Shifts:** A `surface-container-low` section sitting on a `surface` background.
2.  **Negative Space:** Using our spacing scale to create distinct visual groupings.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers, like sheets of fine washi paper.
*   **Base:** `surface` (#faf9f4)
*   **Elevated Content:** Use `surface-container-low` (#f5f4ef) or `surface-container` (#efeee9) to create subtle wells or pods for information.
*   **Floating Elements:** Use `surface-container-lowest` (#ffffff) for high-impact cards to create a natural, "bright" lift.

### The Glass & Texture Rule
To evoke the feel of a greenhouse, use **Glassmorphism** for floating navigation or overlays. Apply a semi-transparent `surface` color with a `20px` backdrop blur. 
*   **Signature Gradient:** For Hero CTAs, transition subtly from `primary` (#03271a) to `primary_container` (#1b3d2f). This adds a "visual soul" and depth that prevents the dark green from feeling flat or "heavy."

---

## 3. Typography: Editorial Authority
We pair a high-contrast Serif with a functional Sans-Serif to balance heritage with modern utility.

*   **Display & Headline (Newsreader):** This is our "Editorial Voice." Use `display-lg` and `display-md` for storytelling and product titles. Do not be afraid of large-scale type; let it breathe and occasionally overlap with images for a bespoke feel.
*   **Title, Body, & Labels (Manrope):** This is our "Curator’s Note." Manrope provides clean, geometric legibility. Use `body-lg` for descriptions and `label-md` for technical specifications (e.g., "Origin," "Sunlight Requirements").

**Hierarchy Tip:** Always pair a large `display-sm` Newsreader header with a `label-md` Manrope sub-header in all-caps with `0.1em` letter spacing to create an authoritative, museum-label aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to simulate "height"; we use tonal shifts and ambient light.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card placed on a `surface-container-low` background creates a soft, natural lift without the need for artificial drop shadows.
*   **Ambient Shadows:** If a floating element (like a modal) requires a shadow, it must be "Ambient."
    *   **Blur:** 24px - 40px.
    *   **Opacity:** 4% - 6%.
    *   **Color:** Use a tinted version of `on-surface` (#1b1c19), never pure black.
*   **The Ghost Border Fallback:** If accessibility requires a border, use `outline-variant` (#c1c8c2) at **20% opacity**. This provides a "suggestion" of a container without breaking the organic flow.

---

## 5. Components

### Primary Buttons
*   **Style:** `primary` background, `on-primary` text. 
*   **Shape:** `0.25rem` (sm) roundedness for a disciplined, architectural look.
*   **Interaction:** On hover, shift to `primary_container`.

### The "Curated Card"
*   **Rule:** Forbid divider lines.
*   **Layout:** Use a `surface-container-highest` background for the image area and `surface-container-lowest` for the content area.
*   **Spacing:** Use a minimum of `1.5rem` (24px) internal padding to maintain the premium feel.

### Input Fields
*   **Style:** Minimalist. No "box" containers. Use a `surface-variant` bottom-weighted fill or a very subtle `surface-container-high` background.
*   **Focus:** Transition the bottom border or a subtle inner glow to `primary`.

### Navigation (The Floating Dock)
*   Instead of a pinned header, use a centered, floating dock utilizing the **Glassmorphism** rule. Use the Bonzai icon (`{{DATA:IMAGE:IMAGE_5}}`) as the home trigger.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align text to the left but allow images to bleed off-center or occupy varied grid widths.
*   **Use Tonal Shifts:** Distinguish between a product gallery and a checkout flow by shifting the background from `surface` to `surface-container-low`.
*   **Prioritize Type Scale:** Let the difference between `display-lg` and `body-sm` do the work of creating hierarchy.

### Don’t:
*   **No High-Contrast Borders:** Never use 100% opaque lines to separate content. It kills the "Botanical" softness.
*   **No Heavy Shadows:** Avoid "Material Design" style heavy shadows. Our world is lit by soft, diffused greenhouse light.
*   **No "Pure" White:** Never use `#ffffff` for large backgrounds. It is too sterile. Stick to the `#faf9f4` (Bone) base.
*   **No Crowding:** If in doubt, add 16px of extra margin. Premium is synonymous with space.