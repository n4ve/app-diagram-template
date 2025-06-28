// Core data types
export interface PageData {
  name: string;
  description: string;
  apis: string[];
}

export interface ServerData {
  name: string;
  description: string;
  apis: string[];
}

export interface PagesConfig {
  [pageId: string]: PageData;
}

export interface ServersConfig {
  [serverId: string]: ServerData;
}

// Position and movement types
export interface Position {
  x: number;
  y: number;
}

export interface BoundingRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface MovementVector {
  x: number;
  y: number;
}

// Relationship types
export interface RelatedElements {
  pages: HTMLElement[];
  servers: HTMLElement[];
  backends: HTMLElement[];
  apiItems: HTMLElement[];
}

export interface CardRelationship {
  element: HTMLElement;
  relationship: 'direct' | 'indirect' | 'none';
  apis: string[];
}

// Animation types
export interface AnimationState {
  isAnimating: boolean;
  startTime: number;
  duration: number;
}

export interface CardState {
  element: HTMLElement;
  originalPosition: Position;
  currentPosition: Position;
  state: 'normal' | 'active' | 'highlighted' | 'dimmed';
}

// Connection types
export interface ConnectionInfo {
  from: HTMLElement;
  to: HTMLElement;
  method: string;
  endpoint: string;
  color: string;
  dashPattern: string;
}

export interface ConnectionPair {
  from: HTMLElement;
  to: HTMLElement;
  type: ConnectionType;
  method?: string;
  api?: string;
  color?: string;
}

export interface SVGConnectionData {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  strokeDasharray: string;
  method: string;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// Connection Types
export enum ConnectionType {
  PAGE_TO_SERVER = 'page-to-server',
  SERVER_TO_BACKEND = 'server-to-backend'
}

// Manager interface types
export interface ManagerInitialization {
  initialize(): boolean;
}

export interface DiagramDependencies {
  connectionManager?: ConnectionManager;
  relationshipManager?: CardRelationshipManager;
  positionManager?: CardPositionManager;
  animationManager?: CardAnimationManager;
  hoverEventManager?: HoverEventManager;
}

// Event types
export interface HoverEventData {
  target: HTMLElement;
  relatedElements: RelatedElements;
  timestamp: number;
}

export interface AnimationEventData {
  element: HTMLElement;
  animationType: 'move' | 'scale' | 'fade' | 'highlight';
  startPosition?: Position;
  endPosition?: Position;
  duration: number;
}

// Configuration types
export interface DiagramConfig {
  animationDuration: number;
  hoverDelay: number;
  zoomSensitivity: number;
  boundaryPadding: number;
  maxZoom: number;
  minZoom: number;
}

export interface StyleConfig {
  colors: {
    [key in HttpMethod]: string;
  };
  dashPatterns: {
    [key in HttpMethod]: string;
  };
  zIndex: {
    normal: number;
    highlighted: number;
    active: number;
    hidden: number;
  };
}

// Forward declarations for circular dependencies
export interface ConnectionManager extends ManagerInitialization {
  getMethodColor(method: string): string;
  getMethodDashPattern(method: string): string;
  createConnectionLine(fromElement: HTMLElement, toElement: HTMLElement, color?: string, method?: string): SVGElement | null;
  clearConnections(): void;
  drawConnectionsForCurrentState(): void;
}

export interface CardRelationshipManager extends ManagerInitialization {
  findRelatedCards(hoveredCard: HTMLElement): RelatedElements;
  setActiveClasses(hoveredCard: HTMLElement, relatedElements: RelatedElements): void;
  clearActiveClasses(): void;
  getUniqueRelationPairs(hoveredCard: HTMLElement, relatedElements: RelatedElements): ConnectionPair[];
}

export interface CardPositionManager extends ManagerInitialization {
  getCurrentZoom(): number;
  calculateDistance(element1: HTMLElement, element2: HTMLElement): number;
  getProgressiveMoveRatio(distance: number, isTargetingUnrelated?: boolean): number;
  constrainToBounds(x: number, y: number, element: HTMLElement): Position;
  calculateMovementToward(movingCard: HTMLElement, targetCard: HTMLElement, ratio: number): Position;
  findNearestUnrelatedCard(relatedCard: HTMLElement, unrelatedCards: HTMLElement[]): { card: HTMLElement | null; distance: number; };
  ensureMinimumMovement(moveX: number, moveY: number, isTargetingUnrelated?: boolean): MovementVector;
}

export interface CardAnimationManager extends ManagerInitialization {
  repositionRelatedCards(hoveredCard: HTMLElement, relatedElements: RelatedElements): Promise<void>;
  resetAllCards(): Promise<void>;
}

export interface HoverEventManager extends ManagerInitialization {
  handleCardHover(card: HTMLElement): void;
  resetAllCards(): void;
  drawConnection?(connectionPair: ConnectionPair): void;
}

export interface DiagramController {
  initialize(): Promise<boolean>;
  getConnectionManager(): ConnectionManager;
  getRelationshipManager(): CardRelationshipManager;
  getPositionManager(): CardPositionManager;
  getAnimationManager(): CardAnimationManager;
  getHoverEventManager(): HoverEventManager;
}

// Global window interface extension
declare global {
  interface Window {
    diagramController?: DiagramController;
  }
}