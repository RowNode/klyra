/**
 * API Client Utilities
 * Helper functions untuk fetch data dari Next.js API Routes
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Generic fetch wrapper dengan error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith("/") ? `${API_BASE_URL}${endpoint}` : endpoint;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Quest API Functions
 */
export const questAPI = {
  /**
   * Get all active quests
   * @param participant - Optional wallet address to filter quests
   */
  async getQuests(participant?: string) {
    const params = participant ? `?participant=${participant}` : "";
    return fetchAPI<{ quests: any[] }>(`/api/quests${params}`);
  },

  /**
   * Get quest by ID
   */
  async getQuestById(id: string | number) {
    return fetchAPI<{ quest: any }>(`/api/quests/${id}`);
  },

  /**
   * Get quest progress for a participant
   */
  async getQuestProgress(questId: string | number, participant: string) {
    return fetchAPI<{ progress: any }>(
      `/api/quests/${questId}/progress/${participant}`
    );
  },
};

/**
 * User API Functions
 */
export const userAPI = {
  /**
   * Get user stats (XP, level, rank, etc)
   */
  async getStats(address: string) {
    return fetchAPI<{ stats: any }>(`/api/quests/users/${address}/stats`);
  },

  /**
   * Save user profile (name, email)
   */
  async saveProfile(address: string, data: { name: string; email: string }) {
    return fetchAPI<{ success: boolean; message: string; user: any }>(
      `/api/quests/users/${address}/profile`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Get user's completed quests
   */
  async getCompletedQuests(address: string) {
    return fetchAPI<{ quests: any[] }>(
      `/api/quests/users/${address}/completed`
    );
  },

  /**
   * Get user rewards
   */
  async getRewards(address: string) {
    return fetchAPI<{ rewards: any[]; totalKlyra: string }>(
      `/api/quests/users/${address}/rewards`
    );
  },

  /**
   * Update user avatar
   */
  async updateAvatar(address: string, avatarUrl: string) {
    return fetchAPI<{ success: boolean; avatar_url: string }>(
      `/api/quests/users/${address}/avatar`,
      {
        method: "POST",
        body: JSON.stringify({ avatar_url: avatarUrl }),
      }
    );
  },
};

/**
 * Leaderboard API Functions
 */
export const leaderboardAPI = {
  /**
   * Get leaderboard
   * @param limit - Maximum number of entries (default: 100)
   */
  async getLeaderboard(limit?: number) {
    const params = limit ? `?limit=${limit}` : "";
    return fetchAPI<{ leaderboard: any[] }>(`/api/quests/leaderboard${params}`);
  },
};

/**
 * AI API Functions
 */
export const aiAPI = {
  /**
   * Get supported protocols
   */
  async getProtocols() {
    return fetchAPI<{ protocols: any[] }>(`/api/ai/protocols`);
  },

  /**
   * Generate quest with AI
   */
  async generateQuest(data: any) {
    return fetchAPI<{ quest: any; onChainResult?: any }>(`/api/ai/quests`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
