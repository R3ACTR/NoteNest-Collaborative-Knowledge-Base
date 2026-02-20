import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormInput from '../components/ui/FormInput';

describe('FormInput', () => {
  it('renders with label', () => {
    render(<FormInput label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<FormInput placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<FormInput helperText="Helper message" />);
    expect(screen.getByText('Helper message')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<FormInput error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('shows error instead of helper text when both provided', () => {
    render(<FormInput helperText="Helper" error="Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
  });

  it('handles input changes', async () => {
    const user = userEvent.setup();
    let value = '';
    render(
      <FormInput
        onChange={(e) => { value = e.target.value; }}
      />
    );
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(value).toBe('hello');
  });

  it('can be disabled', () => {
    render(<FormInput disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('sets aria-invalid when error is present', () => {
    render(<FormInput error="Error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    render(<FormInput />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });
});
