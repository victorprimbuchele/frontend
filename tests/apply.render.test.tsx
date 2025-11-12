import { render, screen } from '@testing-library/react';
import ApplyPage from '../app/(public)/apply/page';

describe('ApplyPage', () => {
  it('renders form fields', () => {
    render(<ApplyPage />);
    expect(screen.getByPlaceholderText('Nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Por que você quer participar?')).toBeInTheDocument();
  });
});


