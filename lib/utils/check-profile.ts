/**
 * Utility function to check if user profile is complete
 * Profile is complete if user has name and email
 */

export async function checkProfileComplete(address: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/quests/users/${address}/stats`);
    
    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const stats = data.stats;

    // Profile is complete if user has both name and email
    return !!(stats?.name && stats?.email);
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return false;
  }
}
