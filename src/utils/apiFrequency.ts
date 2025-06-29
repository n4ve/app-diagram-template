import type { NestedGroupsConfig } from '../types/index.js';
import pagesData from '../data/pages.json';

export interface ApiFrequencyData {
  [api: string]: number;
}

export interface ServerApiFrequency {
  [serverId: string]: ApiFrequencyData;
}

/**
 * Calculate API call frequency based on pages.json usage
 * Returns how many frontend pages use each API endpoint
 */
export function calculateApiFrequency(): ServerApiFrequency {
  const serverApiFrequency: ServerApiFrequency = {};
  const { groups } = pagesData as NestedGroupsConfig;
  
  // Count how many pages use each API (iterate through nested structure)
  Object.values(groups).forEach(group => {
    Object.values(group.pages).forEach(page => {
      page.apis.forEach(api => {
        const [serverName, apiEndpoint] = api.split(':');
        
        if (!serverApiFrequency[serverName]) {
          serverApiFrequency[serverName] = {};
        }
        
        serverApiFrequency[serverName][apiEndpoint] = 
          (serverApiFrequency[serverName][apiEndpoint] || 0) + 1;
      });
    });
  });
  
  return serverApiFrequency;
}

/**
 * Get API frequency data for a specific server
 */
export function getServerApiFrequency(serverId: string): ApiFrequencyData {
  const allFrequencies = calculateApiFrequency();
  return allFrequencies[serverId] || {};
}

/**
 * Sort APIs by usage frequency (most used first)
 */
export function sortApisByFrequency(apis: string[], frequency: ApiFrequencyData): string[] {
  return apis.sort((a, b) => {
    const aUsage = frequency[a] || 0;
    const bUsage = frequency[b] || 0;
    return bUsage - aUsage;
  });
}

/**
 * Get total page connections for a server
 */
export function getTotalPageConnections(serverId: string): number {
  const frequency = getServerApiFrequency(serverId);
  return Object.values(frequency).reduce((sum, count) => sum + count, 0);
}

/**
 * Check if API is the most used for a server
 */
export function isMostUsedApi(api: string, serverId: string): boolean {
  const frequency = getServerApiFrequency(serverId);
  const maxUsage = Math.max(...Object.values(frequency));
  return frequency[api] === maxUsage && maxUsage > 0;
}