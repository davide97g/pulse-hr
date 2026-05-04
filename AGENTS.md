## Learned User Preferences
- When implementing an approved plan, do not edit the plan file itself, do not recreate already-created todos, and keep marking existing todos in progress through completion.

## Learned Workspace Facts
- The Pulse HR work model is Client -> Project -> Activity -> Employee assignment; the app should not reintroduce a separate "Plan" entity between projects and activities.
- Status Log conversations should be separate per topic/type, with inactive topic chats kept in history instead of a single shared chat.
- In the app's TanStack Router file conventions, sibling detail pages that should render outside a parent route use the underscore form like `activities_.$activityId.tsx`.
