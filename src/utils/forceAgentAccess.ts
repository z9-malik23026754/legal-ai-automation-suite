
/**
 * Utility to force agent access regardless of subscription status
 * This is a last resort to ensure users don't get stuck
 */

// Function to check if we should force access based on URL or localStorage
export const shouldForceAccess = (): boolean => {
  // Check URL parameters
  try {
    const url = new URL(window.location.href);
    const fromSuccess = url.searchParams.get('from') === 'success';
    const forceAccess = url.searchParams.get('access') === 'true';
    
    // If URL indicates success, store this in localStorage
    if (fromSuccess || forceAccess) {
      localStorage.setItem('forceAgentAccess', 'true');
      return true;
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  
  // Check localStorage for previously forced access
  return localStorage.getItem('forceAgentAccess') === 'true';
};

// Function to force access in the application
export const forceAgentAccess = (): void => {
  localStorage.setItem('forceAgentAccess', 'true');
};

export default {
  shouldForceAccess,
  forceAgentAccess
};
