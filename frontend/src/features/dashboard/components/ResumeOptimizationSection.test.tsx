import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResumeOptimizationSection from './ResumeOptimizationSection';
import { CvAnalysis } from '../../../types/analysis';

// Mock data for testing
const mockResumeOptimizationData: CvAnalysis['resume_optimization'] = {
  bullet_rewrites: [
    { original: 'Managed team', optimized: 'Led a cross-functional team of 5 engineers' },
    { original: 'Did coding', optimized: 'Developed scalable backend APIs using Node.js' },
  ],
  ats_keywords_missing: ['Leadership', 'Node.js', 'API Development'],
  formatting_feedback: 'Consider using a more modern template.',
  general_recommendations: ['Quantify achievements more.', 'Add a professional summary.'],
};

describe('ResumeOptimizationSection Component', () => {
  test('renders nothing when resumeOptimization prop is null', () => {
    const { container } = render(<ResumeOptimizationSection resumeOptimization={null as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when resumeOptimization prop is undefined', () => {
    const { container } = render(<ResumeOptimizationSection resumeOptimization={undefined as any} />); // Cast as any for test
    expect(container.firstChild).toBeNull();
  });

  test('renders section title', () => {
    render(<ResumeOptimizationSection resumeOptimization={mockResumeOptimizationData} />);
    expect(screen.getByText('Resume Optimization Tips')).toBeInTheDocument();
  });

  test('renders bullet rewrites when provided', () => {
    render(<ResumeOptimizationSection resumeOptimization={mockResumeOptimizationData} />);
    expect(screen.getByText('Bullet Point Rewrites')).toBeInTheDocument();
    expect(screen.getByText('Managed team')).toBeInTheDocument();
    expect(screen.getByText('Led a cross-functional team of 5 engineers')).toBeInTheDocument();
    expect(screen.getByText('Did coding')).toBeInTheDocument();
    expect(screen.getByText('Developed scalable backend APIs using Node.js')).toBeInTheDocument();
  });

  test('renders missing ATS keywords when provided', () => {
    render(<ResumeOptimizationSection resumeOptimization={mockResumeOptimizationData} />);
    expect(screen.getByText('Missing ATS Keywords')).toBeInTheDocument();
    expect(screen.getByText('Leadership')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('API Development')).toBeInTheDocument();
  });

  test('renders formatting feedback when provided', () => {
    render(<ResumeOptimizationSection resumeOptimization={mockResumeOptimizationData} />);
    expect(screen.getByText('Formatting Feedback')).toBeInTheDocument();
    expect(screen.getByText('Consider using a more modern template.')).toBeInTheDocument();
  });

  test('renders general recommendations when provided', () => {
    render(<ResumeOptimizationSection resumeOptimization={mockResumeOptimizationData} />);
    expect(screen.getByText('General Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Quantify achievements more.')).toBeInTheDocument();
    expect(screen.getByText('Add a professional summary.')).toBeInTheDocument();
  });

  test('does not render bullet rewrites section if data is empty', () => {
    const dataWithoutBullets = { ...mockResumeOptimizationData, bullet_rewrites: [] };
    render(<ResumeOptimizationSection resumeOptimization={dataWithoutBullets} />);
    expect(screen.queryByText('Bullet Point Rewrites')).not.toBeInTheDocument();
  });

  // Add similar tests for other sections not rendering when data is empty/missing
});
