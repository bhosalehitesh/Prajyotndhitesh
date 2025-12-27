# Home Module

This module provides the shopkeeper dashboard/home screen similar to Sakhi by Amazon.

## 📁 Folder Structure

```
Home/
├── HomeScreen.tsx      # Main home screen with UI
├── types.ts           # TypeScript interfaces for all data models
├── mockData.ts        # Mock data structures (for development)
├── useHomeData.ts     # Custom hook for data fetching (BACKEND INTEGRATION POINT)
├── index.ts          # Exports
└── README.md         # This file
```

## 🎯 Features

1. **Profile Section**
   - User profile card with avatar
   - Store link with view and share options
   - Edit profile button

2. **Onboarding Progress**
   - Progress bar showing completion percentage
   - Task list with status indicators
   - Quick navigation to pending tasks

3. **Sakhi Features Carousel**
   - Feature cards with badges (e.g., "New!")
   - Carousel navigation
   - Setup/action buttons

4. **Store Configuration Grid**
   - 6 configuration options in a grid
   - Quick access to settings

5. **Help Section**
   - FAQs, How Tos, Contact Us

## 🔄 Backend Integration Guide

### Step 1: Understand the Data Structure

All data models are defined in `types.ts`. Backend team should ensure API responses match these interfaces:

- **UserProfile**: User name, avatar, store link
- **OnboardingProgress**: Progress percentage and tasks
- **OnboardingTask**: Individual task items
- **FeatureItem**: Carousel feature items
- **StoreConfigOption**: Store configuration options
- **HelpOption**: Help section items

### Step 2: API Endpoint

The following endpoint is expected:

```
GET /api/home
  No parameters required
```

### Step 3: Integration Point

**Replace the mock implementation in `useHomeData.ts`:**

1. Open `src/screens/Home/useHomeData.ts`
2. Find the `fetchData` function
3. Replace the mock data fetching with actual API call
4. Ensure API response matches `HomeScreenData` interface

Example:

```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/home');
    const result: HomeScreenApiResponse = await response.json();

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || 'Failed to fetch home data');
      setData(null);
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
    setData(null);
  } finally {
    setLoading(false);
  }
};
```

### Step 4: Response Format

API response should follow this structure:

```typescript
{
  success: boolean;
  data?: {
    profile: {
      name: string;
      avatarInitial?: string;
      storeLink: string;
    };
    onboardingProgress: {
      percentage: number; // 0-100
      totalSteps: number;
      completedSteps: number;
      message: string;
    };
    tasks: Array<{
      id: string;
      title: string;
      icon: string;
      status: 'completed' | 'pending';
      action?: string;
    }>;
    features: Array<{
      id: string;
      title: string;
      description: string;
      badge?: string;
      actionText: string;
      actionRoute?: string;
      backgroundColor?: string;
    }>;
    storeConfiguration: Array<{
      id: string;
      title: string;
      icon: string;
      route: string;
    }>;
    helpOptions: Array<{
      id: string;
      title: string;
      icon: string;
      action: string;
    }>;
  };
  error?: string;
}
```

## 📝 Notes for Backend Team

1. **No Backend Functionality**: The current implementation uses mock data
2. **Type Safety**: All interfaces are in `types.ts` - ensure API responses match
3. **Navigation**: Routes are defined in data models - update navigation accordingly
4. **Icons**: Icon names should match those in `IconSymbol.tsx`
5. **Colors**: Feature cards can have custom background colors

## 🎨 UI Components

- **Profile Card**: Overlapping header design with orange theme
- **Progress Bar**: Visual progress indicator
- **Feature Carousel**: Swipeable feature cards with dots indicator
- **Configuration Grid**: 3-column grid layout
- **Help Grid**: Horizontal 3-item layout

## 🚀 Usage

The Home screen is already integrated into the app navigation as the default tab.

Backend team just needs to:
1. Implement `/api/home` endpoint
2. Replace mock data in `useHomeData.ts`
3. Ensure response format matches `types.ts`

