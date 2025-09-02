import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when there is an error', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should call onError prop when error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it.skip('should handle retry functionality', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const TestComponent = ({ shouldThrow }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Component works</div>;
    };
    
    let throwError = true;
    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent shouldThrow={throwError} />
      </ErrorBoundary>
    );
    
    // Error should be shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click retry (this will reset the error state)
    fireEvent.click(screen.getByText('Try Again'));
    
    // Rerender with no error after retry
    throwError = false;
    rerender(
      <ErrorBoundary>
        <TestComponent shouldThrow={throwError} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Component works')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should apply dark mode styles', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary darkMode={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check for dark mode background gradient class on the outermost container
    const backgroundContainer = screen.getByText('Something went wrong').closest('div').parentElement.parentElement;
    expect(backgroundContainer).toHaveClass('from-gray-900');
    
    consoleSpy.mockRestore();
  });
});