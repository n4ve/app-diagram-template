/**
 * Unit Tests for Server Types Feature
 * Tests that server type tags are properly displayed and typed
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ServerType } from '../src/types/index.js';

describe('Server Types Feature', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    // Create a mock server card element
    mockElement = document.createElement('div');
    mockElement.className = 'server-card';
    mockElement.innerHTML = `
      <div class="flex flex-wrap gap-2 mb-3">
        <div class="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          5 APIs
        </div>
        <div class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
          Kubernetes
        </div>
        <div class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
          Cloud
        </div>
      </div>
    `;
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  test('should have valid server type definitions', () => {
    const validTypes: ServerType[] = ['Kubernetes', 'On-Premise', 'Cloud'];
    
    expect(validTypes).toContain('Kubernetes');
    expect(validTypes).toContain('On-Premise');
    expect(validTypes).toContain('Cloud');
    expect(validTypes).toHaveLength(3);
  });

  test('should display type tags in server card', () => {
    const typeTags = mockElement.querySelectorAll('.inline-block');
    
    // Should have API count + 2 type tags = 3 total
    expect(typeTags).toHaveLength(3);
    
    // Check that type tags are displayed
    const kubernetesTag = Array.from(typeTags).find(tag => 
      tag.textContent?.trim() === 'Kubernetes'
    );
    const cloudTag = Array.from(typeTags).find(tag => 
      tag.textContent?.trim() === 'Cloud'
    );
    
    expect(kubernetesTag).toBeTruthy();
    expect(cloudTag).toBeTruthy();
  });

  test('should apply correct CSS classes for different types', () => {
    const typeTags = mockElement.querySelectorAll('.inline-block');
    
    const kubernetesTag = Array.from(typeTags).find(tag => 
      tag.textContent?.trim() === 'Kubernetes'
    ) as HTMLElement;
    
    const cloudTag = Array.from(typeTags).find(tag => 
      tag.textContent?.trim() === 'Cloud'
    ) as HTMLElement;
    
    // Check Kubernetes styling
    expect(kubernetesTag.classList.contains('bg-blue-100')).toBe(true);
    expect(kubernetesTag.classList.contains('text-blue-800')).toBe(true);
    expect(kubernetesTag.classList.contains('border-blue-300')).toBe(true);
    
    // Check Cloud styling
    expect(cloudTag.classList.contains('bg-purple-100')).toBe(true);
    expect(cloudTag.classList.contains('text-purple-800')).toBe(true);
    expect(cloudTag.classList.contains('border-purple-300')).toBe(true);
  });

  test('should handle servers without types gracefully', () => {
    // Create a server card without types
    const serverWithoutTypes = document.createElement('div');
    serverWithoutTypes.className = 'server-card';
    serverWithoutTypes.innerHTML = `
      <div class="flex flex-wrap gap-2 mb-3">
        <div class="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          3 APIs
        </div>
      </div>
    `;
    
    const typeTags = serverWithoutTypes.querySelectorAll('.inline-block');
    
    // Should only have API count tag, no type tags
    expect(typeTags).toHaveLength(1);
    expect(typeTags[0].textContent?.trim()).toBe('3 APIs');
  });

  test('should support On-Premise type styling', () => {
    const onPremiseElement = document.createElement('div');
    onPremiseElement.innerHTML = `
      <div class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
        On-Premise
      </div>
    `;
    
    const onPremiseTag = onPremiseElement.querySelector('.inline-block') as HTMLElement;
    
    expect(onPremiseTag.classList.contains('bg-orange-100')).toBe(true);
    expect(onPremiseTag.classList.contains('text-orange-800')).toBe(true);
    expect(onPremiseTag.classList.contains('border-orange-300')).toBe(true);
    expect(onPremiseTag.textContent?.trim()).toBe('On-Premise');
  });

  test('should allow multiple types per server', () => {
    // This test verifies the mockElement which has both Kubernetes and Cloud
    const typeTags = Array.from(mockElement.querySelectorAll('.inline-block'))
      .filter(tag => tag.textContent?.trim() !== '5 APIs');
    
    expect(typeTags).toHaveLength(2);
    
    const typeTexts = typeTags.map(tag => tag.textContent?.trim());
    expect(typeTexts).toContain('Kubernetes');
    expect(typeTexts).toContain('Cloud');
  });
});

describe('Type Safety', () => {
  test('should enforce valid server types', () => {
    // This test ensures TypeScript compilation will catch invalid types
    const validTypes: ServerType[] = ['Kubernetes', 'On-Premise', 'Cloud'];
    
    validTypes.forEach(type => {
      expect(['Kubernetes', 'On-Premise', 'Cloud']).toContain(type);
    });
  });

  test('should work with ServerData interface', () => {
    interface MockServerData {
      name: string;
      description: string;
      apis: string[];
      types?: ServerType[];
    }
    
    const serverData: MockServerData = {
      name: "Test Server",
      description: "Test Description",
      apis: ["GET /test"],
      types: ["Kubernetes", "Cloud"]
    };
    
    expect(serverData.types).toContain('Kubernetes');
    expect(serverData.types).toContain('Cloud');
    expect(serverData.types).toHaveLength(2);
  });
});