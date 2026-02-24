# 🐱 Meow Project Documentation (meow.md)

## 1. 📌 Project Overview
Meow is a minimalist productivity application designed to make focus sessions more engaging through a reactive digital companion. The project combines a focus timer with a "living" eye system that mirrors the user's current activity state.

- **Core Idea**: A companion system where a cat's visual behavior (mood and movement) is tied to a focus timer.
- **Goal**: To provide a soothing and interactive workspace environment that encourages productivity.

## 2. ⚙️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Animations**: Framer Motion & CSS Transitions
- **Styling**: Tailwind CSS 4 & Styled-JSX
- **Theming**: Next-Themes (Dark/Light mode support)
- **Icons**: Lucide React
- **Runtime**: Web Browser

## 3. 🧩 Components Breakdown

### CatEyes Component
- **Purpose**: Represents the companion's presence and emotional state.
- **Key Logic**: 
    - Uses a state machine for various `Mood` types (`neutral`, `happy`, `serious`, `sleeping`, etc.).
    - Implements three parallel `useEffect` loops:
        - **Blink Loop**: Randomly triggers blinking animations with occasional double-blinks.
        - **Movement Loop**: Simulates natural eye scanning/looking around when idle.
        - **Mood Loop**: Periodically shifts between random moods.
    - **Tracking**: Can smoothly track a horizontal position (intended for the WalkingCat).
- **Props**:
    - `baseMood`: (Optional) Forces a specific emotional state.
    - `catXFraction`: (Optional) Horizontal coordinate (0-1) for the eyes to follow.

### Timer Component
- **Purpose**: Core productivity tool for tracking focus time.
- **Key Logic**: 
    - Manages timer states: `idle`, `running`, `paused`.
    - Handles time accumulation in seconds.
    - Notifies parent components of state changes to synchronize environmental effects.
    - Uses Framer Motion for smooth UI transitions between play and pause states.
- **Props**:
    - `onStateChange`: Callback function triggered when the timer's status shifts.

### WalkingCat Component (Legacy/Inactive)
- **Purpose**: A full-body cat companion that walks across the bottom of the screen.
- **Key Logic**: 
    - Uses `requestAnimationFrame` for high-performance SVG animations.
    - Features procedural leg movement, tail wagging, and body bobbing.
    - Automatically turns around at screen edges.
    - **Note**: Currently commented out in the main view but fully implemented in code.

### ModeToggle Component
- **Purpose**: UI control for switching visual themes.
- **Key Logic**: Interacts with `next-themes` to toggle the `.dark` class on the root element.

## 4. ✨ Features Implemented

- ⏱️ **Dual-Mode Timer**: Supports both count-up focus sessions and countdown (Pomodoro) sessions.
- 🎯 **Preset Durations**: Quick-select buttons for 25m, 45m, and 60m focus blocks.
- ⚙️ **Custom Duration**: Flexible input for specific session lengths.
- 👀 **Dynamic Eye System**: Expressive eyes that blink, look around, and change shape using CSS `clip-path`.
- 🎭 **State-Driven Moods**: 
    - `Running` timer → **Serious** eyes.
    - `Paused` timer → **Sleeping** eyes.
    - `Idle` timer → **Neutral/Random** eyes.
- 🌓 **Theme Support**: Fully integrated Dark and Light modes with "sticky" glassmorphism UI.
- 🐈‍⬛ **Procedural Animation Architecture**: Efficient loop-based animations that create an "organic" feel.

## 5. 🧠 Behavior & Logic

### Animation Loops
The project avoids static animations by using "organic" loops. Blinks and eye movements occur at randomized intervals within a set range (e.g., 2–6 seconds) to prevent the companion from feeling robotic.

### State Management
- **Local State**: Individual components manage their own internal cycles (e.g., `CatEyes` manages its pupil offset, `Timer` manages its tick).
- **Global Coordination**: The `Home` page acts as the orchestrator, lifting the timer state to update the `baseMood` of the eyes.

### Sync Logic
```typescript
const getMoodFromState = (state: TimerState) => {
  switch (state) {
    case "running": return "serious";
    case "paused": return "sleeping";
    default: return "neutral";
  }
};
```

## 6. 🔄 Current Flow

1. **Initialization**: App opens in Dark mode (default); the `CatEyes` component begins its idle loops (looking around, blinking).
2. **Idle Interaction**: User sees the eye companion acting autonomously while the timer is at `00 : 00 : 00`.
3. **Start Focus**: User clicks the "Start" button. The timer begins counting up, and the cat eyes immediately narrow into a "serious" focus mood.
4. **Pause Session**: User clicks "Pause". The timer stops, and the cat eyes close into "sleeping" mode (horizontal lines).
5. **Theme Toggle**: User clicks the sun/moon icon in the top-right to switch between Light and Dark aesthetics.

## 7. 📊 State Management
- **timerState**: Controls the UI layout and the companion's base mood (`idle` | `running` | `paused`).
- **time**: The raw integer count of seconds elapsed.
- **currentMood**: The specific visual shape being rendered by the `CatEyes` component.
- **catXFraction**: The shared coordinate between the (inactive) cat and the eyes.

## 8. 🎨 UI / UX Notes
- **Design Style**: Minimalist/Modern with "Pixelify Sans" font for a retro-digital feel.
- **Animations**: Uses high-performance CSS transforms and `clip-path` to ensure 60fps animations even on lower-end devices.
- **Visual Behavior**: The eyes use easing functions (cubic-bezier) to simulate natural eye "saccades" (quick movements).

## 9. 🚧 Limitations / Missing Features
- **Persistence**: Timer progress and theme preferences do not persist after a page refresh (no LocalStorage integration yet).
- **Companion Visibility**: The full-body `WalkingCat` is hidden in the current production layout.
- **Task Management**: No system for inputting tasks or goals.

## 10. 🛠️ Suggested Next Steps

- **Enable Walking Cat**: Uncomment and refine the `WalkingCat` integration to provide a moving target for the eyes.
- **Local Storage**: Save the timer state and theme preference so users don't lose progress.
- **Task List**: Add a simple, minimalist list where users can check off what they are focusing on.
- **Soundscape**: Introduce subtle ambient sounds (cat purring when paused, ticking when running).




CORE
 ├── Timer
 ├── Eyes
 ├── Tasks
 ├── Persistence

USP
 ├── Reactive Eyes
 ├── Focus Score
 ├── Streaks
 ├── Walking Cat

ADVANCED
 ├── Sound
 ├── Distraction Tracking
 ├── Hardcore Mode

PREMIUM
 ├── AI Coach
 ├── Activity Tracker
 ├── Analytics
 ├── Sync


<!-- Pomodoro / Countdown Mode -->

 <!-- WHAT:
Add countdown-based focus sessions (not just count-up).

WHY:
Users need structured focus (25min, 45min etc).

HOW:
- Add new state: mode = "countup" | "countdown"
- Add duration state (in minutes)
- Convert duration → seconds
- Decrease time every second
- When time === 0 → trigger session complete

UI:
- Buttons: [25m] [45m] [60m] [Custom]
- Toggle: Count Up / Count Down

LOGIC:
if (mode === "countdown") {
  timeLeft = duration - elapsed
}

OUTPUT:
- Timer counts down
- Ends with event trigger -->






<!-- 📝 Task System (Linked to Timer) -->
<!-- 
WHAT:
Allow users to create tasks and link them to sessions.

WHY:
Focus without purpose = useless

HOW:
State:
tasks = [
  { id, title, completed, linkedSessionTime }
]

Features:
- Add task
- Delete task
- Mark complete
- Select active task

LOGIC:
When timer starts:
→ attach session to selected task

When session ends:
→ update task.focusTime += sessionDuration

UI:
- Input field
- Task list
- Highlight active task

OUTPUT:
- Tasks linked with focus sessions -->







<!-- 💾 Local Storage Persistence -->

<!-- WHAT:
Save user data locally so refresh doesn’t reset everything.

WHY:
Current app loses all progress ❌

HOW:
Use localStorage:

Save:
- timerState
- time
- tasks
- theme
- mode

LOGIC:
On load:
→ read localStorage
→ hydrate state

On change:
→ save to localStorage

Example:
localStorage.setItem("meow-timer", JSON.stringify(state))

OUTPUT:
- Data persists after refresh -->





<!-- 🔔 Session Completion System -->


<!-- WHAT:
Trigger feedback when session ends.

WHY:
Closure = satisfaction + habit loop

HOW:
When timer hits 0:
- show message
- play sound (optional)
- reset or go to break

UI:
- Toast / popup:
  "Nice. You focused for 25 mins 🎯"

Optional:
- vibration (mobile)
- subtle animation

OUTPUT:
- User gets feedback at end of session -->





<!-- 👀 Reactive Eye Intelligence -->

WHAT:
Make eyes react to USER behavior (not just timer).

WHY:
This is your MAIN USP

HOW:

Detect:
1. Tab switch:
   document.visibilitychange

2. Idle:
   track mouse/keyboard inactivity

LOGIC:

if (tabHidden) → mood = "annoyed"
if (idle > 60s) → mood = "sleeping"
if (focused) → mood = "serious"

STATE:
userActivityState = "active" | "idle" | "away"

OUTPUT:
- Eyes react dynamically to real behavior






<!-- 📊 Focus Score System -->


WHAT:
Calculate a score for each session.

WHY:
Gamification = retention

HOW:

Variables:
- sessionCompleted
- distractionCount
- idleTime

FORMULA:
score = 
 + 100 (complete session)
 - (distractions * 10)
 - (idleTime / 5)

STATE:
focusScore (per session)
totalScore (daily)

UI:
- show score after session
- show daily score

OUTPUT:
- User sees measurable performance






<!-- 🔥 Streak System -->


WHAT:
Track daily consistency.

WHY:
Streak = addiction loop

HOW:

STATE:
streakCount
lastActiveDate

LOGIC:

if (today - lastActiveDate === 1 day)
  streak++
else if (>1 day)
  streak = 1

Store in localStorage

UI:
- "🔥 5 Day Streak"

OUTPUT:
- Users return daily to maintain streak






<!-- 🧠 Basic Session Insights -->


WHAT:
Show simple productivity stats.

WHY:
Users want awareness of progress

HOW:

Track:
- totalFocusTime (per day)
- sessionsCompleted
- avgSessionTime

STATE:
stats = {
  todayTime,
  sessions,
  average
}

UI:
- small dashboard:
  "Today: 2h 30m"
  "Sessions: 5"

OUTPUT:
- Basic analytics visible to user








