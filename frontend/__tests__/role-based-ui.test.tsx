import { render, screen } from '@testing-library/react';
import { UserRoleProvider } from '../contexts/UserRoleContext';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import App from '../app/page';

describe('Role-Based UI Rendering', () => {
  it('renders app with user role context', () => {
    render(
      <UserRoleProvider>
        <WorkspaceProvider>
          <App />
        </WorkspaceProvider>
      </UserRoleProvider>
    );

    expect(screen.getByText(/welcome to notenest/i)).toBeInTheDocument();
  });

  it('renders navigation based on user role', () => {
    render(
      <UserRoleProvider>
        <WorkspaceProvider>
          <App />
        </WorkspaceProvider>
      </UserRoleProvider>
    );

    // Basic navigation should be present
    expect(screen.getAllByText(/features/i).length).toBeGreaterThan(0);
  });
});
