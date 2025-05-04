import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LearningRoadmapSection from './LearningRoadmapSection';
import { CvAnalysis } from '../../../types/analysis';

// Mock data for testing
const mockLearningRoadmap: CvAnalysis['personalized_learning_roadmap'] = [
  {
    course: 'Advanced React Patterns',
    platform: 'Coursera',
    impact: 'Deepen understanding of React for complex applications.',
    difficulty: 'Advanced',
    duration: '4 weeks',
  },
  {
    course: 'TypeScript Fundamentals',
    platform: 'Udemy',
    impact: 'Improve code quality and maintainability.',
    // Omitting difficulty and duration for testing optional fields
  },
];

describe('LearningRoadmapSection Component', () => {
  test('renders nothing when learningRoadmap prop is null', () => {
    const { container } = render(<LearningRoadmapSection learningRoadmap={null as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when learningRoadmap prop is undefined', () => {
    const { container } = render(<LearningRoadmapSection learningRoadmap={undefined as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when learningRoadmap prop is an empty array', () => {
    const { container } = render(<LearningRoadmapSection learningRoadmap={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders section title', () => {
    render(<LearningRoadmapSection learningRoadmap={mockLearningRoadmap} />);
    expect(screen.getByText('Personalized Learning Roadmap')).toBeInTheDocument();
  });

  test('renders details for each roadmap item', () => {
    render(<LearningRoadmapSection learningRoadmap={mockLearningRoadmap} />);

    // Item 1
    expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
    expect(screen.getByText('Platform: Coursera')).toBeInTheDocument();
    expect(screen.getByText('Deepen understanding of React for complex applications.')).toBeInTheDocument();
    expect(screen.getByText('Difficulty: Advanced')).toBeInTheDocument();
    expect(screen.getByText('Duration: 4 weeks')).toBeInTheDocument();

    // Item 2
    expect(screen.getByText('TypeScript Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Platform: Udemy')).toBeInTheDocument();
    expect(screen.getByText('Improve code quality and maintainability.')).toBeInTheDocument();
  });

  test('does not render difficulty or duration if not provided', () => {
    render(<LearningRoadmapSection learningRoadmap={mockLearningRoadmap} />);

    // Check item 2 which has missing optional fields
    const tsFundamentalsCard = screen.getByText('TypeScript Fundamentals').closest('div');
    expect(tsFundamentalsCard).not.toHaveTextContent('Difficulty:');
    expect(tsFundamentalsCard).not.toHaveTextContent('Duration:');
  });
});
