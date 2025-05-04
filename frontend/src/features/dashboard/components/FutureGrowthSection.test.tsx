import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FutureGrowthSection from './FutureGrowthSection';
import { CvAnalysis } from '../../../types/analysis';

// Mock data for testing
const mockFutureGrowthData: CvAnalysis['future_growth_potential'] = {
  career_growth_trajectory: 'Strong potential for senior roles within 3-5 years.',
  skills_forecast: ['Cloud Computing (AWS/Azure)', 'AI/ML Fundamentals', 'Advanced Python'],
  industry_insights: [
    'Increased demand for cloud skills.',
    'AI adoption is accelerating across industries.',
  ],
};

describe('FutureGrowthSection Component', () => {
  test('renders nothing when futureGrowth prop is null', () => {
    const { container } = render(<FutureGrowthSection futureGrowth={null as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when futureGrowth prop is undefined', () => {
    const { container } = render(<FutureGrowthSection futureGrowth={undefined as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders section title', () => {
    render(<FutureGrowthSection futureGrowth={mockFutureGrowthData} />);
    expect(screen.getByText('Future Growth Potential')).toBeInTheDocument();
  });

  test('renders career growth trajectory when provided', () => {
    render(<FutureGrowthSection futureGrowth={mockFutureGrowthData} />);
    expect(screen.getByText('Career Growth Trajectory')).toBeInTheDocument();
    expect(screen.getByText('Strong potential for senior roles within 3-5 years.')).toBeInTheDocument();
  });

  test('renders skills forecast when provided', () => {
    render(<FutureGrowthSection futureGrowth={mockFutureGrowthData} />);
    expect(screen.getByText('Skills Forecast')).toBeInTheDocument();
    expect(screen.getByText('Cloud Computing (AWS/Azure)')).toBeInTheDocument();
    expect(screen.getByText('AI/ML Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Advanced Python')).toBeInTheDocument();
  });

  test('renders industry insights when provided', () => {
    render(<FutureGrowthSection futureGrowth={mockFutureGrowthData} />);
    expect(screen.getByText('Industry Insights')).toBeInTheDocument();
    expect(screen.getByText('Increased demand for cloud skills.')).toBeInTheDocument();
    expect(screen.getByText('AI adoption is accelerating across industries.')).toBeInTheDocument();
  });

  test('does not render trajectory section if data is missing', () => {
    const dataWithoutTrajectory = { ...mockFutureGrowthData, career_growth_trajectory: undefined };
    render(<FutureGrowthSection futureGrowth={dataWithoutTrajectory as any} />);
    expect(screen.queryByText('Career Growth Trajectory')).not.toBeInTheDocument();
  });

  test('does not render skills forecast section if data is empty', () => {
    const dataWithoutSkills = { ...mockFutureGrowthData, skills_forecast: [] };
    render(<FutureGrowthSection futureGrowth={dataWithoutSkills} />);
    expect(screen.queryByText('Skills Forecast')).not.toBeInTheDocument();
  });

  // Add similar test for industry insights not rendering when empty
});
