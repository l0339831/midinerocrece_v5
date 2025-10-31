/**
 * Core domain types for Mi Dinero Crece CSAT data analysis application.
 * These types define the shape of data throughout the application's import,
 * editing, and visualization flows.
 * @module types
 */

/**
 * Workflow priority level for categorizing customer feedback.
 * Used in the RxC (Recurrence × Criticality) matrix calculations.
 * @readonly
 */
export type WfLevel = 'Baja' | 'Media' | 'Alta' | 'Sin asignar';

/**
 * Implementation status of a project or initiative.
 * Tracks the progression from backlog through development to production.
 * @readonly
 */
export type Estado = 
  | 'En Backlog de tribu'    // In tribe's backlog
  | 'En desarrollo'          // Currently in development
  | 'Se hizo Diagrama de flujo'  // Flow diagram completed
  | 'Se hizo EQC'           // Quality control completed
  | 'En producción'         // Deployed to production
  | 'Descartado'            // Discarded/won't implement
  | 'Sin asignar';          // Not yet categorized

/**
 * Represents a single row of customer feedback data.
 * Core data structure for the application's bulk editing and categorization features.
 */
export interface Row {
  /** Unique identifier for the row, used as key in IndexedDB */
  id: string;
  
  /** 
   * Original data from imported CSV/JSON file.
   * Preserves all columns from source file for reference.
   * Special columns like `driver_detractor`, `driver_neutro`, `driver_promotor`
   * are used to pre-populate the driver field.
   */
  src: Record<string, unknown>;
  
  /**
   * Categorization label for grouping related feedback.
   * Can be edited in bulk via the table interface.
   * Uses datalist for suggestions while allowing free-form input.
   * @optional
   */
  driver?: string;
  
  /**
   * Workflow metadata including priority calculations and status.
   * Updated through the UI but calculations (like RxC) are automatic.
   */
  workflow: Record<string, unknown>;
}

/**
 * Collection of related customer feedback rows.
 * Main data structure stored in IndexedDB and visualized in Sankey diagrams.
 */
export interface Dataset {
  /** Unique identifier for the dataset */
  id: string;
  
  /** Display name for the dataset */
  name: string;
  
  /** Array of feedback entries */
  rows: Row[];
  
  /** Unix timestamp of dataset creation */
  createdAt: number;
  
  /** 
   * Unix timestamp of last modification.
   * MUST be updated on every mutation through Zustand stores.
   */
  updatedAt: number;
}

/**
 * Project list maintained in IndexedDB.
 * Used to track available projects for status assignment.
 */
export interface ProjectList {
  /** Always 'projects' - used as singleton key in IndexedDB */
  id: string;
  
  /** List of unique project identifiers */
  items: string[];
  
  /** 
   * Unix timestamp of last modification.
   * Updated whenever projects are added/removed.
   */
  updatedAt: number;
}