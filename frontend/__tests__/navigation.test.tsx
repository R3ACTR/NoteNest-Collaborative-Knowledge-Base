import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserRoleProvider } from '../contexts/UserRoleContext';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import App from '../app/page';

/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

describe('Navigation and Note Access', () => {
  it('renders navigation menu', () => {
    render(
      <UserRoleProvider>
        <WorkspaceProvider>
          <App />
        </WorkspaceProvider>
      </UserRoleProvider>
    );

    expect(screen.getAllByText(/features/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getAllByText(/get started/i).length).toBeGreaterThan(0);
  });

  it('navigates to features section', () => {
    render(
      <UserRoleProvider>
        <WorkspaceProvider>
          <App />
        </WorkspaceProvider>
      </UserRoleProvider>
    );

    const featuresLinks = screen.getAllByRole('link', { name: 'Features' });
    const navFeaturesLink = featuresLinks.find(link => link.getAttribute('href') === '#features');
    expect(navFeaturesLink).toBeInTheDocument();
  });

  it('navigates to login page', async () => {
    const user = userEvent.setup();

    render(
      <UserRoleProvider>
        <WorkspaceProvider>
          <App />
        </WorkspaceProvider>
      </UserRoleProvider>
    );

    const loginLink = screen.getByText(/login/i);
    await user.click(loginLink);

    // In a real app, this would navigate, but for testing we check the link
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('shows get started button', () => {
    render(
      <UserRoleProvider>
        <WorkspaceProvider>
          <App />
        </WorkspaceProvider>
      </UserRoleProvider>
    );

    const getStartedButtons = screen.getAllByText(/get started/i);
    expect(getStartedButtons.length).toBeGreaterThan(0);
  });
});
