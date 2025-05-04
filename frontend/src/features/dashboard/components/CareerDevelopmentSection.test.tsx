import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CareerDevelopmentSection from './CareerDevelopmentSection';
import { CvAnalysis } from '../../../types/analysis';

// Mock data for testing
const mockCareerInsights: CvAnalysis['career_development_insights'] = {
  strengths_leverage: 'Focus on leading projects to highlight leadership skills.',
  networking_strategy: 'Attend industry meetups and connect with speakers.',
  personal_branding_tips: 'Update LinkedIn profile regularly and share relevant content.',
};

describe('CareerDevelopmentSection Component', () => {
  test('renders nothing when careerInsights prop is null', () => {
    const { container } = render(<CareerDevelopmentSection careerInsights={null as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when careerInsights prop is undefined', () => {
    const { container } = render(<CareerDevelopmentSection careerInsights={undefined as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders section title', () => {
    render(<CareerDevelopmentSection careerInsights={mockCareerInsights} />);
    expect(screen.getByText('Career Development Insights')).toBeInTheDocument();
  });

  test('renders strengths leverage advice when provided', () => {
    render(<CareerDevelopmentSection careerInsights={mockCareerInsights} />);
    expect(screen.getByText('Leveraging Your Strengths')).toBeInTheDocument();
    expect(screen.getByText('Focus on leading projects to highlight leadership skills.')).toBeInTheDocument();
  });

  test('renders networking strategy advice when provided', () => {
    render(<CareerDevelopmentSection careerInsights={mockCareerInsights} />);
    expect(screen.getByText('Networking Strategy')).toBeInTheDocument();
    expect(screen.getByText('Attend industry meetups and connect with speakers.')).toBeInTheDocument();
  });

  test('renders personal branding tips when provided', () => {
    render(<CareerDevelopmentSection careerInsights={mockCareerInsights} />);
    expect(screen.getByText('Personal Branding Tips')).toBeInTheDocument();
    expect(screen.getByText('Update LinkedIn profile regularly and share relevant content.')).toBeInTheDocument();
  });

  test('does not render strengths leverage section if data is missing', () => {
    const dataWithoutStrengths = { ...mockCareerInsights, strengths_leverage: undefined };
    render(<CareerDevelopmentSection careerInsights={dataWithoutStrengths as any} />);
    expect(screen.queryByText('Leveraging Your Strengths')).not.toBeInTheDocument();
  });

  // Add similar tests for other sections not rendering when data is missing
});
