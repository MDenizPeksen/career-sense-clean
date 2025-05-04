import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StarInterviewSection from './StarInterviewSection';
import { CvAnalysis } from '../../../types/analysis';

// Mock data for testing
const mockStarStories: CvAnalysis['star_interview_stories'] = [
  {
    title: 'Project Leadership Example',
    situation: 'Project deadline was approaching.',
    task: 'Needed to coordinate team efforts.',
    action: 'Held daily standups and delegated tasks.',
    result: 'Project completed on time and under budget.',
  },
  {
    situation: 'Handled customer complaint.',
    task: 'Resolve the issue quickly.',
    action: 'Listened, apologized, and offered a solution.',
    result: 'Customer was satisfied and remained loyal.',
  },
];

describe('StarInterviewSection Component', () => {
  test('renders nothing when starStories prop is null', () => {
    const { container } = render(<StarInterviewSection starStories={null as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when starStories prop is undefined', () => {
    const { container } = render(<StarInterviewSection starStories={undefined as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when starStories prop is an empty array', () => {
    const { container } = render(<StarInterviewSection starStories={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders section title', () => {
    render(<StarInterviewSection starStories={mockStarStories} />);
    expect(screen.getByText('STAR Interview Stories')).toBeInTheDocument();
  });

  test('renders story title when provided', () => {
    render(<StarInterviewSection starStories={mockStarStories} />);
    expect(screen.getByText('Project Leadership Example')).toBeInTheDocument();
  });

  test('renders situation, task, action, and result for each story', () => {
    render(<StarInterviewSection starStories={mockStarStories} />);

    // Story 1
    expect(screen.getByText('Project deadline was approaching.')).toBeInTheDocument();
    expect(screen.getByText('Needed to coordinate team efforts.')).toBeInTheDocument();
    expect(screen.getByText('Held daily standups and delegated tasks.')).toBeInTheDocument();
    expect(screen.getByText('Project completed on time and under budget.')).toBeInTheDocument();

    // Story 2 (check one part)
    expect(screen.getByText('Handled customer complaint.')).toBeInTheDocument();
    expect(screen.getByText('Customer was satisfied and remained loyal.')).toBeInTheDocument();
  });

  test('does not render title if not provided in story data', () => {
    const storyWithoutTitle = [
      {
        situation: 'Situation without title',
        task: 'Task without title',
        action: 'Action without title',
        result: 'Result without title',
      },
    ];
    render(<StarInterviewSection starStories={storyWithoutTitle} />);
    // Check that structure renders, but no h4 title element specifically
    expect(screen.getByText('Situation without title')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument();
  });
});
