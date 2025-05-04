# CareerSense Component Documentation

This document provides details about the key components in the CareerSense frontend application.

## Table of Contents

1. [Layout Components](#layout-components)
2. [Common Components](#common-components)
3. [Feature Components](#feature-components)
4. [Performance Components](#performance-components)
5. [Error Handling Components](#error-handling-components)

## Layout Components

### Header

**Path**: `/frontend/src/components/layout/Header/index.tsx`

**Description**: Main navigation header that appears on all pages.

**Props**:
- None

**Usage**:
```tsx
import Header from "../components/layout/Header";

const App = () => (
  <>
    <Header />
    <main>{/* Page content */}</main>
  </>
);
```

### Footer

**Path**: `/frontend/src/components/layout/Footer/index.tsx`

**Description**: Footer component that appears at the bottom of all pages.

**Props**:
- None

**Usage**:
```tsx
import Footer from "../components/layout/Footer";

const App = () => (
  <>
    <main>{/* Page content */}</main>
    <Footer />
  </>
);
```

### SubNav

**Path**: `/frontend/src/components/layout/SubNav.tsx`

**Description**: Secondary navigation component used across all pages for consistent navigation structure.

**Props**:
- `activeTab`: string - The currently active tab
- `tabs`: Array<{key: string, label: string}> - Navigation tabs to display

**Usage**:
```tsx
import SubNav from "../components/layout/SubNav";

const HomePage = () => {
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "features", label: "Features" }
  ];
  
  return (
    <div className="page-container">
      <SubNav activeTab="overview" tabs={tabs} />
      <div className="page-content">
        {/* Page content */}
      </div>
    </div>
  );
};
```

## Common Components

### FeatureCard

**Path**: `/frontend/src/components/common/FeatureCard/FeatureCard.tsx`

**Description**: Card component for displaying feature information with a consistent style.

**Props**:
- `title`: string - Card title
- `description`: string - Card description
- `icon`: ReactNode - Icon to display
- `onClick?`: () => void - Optional click handler
- `className?`: string - Optional additional CSS classes

**Usage**:
```tsx
import FeatureCard from "../components/common/FeatureCard/FeatureCard";
import { Compass } from "react-feather";

const Features = () => (
  <div className="grid grid-cols-3 gap-4">
    <FeatureCard
      title="Career Guidance"
      description="Get personalized career path recommendations"
      icon={<Compass size={24} />}
      onClick={() => navigate("/career-paths")}
    />
    {/* More feature cards */}
  </div>
);
```

### CollapsibleCard

**Path**: `/frontend/src/components/common/FeatureCard/CollapsibleCard.tsx`

**Description**: Expandable card component with toggle functionality.

**Props**:
- `title`: string - Card title
- `children`: ReactNode - Card content
- `defaultOpen?`: boolean - Whether the card is open by default
- `className?`: string - Optional additional CSS classes

**Usage**:
```tsx
import CollapsibleCard from "../components/common/FeatureCard/CollapsibleCard";

const SkillsSection = () => (
  <CollapsibleCard title="Technical Skills" defaultOpen={true}>
    <ul className="list-disc pl-5">
      <li>React</li>
      <li>TypeScript</li>
      <li>Node.js</li>
    </ul>
  </CollapsibleCard>
);
```

### OptimizedImage

**Path**: `/frontend/src/components/common/OptimizedImage/OptimizedImage.tsx`

**Description**: Image component with optimization features like lazy loading and placeholders.

**Props**:
- `src`: string - Image source URL
- `alt`: string - Alternative text
- `fallbackSrc?`: string - Fallback image URL if main image fails to load
- `lowQualitySrc?`: string - Low-quality placeholder image
- `lazyLoad?`: boolean - Whether to lazy load the image
- `blurhash?`: string - Blurhash for image placeholder
- `onLoad?`: () => void - Callback when image loads
- `onError?`: () => void - Callback when image fails to load
- Other standard img attributes

**Usage**:
```tsx
import OptimizedImage from "../components/common/OptimizedImage/OptimizedImage";

const ProfileCard = () => (
  <div className="card">
    <OptimizedImage
      src="/assets/images/profile.jpg"
      alt="User profile"
      fallbackSrc="/assets/images/default-avatar.jpg"
      lazyLoad={true}
      className="w-32 h-32 rounded-full"
    />
    <h3>John Doe</h3>
  </div>
);
```

### VirtualList

**Path**: `/frontend/src/components/common/VirtualList/VirtualList.tsx`

**Description**: Efficiently renders large lists by only rendering items currently in view.

**Props**:
- `items`: T[] - Array of items to render
- `height`: number - Height of the list container
- `itemHeight`: number - Height of each item
- `renderItem`: (item: T, index: number) => React.ReactNode - Function to render each item
- `overscan?`: number - Number of items to render outside of view
- `className?`: string - Optional additional CSS classes
- `itemKey?`: (item: T, index: number) => string | number - Function to generate unique keys

**Usage**:
```tsx
import VirtualList from "../components/common/VirtualList/VirtualList";

const UserList = ({ users }) => (
  <VirtualList
    items={users}
    height={500}
    itemHeight={60}
    overscan={5}
    renderItem={(user, index) => (
      <div className="p-4 border-b">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
    )}
    itemKey={(user) => user.id}
  />
);
```

## Feature Components

### CvUpload

**Path**: `/frontend/src/features/cv-upload/CvUpload.tsx`

**Description**: Main component for CV upload and analysis functionality.

**Props**:
- None (self-contained feature component)

**Usage**:
```tsx
import CvUpload from "../features/cv-upload/CvUpload";

const CvUploadPage = () => (
  <div className="page-container">
    <h1>Upload Your CV</h1>
    <CvUpload />
  </div>
);
```

### CareerPaths

**Path**: `/frontend/src/features/career-paths/CareerPaths.tsx`

**Description**: Component for displaying career path recommendations.

**Props**:
- None (self-contained feature component)

**Usage**:
```tsx
import CareerPaths from "../features/career-paths/CareerPaths";

const CareerPathsPage = () => (
  <div className="page-container">
    <h1>Career Path Recommendations</h1>
    <CareerPaths />
  </div>
);
```

### MockInterviews

**Path**: `/frontend/src/features/mock-interviews/MockInterviews.tsx`

**Description**: Component for mock interview simulation.

**Props**:
- None (self-contained feature component)

**Usage**:
```tsx
import MockInterviews from "../features/mock-interviews/MockInterviews";

const MockInterviewsPage = () => (
  <div className="page-container">
    <h1>Mock Interviews</h1>
    <MockInterviews />
  </div>
);
```

## Performance Components

### PerformanceOptimizer

**Path**: `/frontend/src/components/common/PerformanceOptimizer.tsx`

**Description**: Utility component with HOCs and hooks for performance optimization.

**Exports**:
- `withMemoization<P>`: HOC to memoize components
- `useMemoizedValue<T>`: Hook to memoize expensive calculations
- `useMemoizedCallback<T>`: Hook to memoize callbacks
- `withLoadingState<P>`: HOC to add loading and error states

**Usage**:
```tsx
import { 
  withMemoization, 
  useMemoizedValue, 
  useMemoizedCallback 
} from "../components/common/PerformanceOptimizer";

// Memoize a component
const MemoizedComponent = withMemoization(ExpensiveComponent);

// Inside a functional component
const MyComponent = () => {
  // Memoize an expensive calculation
  const processedData = useMemoizedValue(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  // Memoize a callback
  const handleClick = useMemoizedCallback(() => {
    console.log("Clicked!");
  }, []);
  
  return <div onClick={handleClick}>{processedData}</div>;
};
```

## Error Handling Components

### ErrorBoundary

**Path**: `/frontend/src/components/common/ErrorBoundary/ErrorBoundary.tsx`

**Description**: React error boundary component that catches JavaScript errors in child components.

**Props**:
- `children`: ReactNode - Components to wrap
- `fallback?`: ReactNode - Custom fallback UI
- `onReset?`: () => void - Function to call when reset is triggered

**Usage**:
```tsx
import ErrorBoundary from "../components/common/ErrorBoundary";

const App = () => (
  <ErrorBoundary>
    <MyComponent />
  </ErrorBoundary>
);
```

### Feature-Specific Error Boundaries

**Paths**:
- `/frontend/src/features/cv-upload/CvUploadErrorBoundary.tsx`
- `/frontend/src/features/career-paths/CareerPathsErrorBoundary.tsx`
- `/frontend/src/features/mock-interviews/MockInterviewsErrorBoundary.tsx`

**Description**: Specialized error boundaries for specific features with custom fallback UIs.

**Props**:
- `children`: ReactNode - Components to wrap
- `onReset?`: () => void - Function to call when reset is triggered

**Usage**:
```tsx
import CvUploadErrorBoundary from "../features/cv-upload/CvUploadErrorBoundary";
import CvUpload from "../features/cv-upload/CvUpload";

const CvUploadPage = () => (
  <CvUploadErrorBoundary>
    <CvUpload />
  </CvUploadErrorBoundary>
);
```
