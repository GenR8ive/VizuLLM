import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import CoverLetter from './component';
import sampleData from './sample-data.json';

describe('<CoverLetter />', () => {
  const props = {
    schema: null,
    data: sampleData
  };

  it('should render the cover letter with sample data', () => {
    render(<CoverLetter {...props} />);

    // Check if personal information is rendered
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('sarah.johnson@email.com')).toBeInTheDocument();
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();

    // Check if company information is rendered
    expect(screen.getByText('Michael Rodriguez')).toBeInTheDocument();
    expect(screen.getByText('TechCorp Solutions')).toBeInTheDocument();

    // Check if job title is rendered
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();

    // Check if greeting is rendered
    expect(screen.getByText('Dear Mr. Rodriguez,')).toBeInTheDocument();

    // Check if content sections are rendered
    expect(screen.getByText(/I am writing to express my strong interest/)).toBeInTheDocument();
    expect(screen.getByText(/In my current role at InnovateTech/)).toBeInTheDocument();
    expect(screen.getByText(/I am confident that my technical skills/)).toBeInTheDocument();

    // Check if signature is rendered
    expect(screen.getByText('Sincerely,')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
  });

  it('should render with no data (using sample data as fallback)', () => {
    render(<CoverLetter schema={null} data={null} />);

    // Should still render the sample data
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('TechCorp Solutions')).toBeInTheDocument();
  });

  it('should have proper print-ready styling', () => {
    const { container } = render(<CoverLetter {...props} />);

    // Check for print-specific classes
    expect(container.firstChild).toHaveClass('min-h-screen', 'bg-white', 'p-8', 'print:p-0');
    
    // Check for the main content container
    const mainContainer = container.querySelector('.max-w-4xl');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('shadow-lg', 'print:shadow-none');
  });
}); 