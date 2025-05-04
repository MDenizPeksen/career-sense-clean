import React, { ComponentType, memo, useCallback, useMemo } from 'react';

/**
 * HOC to memoize components with custom comparison
 * @param Component Component to memoize
 * @param propsAreEqual Custom comparison function (optional)
 */
export function withMemoization<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<ComponentType<P>> {
  return memo(Component, propsAreEqual);
}

/**
 * Hook to memoize expensive calculations
 * @param factory Function that returns the value to memoize
 * @param dependencies Array of dependencies
 */
export function useMemoizedValue<T>(factory: () => T, dependencies: React.DependencyList): T {
  return useMemo(factory, dependencies);
}

/**
 * Hook to memoize callbacks
 * @param callback Function to memoize
 * @param dependencies Array of dependencies
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies);
}

/**
 * HOC to add loading and error states to a component
 * @param Component Component to enhance
 */
export function withLoadingState<P extends object>(
  Component: ComponentType<P>
): React.FC<P & { isLoading?: boolean; error?: Error }> {
  return ({ isLoading, error, ...props }: P & { isLoading?: boolean; error?: Error }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-red-700">
          <p className="font-medium">Error: {error.message}</p>
        </div>
      );
    }

    return <Component {...(props as P)} />;
  };
}
