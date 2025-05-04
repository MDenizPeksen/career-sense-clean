import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalysisSection from './AnalysisSection';
import { CvAnalysis } from '../../../types/analysis';

// Mock data for testing
const mockAnalysisData: CvAnalysis['analysis'] = {
  strengths: ['Strong leadership', 'Excellent communication'],
  improvement_areas: ['Time management'],
  missing_elements: ['Project portfolio link'],
  keyword_optimization: ['Agile', 'Scrum'],
  recommended_roles: ['Project Manager', 'Scrum Master'],
};

describe('AnalysisSection Component', () => {
  test('renders nothing when analysis prop is null', () => {
    const { container } = render(<AnalysisSection analysis={null as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when analysis prop is undefined', () => {
    const { container } = render(<AnalysisSection analysis={undefined as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders section title', () => {
    render(<AnalysisSection analysis={mockAnalysisData} />);
    // Find the h2 heading and check its text content
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('CV Analysis Details');
  });

  test('renders strengths when provided', () => {
    render(<AnalysisSection analysis={mockAnalysisData} />);
    // Find the h3 heading for Strengths
    expect(screen.getByRole('heading', { level: 3, name: /Strengths/i })).toBeInTheDocument();
    expect(screen.getByText('Strong leadership')).toBeInTheDocument();
    expect(screen.getByText('Excellent communication')).toBeInTheDocument();
  });

  test('renders improvement areas when provided', () => {
    render(<AnalysisSection analysis={mockAnalysisData} />);
    // Find the h3 heading for Improvement Areas using the actual text
    expect(screen.getByRole('heading', { level: 3, name: /Improvement Areas/i })).toBeInTheDocument();
    expect(screen.getByText('Time management')).toBeInTheDocument();
  });

  test('renders missing elements when provided', () => {
    render(<AnalysisSection analysis={mockAnalysisData} />);
    // Find the h3 heading for Missing Elements using the actual text
    expect(screen.getByRole('heading', { level: 3, name: /Missing Elements/i })).toBeInTheDocument();
    expect(screen.getByText('Project portfolio link')).toBeInTheDocument();
  });

  test('renders keyword optimization when provided', () => {
    render(<AnalysisSection analysis={mockAnalysisData} />);
    // Find the h3 heading for Keyword Optimization using the actual text
    expect(screen.getByRole('heading', { level: 3, name: /Keyword Optimization/i })).toBeInTheDocument();
    expect(screen.getByText('Agile')).toBeInTheDocument();
    expect(screen.getByText('Scrum')).toBeInTheDocument();
  });

  test('renders recommended roles when provided', () => {
    render(<AnalysisSection analysis={mockAnalysisData} />);
    // Find the h3 heading for Recommended Roles
    expect(screen.getByRole('heading', { level: 3, name: /Recommended Roles/i })).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
    expect(screen.getByText('Scrum Master')).toBeInTheDocument();
  });

  test('does not render strengths section if data is empty', () => {
    const dataWithoutStrengths = { ...mockAnalysisData, strengths: [] };
    render(<AnalysisSection analysis={dataWithoutStrengths} />);
    expect(screen.queryByRole('heading', { level: 3, name: /Strengths/i })).not.toBeInTheDocument();
  });

  // Add similar tests for other sections not rendering when data is empty/missing
  test('does not render improvement areas section if data is empty', () => {
    const dataWithoutImprovements = { ...mockAnalysisData, improvement_areas: [] };
    render(<AnalysisSection analysis={dataWithoutImprovements} />);
    expect(screen.queryByRole('heading', { level: 3, name: /Improvement Areas/i })).not.toBeInTheDocument();
  });

  test('does not render missing elements section if data is empty', () => {
    const dataWithoutMissing = { ...mockAnalysisData, missing_elements: [] };
    render(<AnalysisSection analysis={dataWithoutMissing} />);
    expect(screen.queryByRole('heading', { level: 3, name: /Missing Elements/i })).not.toBeInTheDocument();
  });

  test('does not render keyword optimization section if data is empty', () => {
    const dataWithoutKeywords = { ...mockAnalysisData, keyword_optimization: [] };
    render(<AnalysisSection analysis={dataWithoutKeywords} />);
    expect(screen.queryByRole('heading', { level: 3, name: /Keyword Optimization/i })).not.toBeInTheDocument();
  });

  test('does not render recommended roles section if data is empty', () => {
    const dataWithoutRoles = { ...mockAnalysisData, recommended_roles: [] };
    render(<AnalysisSection analysis={dataWithoutRoles} />);
    expect(screen.queryByRole('heading', { level: 3, name: /Recommended Roles/i })).not.toBeInTheDocument();
  });
});
