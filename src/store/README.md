# State Management

This directory is reserved for state management solutions.

## Options for State Management:

### 1. Context API (Built-in React)
Already implemented with:
- `NavigationContext` - Navigation state
- `SettingSideBarContext` - Settings sidebar state

### 2. Zustand (Recommended for simplicity)
```bash
npm install zustand
```

### 3. Redux Toolkit (For complex state)
```bash
npm install @reduxjs/toolkit react-redux
```

### 4. Jotai (Atomic state management)
```bash
npm install jotai
```

## Usage Example with Zustand:

```javascript
// store/useAppStore.js
import { create } from 'zustand';

const useAppStore = create((set) => ({
  user: null,
  theme: 'light',
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
}));

export default useAppStore;
```