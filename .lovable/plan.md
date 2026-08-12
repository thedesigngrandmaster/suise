# Suise reliability, responsive, and accessibility pass

## Goal
Make the signed-in product reliable and polished across mobile, tablet, and desktop while fixing connection, chat, handover, rewards, wallet, Explore, SEO, and 404 behavior.

## Implementation

### 1. Social and messaging flows
- Add **Cancel request** for outgoing pending connections, with optimistic UI, rollback/toast handling, and a sent-requests view/state.
- Upgrade community-account replies to classify greetings, questions, album purchase interest, and general messages, then return an appropriate contextual reply instead of a random canned response.
- Keep reply processing scoped to unread messages sent to community accounts and validate the signed-in caller before running it.
- Reposition chat unread counters at the icon/thread top-right and enforce a stable circular badge with accessible count text.

### 2. Handover recipient search
- Replace exact username submission with debounced automatic profile search as the user types.
- Show keyboard-navigable results with avatar, name, and username; require selecting a result before continuing.
- Preserve the deliberate title confirmation, permanent-action warning, and transaction receipt behavior.

### 3. Rewards correctness
- Centralize reward rules and award points only after successful actions.
- Cover memory/photo uploads, folder creation, inviting collaborators, accepted collaboration, visibility/share/follow actions where appropriate, and completed handovers.
- Add idempotency guards for one-time/daily events so retries do not duplicate points; refresh Earn balances immediately after awards.
- Surface actionable toast errors when a reward record fails instead of silently logging it.

### 4. Wallet reconciliation
- Key balance queries by connected address and active network so account/network switches invalidate stale results.
- Reconcile wallet-reported chains with the selected Sui client network, clear the previous balance during transitions, and refetch after both values settle.
- Add explicit switching/loading/error states, retry controls, and detailed user-friendly toasts without exposing secrets.
- Keep wallet linking per signed-in Suise account and clearly offer relinking when the connected address differs.

### 5. Explore reliability
- Isolate public-feed state from user-scoped album state and make latest-public fetching independently retryable.
- Add guarded loading, timeout/error, empty, stale-response protection, and a visible retry action.
- Refetch when returning to Explore and order the “New” feed by current public content without signed-in state overwriting it.

### 6. Responsive application shell and pages
- Refine the desktop sidebar to fit all icons without scrolling at common laptop heights, while preserving the collapsible mini state and readable tooltips.
- Standardize full-width responsive page containers, spacing, grids, safe-area padding, and `min-h-dvh` behavior across Dashboard, Explore, Connect, Vault, Chat, Settings, Wallet, Earn, Profile, Notifications, Album, and Memory surfaces.
- Fix narrow-screen wrapping/overflow in tabs, action rows, dialogs, chat composer, cards, and profile/album headers.
- Keep the semi-mature Suise palette, typography, soft depth, and reference-inspired navigation treatment.

### 7. Accessibility audit and fixes
- Audit and fix focus order/return, keyboard operation, dialog labels/descriptions, icon-button names, form labels, live regions, landmarks, tap targets, and visible focus styles.
- Use existing Radix/shadcn primitives for menus, dialogs, tabs, and selection lists rather than custom focus management.
- Improve the streak badge, navigation badges, upload/album controls, and dynamic chat/wallet/reward announcements for screen readers.
- Change full-height layouts from viewport-fragile sizing to mobile-safe dynamic viewport sizing.

### 8. Metadata and 404
- Add route-level titles, descriptions, canonicals, and Open Graph metadata for every page, with dynamic album/profile values after data loads.
- Clean the static fallback metadata so it matches Suise and does not reference nonexistent preview assets or placeholder domains.
- Build a custom responsive 404 page in the current semi-mature visual language with clear routes back to Home and Explore.
- Set the verified badge fill to the primary periwinkle token (`#9C76F5` through the semantic primary color).

### 9. Verification
- Run targeted functional checks for request cancellation, bot reply classification, handover search/selection, rewards, Explore retry, and wallet account/network switching.
- Run an accessibility-focused browser pass and responsive screenshots at mobile, tablet, and desktop widths for every requested signed-in route.
- Verify dynamic titles/canonicals on public, profile, album, and 404 routes.

## Technical details
- Add `react-helmet-async` at the app root for per-route metadata; dynamic SPA metadata is visible to JS-capable crawlers, while static fallback tags remain in `index.html` for non-JS social crawlers.
- Use a small reusable responsive page shell and metadata component to avoid page-by-page drift.
- Backend changes will retain row-level access rules and explicit grants; reward idempotency should be enforced in the database rather than trusted solely to client state.
- The signed-in browser pass requires an active preview session. The current managed preview is signed out, so implementation can proceed, but final authenticated visual verification will resume once the user signs in through the preview.
