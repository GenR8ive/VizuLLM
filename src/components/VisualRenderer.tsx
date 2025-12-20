import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { z } from 'zod';
import { zodToJsonSchema } from "zod-to-json-schema";
import visuals from '../../visuals/list.json';

interface VisualComponent {
  name: string;
  slug: string;
  author: string;
  description: string;
  schema: string;
  componentPath: string;
}

interface VisualRendererProps {
  onError?: (error: string) => void;
}

interface ComponentProps {
  schema: z.ZodSchema | null;
  data?: Record<string, unknown> | null;
}

// Component registry for dynamic loading
const componentRegistry: Record<string, React.ComponentType<ComponentProps>> = {};

const registerComponent = (slug: string, component: React.ComponentType<ComponentProps>) => {
  componentRegistry[slug] = component;
};

// Extend Window interface for global function
declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<ComponentProps>) => void;
  }
}

// Export for components to use
window.__registerVisualComponent = registerComponent;

const VisualRenderer: React.FC<VisualRendererProps> = ({ onError }) => {
  const { slug } = useParams<{ slug: string }>();

  const [visual, setVisual] = useState<VisualComponent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [Component, setComponent] = useState<React.ComponentType<ComponentProps> | null>(null);
  const [schema, setSchema] = useState<z.ZodSchema | null>(null);
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [copiedIcon, setCopiedIcon] = useState(false);
  const [componentSize, setComponentSize] = useState({ width: '100%', height: '100%' });
  const [isDirty, setIsDirty] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [preventPageBreaks, setPreventPageBreaks] = useState(false);
  const [editedHTML, setEditedHTML] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  // Set JSON output when schema changes
  useEffect(() => {
    if (schema) {
      try {
        console.log('Processing schema:', schema);
        console.log('Schema type:', typeof schema);
        console.log('Schema has parse method:', 'parse' in schema);

        // Check if schema is a valid Zod schema
        if (typeof schema === 'object' && schema !== null && 'parse' in schema) {
          console.log('Converting schema to JSON...');
          const jsonSchema = zodToJsonSchema(schema, "Schema");
          console.log('JSON schema result:', jsonSchema);
          const properties = (jsonSchema.definitions!.Schema as Record<string, unknown>).properties || {};
          const required = (jsonSchema.definitions!.Schema as Record<string, unknown>).required || [];
          setJsonOutput(JSON.stringify({ properties, required }, null, 2));
        } else {
          console.warn('Schema is not a valid Zod schema:', schema);
          setJsonOutput('');
        }
      } catch (error) {
        console.error('Error converting schema to JSON:', error);
        setJsonOutput('');
      }
    } else {
      setJsonOutput('');
    }
  }, [schema]);

  useEffect(() => {
    if (schema) {
      try {
        // Check if schema is a valid Zod schema before converting
        if (typeof schema === 'object' && schema !== null && 'parse' in schema) {
          console.log(zodToJsonSchema(schema, "Schema"));
        } else {
          console.warn('Schema is not a valid Zod schema for logging:', schema);
        }
      } catch (error) {
        console.error('Error in schema logging:', error);
      }
    }
  }, [schema]);

  const componentRef = useRef<HTMLDivElement>(null);
  const fullScreenRef = useRef<HTMLDivElement>(null);
  const originalContentRef = useRef<string>('');
  const activeEditElementRef = useRef<HTMLElement | null>(null);

  // Helper function to find the actual component content div
  const getComponentContent = (container: HTMLElement | null): HTMLElement | null => {
    if (!container) return null;
    // Check if container itself has the attribute (normal view)
    if (container.hasAttribute('data-component-content')) {
      return container;
    }
    // Otherwise find the nested component div (fullscreen view)
    const componentDiv = container.querySelector('[data-component-content]') as HTMLElement;
    return componentDiv || container;
  };

  // Setup hover, single-click context menu, and double-click editing
  useEffect(() => {
    // Clean up any old dynamically injected styles from previous HMR
    const oldStyles = document.getElementById('vizullm-edit-styles');
    if (oldStyles) oldStyles.remove();
    
    const container = isFullScreen ? fullScreenRef.current : componentRef.current;
    if (!container || !Component) return;

    let clickTimer: ReturnType<typeof setTimeout> | null = null;

    const closeContextMenu = () => {
      const existingMenu = document.querySelector('.vizullm-context-menu');
      if (existingMenu) {
        existingMenu.remove();
      }
    };

    // Editing helper functions - defined early for use in context menu
    const handleInput = () => {
      setIsDirty(true);
    };

    const updateEditedHTML = () => {
      // Store the current HTML in state to prevent React from overwriting edits
      const container = isFullScreen ? fullScreenRef.current : componentRef.current;
      const componentContent = getComponentContent(container);
      if (componentContent) {
        setEditedHTML(componentContent.innerHTML);
      }
    };

    const syncContentToOtherRef = () => {
      // Sync content to the other ref to keep both views in sync
      if (isFullScreen) {
        // In fullscreen: sync to componentRef
        const sourceContent = getComponentContent(fullScreenRef.current);
        const targetContent = getComponentContent(componentRef.current);
        if (sourceContent && targetContent) {
          targetContent.innerHTML = sourceContent.innerHTML;
        }
      } else {
        // In normal view: sync to fullScreenRef
        const sourceContent = getComponentContent(componentRef.current);
        const targetContent = getComponentContent(fullScreenRef.current);
        if (sourceContent && targetContent) {
          targetContent.innerHTML = sourceContent.innerHTML;
        }
      }
      // Update editedHTML state after syncing
      updateEditedHTML();
    };

    const finishEditing = (element: HTMLElement) => {
      element.removeAttribute('contenteditable');
      element.classList.remove('vizullm-editing');
      element.classList.add('vizullm-hoverable');
      
      // Normalize whitespace
      if (element.textContent) {
        const trimmed = element.textContent.trim();
        if (trimmed !== element.textContent) {
          element.textContent = trimmed;
        }
      }
      
      activeEditElementRef.current = null;
      
      // Sync content to the other ref after editing
      syncContentToOtherRef();
      // Update editedHTML state
      updateEditedHTML();
    };

    const handleBlur = (e: Event) => {
      const target = e.target as HTMLElement;
      finishEditing(target);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
        (e.target as HTMLElement).blur();
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement;
        const isBlockElement = ['P', 'DIV', 'LI', 'TD', 'TH'].includes(target.tagName);
        if (!isBlockElement) {
          e.preventDefault();
          target.blur();
        }
      }
    };

    const startEditing = (element: HTMLElement) => {
      // Save state for undo before editing
      saveToUndoStack();
      
      element.setAttribute('contenteditable', 'true');
      element.classList.add('vizullm-editing');
      element.classList.remove('vizullm-hoverable');
      element.focus();
      
      // Select all text in the element
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      activeEditElementRef.current = element;
      
      // Add event listeners for editing
      element.addEventListener('blur', handleBlur);
      element.addEventListener('keydown', handleKeyDown);
      element.addEventListener('input', handleInput);
    };

    const createContextMenu = (x: number, y: number, element: HTMLElement) => {
      // Close any existing menu first
      closeContextMenu();
      
      // Ensure coordinates are valid
      if (!x || !y || x <= 0 || y <= 0) {
        return;
      }
      
      const menu = document.createElement('div');
      menu.className = 'vizullm-context-menu';
      
      // Set position immediately to avoid layout shift
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      
      // Check if element has direct text content (can be edited)
      const hasDirectText = Array.from(element.childNodes).some(
        node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
      );
      
      // Edit button - only show for elements with text content
      if (hasDirectText) {
        const editItem = document.createElement('div');
        editItem.className = 'vizullm-context-menu-item';
        editItem.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>Edit text</span>
        `;
        editItem.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          closeContextMenu();
          startEditing(element);
        });
        menu.appendChild(editItem);
      }
      
      // Remove button
      const removeItem = document.createElement('div');
      removeItem.className = 'vizullm-context-menu-item danger';
      removeItem.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
        <span>Remove element</span>
      `;
      removeItem.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleDeleteElement(element);
        closeContextMenu();
      });
      
      menu.appendChild(removeItem);
      document.body.appendChild(menu);
      
      // Adjust position if menu goes off screen
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (menuRect.right > viewportWidth) {
        menu.style.left = `${viewportWidth - menuRect.width - 10}px`;
      }
      if (menuRect.bottom > viewportHeight) {
        menu.style.top = `${viewportHeight - menuRect.height - 10}px`;
      }
      
      // Close menu when clicking outside
      const closeOnOutsideClick = (e: MouseEvent) => {
        if (!menu.contains(e.target as Node)) {
          closeContextMenu();
          document.removeEventListener('click', closeOnOutsideClick);
        }
      };
      setTimeout(() => {
        document.addEventListener('click', closeOnOutsideClick);
      }, 10);
    };

    const handleSingleClick = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      mouseEvent.stopPropagation();
      mouseEvent.preventDefault();
      const target = mouseEvent.currentTarget as HTMLElement;
      
      // Capture coordinates immediately (before setTimeout)
      const clickX = mouseEvent.clientX;
      const clickY = mouseEvent.clientY;
      
      // Don't show context menu if already editing this element
      if (activeEditElementRef.current === target) return;
      
      // Use a timer to distinguish single click from double click
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        return; // This was a double-click, ignore single click
      }
      
      clickTimer = setTimeout(() => {
        clickTimer = null;
        createContextMenu(clickX, clickY, target);
      }, 250);
    };

    const handleDoubleClick = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      
      // Clear the single click timer
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      
      // Close any open context menu
      closeContextMenu();
      
      // Exit if already editing another element
      if (activeEditElementRef.current && activeEditElementRef.current !== target) {
        finishEditing(activeEditElementRef.current);
      }
      
      // Skip if this is a container without direct text
      const hasDirectText = Array.from(target.childNodes).some(
        node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
      );
      if (!hasDirectText) return;
      
      startEditing(target);
    };

    const makeElementsHoverable = (element: Element, isRoot = false) => {
      const skipTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'SVG', 'PATH', 'SCRIPT', 'STYLE', 'BR', 'HR'];
      if (skipTags.includes(element.tagName)) return;
      
      // Skip the root container element itself - only process its children
      if (isRoot) {
        Array.from(element.children).forEach(child => makeElementsHoverable(child, false));
        return;
      }
      
      // Check if element has direct text content or is a meaningful container
      const hasDirectText = Array.from(element.childNodes).some(
        node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
      );
      
      // Only add hoverable to elements with actual content, not empty containers
      const isLargeContainer = ['DIV', 'SECTION', 'ARTICLE'].includes(element.tagName);
      const isEmptyContainer = isLargeContainer && !hasDirectText && element.children.length === 0;
      
      if (hasDirectText || (!isEmptyContainer && ['HEADER', 'FOOTER', 'ASIDE', 'NAV', 'TABLE', 'TR', 'UL', 'OL', 'LI', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN'].includes(element.tagName))) {
        // Only add listeners if element doesn't already have them (check for the class)
        if (!element.classList.contains('vizullm-hoverable')) {
          element.classList.add('vizullm-hoverable');
          
          // Add single click for context menu
          element.addEventListener('click', handleSingleClick);
          
          // Add double-click to edit
          element.addEventListener('dblclick', handleDoubleClick);
        }
      }
      
      // Recurse into children
      Array.from(element.children).forEach(child => makeElementsHoverable(child, false));
    };

    const handleDeleteElement = (element: HTMLElement) => {
      // Save state for undo before deleting
      saveToUndoStack();
      
      // Remove element with animation
      element.style.transition = 'all 0.2s ease';
      element.style.opacity = '0';
      element.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        element.remove();
        setIsDirty(true);
        
        // Get the current container and component content
        const currentContainer = isFullScreen ? fullScreenRef.current : componentRef.current;
        const componentContent = getComponentContent(currentContainer);
        
        if (componentContent) {
          // Sync content to the other ref after deletion
          const sourceContent = getComponentContent(currentContainer);
          const otherContainer = isFullScreen ? componentRef.current : fullScreenRef.current;
          const targetContent = getComponentContent(otherContainer);
          
          if (sourceContent && targetContent) {
            targetContent.innerHTML = sourceContent.innerHTML;
          }
          
          // Update editedHTML state - this will trigger React re-render
          // The useEffect will automatically re-attach listeners after React re-renders
          updateEditedHTML();
        }
      }, 200);
    };

    const saveToUndoStack = () => {
      // Save the component content div's innerHTML, not the outer container
      const componentContent = getComponentContent(container);
      const currentHTML = componentContent ? componentContent.innerHTML : container.innerHTML;
      setUndoStack(prev => [...prev.slice(-19), currentHTML]); // Keep last 20 states
    };

    // Clean up existing elements
    const cleanupElements = (element: Element) => {
      element.classList.remove('vizullm-hoverable', 'vizullm-editing');
      element.removeAttribute('contenteditable');
      element.removeEventListener('click', handleSingleClick);
      element.removeEventListener('dblclick', handleDoubleClick);
      
      Array.from(element.children).forEach(child => cleanupElements(child));
    };

    // Initialize editing setup with a delay to ensure DOM is ready after remount
    const rafId = requestAnimationFrame(() => {
      setTimeout(() => {
        // Skip re-setup if actively editing to avoid interrupting the user
        if (activeEditElementRef.current) return;
        
        const currentContainer = isFullScreen ? fullScreenRef.current : componentRef.current;
        if (!currentContainer) return;

        const componentContent = getComponentContent(currentContainer);
        if (!componentContent) return;

        // Save original content on first render (save component content div's innerHTML)
        if (!originalContentRef.current) {
          originalContentRef.current = componentContent.innerHTML;
        }

        // Clean up any existing listeners first to avoid duplicates
        cleanupElements(currentContainer);

        // Initialize - pass true to skip the root container itself
        makeElementsHoverable(currentContainer, true);
        
        // Also set up listeners on the other ref to keep them in sync
        const otherContainer = isFullScreen ? componentRef.current : fullScreenRef.current;
        if (otherContainer) {
          const otherContent = getComponentContent(otherContainer);
          if (otherContent) {
            cleanupElements(otherContainer);
            makeElementsHoverable(otherContainer, true);
          }
        }
      }, 100); // Increased delay to ensure React has finished re-rendering
    });

    return () => {
      cancelAnimationFrame(rafId);
      // Skip cleanup if actively editing to avoid interrupting the user
      if (!activeEditElementRef.current && container) {
        cleanupElements(container);
      }
      closeContextMenu();
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  // Note: activeEditElement is intentionally NOT in dependency array to prevent
  // the effect from re-running and canceling edits when editing starts
  // resetKey is included to re-setup editing after reset/remount
  // isDirty and editedHTML are included to re-setup listeners after React re-renders
  // We skip cleanup if actively editing to prevent interrupting the user
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullScreen, Component, userData, resetKey, isDirty, editedHTML]);

  // Sync content between refs when switching modes and store in state
  // Use useLayoutEffect to sync synchronously after DOM updates but before paint
  useLayoutEffect(() => {
    // Use requestAnimationFrame to ensure React has finished rendering
    const rafId = requestAnimationFrame(() => {
      if (isFullScreen) {
        // In fullscreen: sync from componentRef to fullScreenRef
        // (componentRef has the edited content from normal mode)
        const sourceContent = getComponentContent(componentRef.current);
        const targetContent = getComponentContent(fullScreenRef.current);
        
        if (sourceContent && targetContent) {
          // Sync the actual component content
          targetContent.innerHTML = sourceContent.innerHTML;
          // Update editedHTML if we have edits
          if (isDirty) {
            setEditedHTML(sourceContent.innerHTML);
          }
        }
      } else {
        // In normal view: sync from fullScreenRef to componentRef
        // (fullScreenRef has the edited content from fullscreen mode)
        const sourceContent = getComponentContent(fullScreenRef.current);
        const targetContent = getComponentContent(componentRef.current);
        
        if (sourceContent && targetContent) {
          // Sync the actual component content
          targetContent.innerHTML = sourceContent.innerHTML;
          // Update editedHTML if we have edits
          if (isDirty) {
            setEditedHTML(sourceContent.innerHTML);
          }
        }
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [isFullScreen, isDirty, editedHTML]);

  // Also sync after a delay as a backup (in case React re-renders after useLayoutEffect)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isFullScreen) {
        const sourceContent = getComponentContent(componentRef.current);
        const targetContent = getComponentContent(fullScreenRef.current);
        
        if (sourceContent && targetContent && targetContent.innerHTML !== sourceContent.innerHTML) {
          targetContent.innerHTML = sourceContent.innerHTML;
        }
      } else {
        const sourceContent = getComponentContent(fullScreenRef.current);
        const targetContent = getComponentContent(componentRef.current);
        
        if (sourceContent && targetContent && targetContent.innerHTML !== sourceContent.innerHTML) {
          targetContent.innerHTML = sourceContent.innerHTML;
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isFullScreen]);

  // Undo function
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    
    // Sync to both refs' component content divs
    const componentContent = getComponentContent(componentRef.current);
    const fullScreenContent = getComponentContent(fullScreenRef.current);
    
    if (componentContent) {
      componentContent.innerHTML = previousState;
    }
    if (fullScreenContent) {
      fullScreenContent.innerHTML = previousState;
    }
    
    // Update editedHTML state
    setEditedHTML(previousState);
    
    // Check if we're back to original
    if (previousState === originalContentRef.current) {
      setIsDirty(false);
      setEditedHTML(null);
    }
  };

  // Reset all changes function
  const handleResetChanges = () => {
    if (!originalContentRef.current) return;
    
    // Clear state first
    setIsDirty(false);
    setUndoStack([]);
    setEditedHTML(null);
    
    // Increment reset key to force React to remount component containers
    // This prevents React reconciliation errors when switching from dangerouslySetInnerHTML to Component
    // The Component will render fresh with the original userData
    setResetKey(prev => prev + 1);
  };

  // Handle escape key to close full screen and context menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close context menu first if open
        const contextMenu = document.querySelector('.vizullm-context-menu');
        if (contextMenu) {
          contextMenu.remove();
          return;
        }
        
        if (isFullScreen) {
          setIsFullScreen(false);
          setComponentSize({ width: '100%', height: '100%' });
        } else if (showSchemaModal) {
          setShowSchemaModal(false);
          setComponentSize({ width: '100%', height: '100%' });
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    if (isFullScreen) {
      // Prevent body scroll when full screen is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullScreen, showSchemaModal]);

  useEffect(() => {
    const loadVisual = async () => {
      if (!slug) {
        setError('No visual slug provided');
        setLoading(false);
        return;
      }

      // Reset edit state when loading a new visual
      setIsDirty(false);
      setUndoStack([]);
      setEditedHTML(null);
      setResetKey(0);
      originalContentRef.current = '';

      try {

        const visualData = visuals.find((v: VisualComponent) => v.slug === slug);

        if (!visualData) {
          throw new Error(`Visual component '${slug}' not found`);
        }

        setVisual(visualData);

        // Load schema
        try {
          const schemaModule = await import(`../../visuals/${slug}/schema.ts`);
          console.log('Schema module loaded:', schemaModule);
          const schemaData = schemaModule.default || schemaModule;
          console.log('Schema data:', schemaData);
          setSchema(schemaData);
        } catch (schemaError) {
          console.warn('Failed to load schema:', schemaError);
          // Fallback to JSON schema if Zod schema not available
          try {
            const schemaResponse = await fetch(`visuals/${slug}/schema.json`);
            if (schemaResponse.ok) {
              const jsonSchema = await schemaResponse.json();
              setSchema(jsonSchema);
            }
          } catch (jsonSchemaError) {
            console.warn('Failed to load JSON schema:', jsonSchemaError);
          }
        }

        // Load component
        try {
          const componentModule = await import(`../../visuals/${slug}/component.tsx`);
          console.log('Component module loaded:', componentModule);
          const Component = componentModule.default;
          console.log('Component:', Component);
          setComponent(() => Component);
        } catch (componentError) {
          console.error('Failed to load component:', componentError);
          throw new Error(`Failed to load component for '${slug}'`);
        }

        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setLoading(false);
        onError?.(errorMessage);
      }
    };

    loadVisual();
  }, [slug, onError]);

  // Parse JSON input
  useEffect(() => {
    if (!jsonInput.trim()) {
      setUserData(null);
      setJsonError(null);
      return;
    }

    try {
      const parsedData = JSON.parse(jsonInput);
      setUserData(parsedData);
      setJsonError(null);
    } catch (err) {
      setJsonError('Invalid JSON format. Please check your input.');
      setUserData(null);
    }
  }, [jsonInput]);

  // Clear editedHTML when userData changes (new data loaded)
  useEffect(() => {
    if (userData !== null) {
      // Only clear if we're not currently editing (to avoid clearing during edits)
      if (!isDirty) {
        setEditedHTML(null);
      }
    }
  }, [userData, isDirty]);

  const handleClearData = () => {
    setUserData(null);
    setJsonInput('');
    setJsonError(null);
    // Also reset edit state when clearing data
    setIsDirty(false);
    setUndoStack([]);
    setEditedHTML(null);
    originalContentRef.current = '';
  };

  const copySchemaToClipboard = async () => {
    if (!schema) return;

    try {

      await navigator.clipboard.writeText(jsonOutput);
      setCopiedIcon(true);
      setTimeout(() => setCopiedIcon(false), 2000);
    } catch (err) {
      console.error('Failed to copy schema:', err);
    }
  };

  const copyAsPrompt = async () => {
    if (!schema) return;

    try {

      await navigator.clipboard.writeText(`Output as JSON according to zod schema:\n\n${jsonOutput}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy schema:', err);
    }
  };

  const reactToPrintFn = useReactToPrint({ content: () => componentRef.current });

  const handlePrint = () => {
    if (!componentRef.current || !visual) {
      console.log('Print failed: componentRef or visual is null');
      return;
    }

    console.log('Starting print...');
    setIsPrinting(true);
    reactToPrintFn();

    // Reset printing state after a short delay
    setTimeout(() => {
      setIsPrinting(false);
    }, 1000);
  };

  const toggleFullScreen = () => {
    // Don't sync here - let the useEffect handle it after React renders
    if (!isFullScreen) {
      // Reset size when entering full screen
      setComponentSize({ width: '100%', height: '100%' });
    }
    setIsFullScreen(!isFullScreen);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading visual component...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
            <svg className="size-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Visual</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
            >
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!visual) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Visual component not found</p>
        </div>
      </div>
    );
  }

  // Full screen view - render via portal to ensure it's above everything
  if (isFullScreen) {
    const fullscreenContent = (
      <div className="fixed inset-0 bg-white" style={{ zIndex: 999999 }}>
        {/* Close Button - fixed at the top left */}
        <button
          onClick={toggleFullScreen}
          className="fixed left-4 top-4 z-[1000000] rounded-lg bg-slate-800 p-3 text-white shadow-xl transition-all hover:scale-110 hover:bg-slate-900"
          title="Exit full screen (ESC)"
          style={{ zIndex: 1000000 }}
        >
          <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Fullscreen Controls - fixed at the top right */}
        <div className="fixed right-4 top-4 z-[1000000] flex items-center gap-2" style={{ zIndex: 1000000 }}>
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="rounded-lg bg-slate-100 p-2.5 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            title="Undo last change"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          
          {/* Reset Button */}
          <button
            onClick={handleResetChanges}
            disabled={!isDirty}
            className="rounded-lg bg-rose-100 p-2.5 text-rose-700 transition-colors hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
            title="Reset all changes"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {/* Print Pagination Toggle */}
          <label 
            className="group relative flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={preventPageBreaks}
              onChange={(e) => setPreventPageBreaks(e.target.checked)}
              className="size-3.5 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            />
            <svg className="size-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden whitespace-nowrap sm:inline">Better Print</span>
            {/* Info Icon */}
            <svg 
              className="size-3.5 shrink-0 text-slate-400 transition-colors hover:text-slate-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {/* Tooltip */}
            <div className="invisible absolute right-0 top-full z-[10001] mt-2 w-64 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100">
              <p className="mb-1 font-medium">Better Print Mode</p>
              <p className="text-slate-300">Prevents sections, tables, and content blocks from being split across pages. Keeps headings with their content and ensures cleaner print layouts.</p>
              <div className="absolute bottom-full right-4 -mb-1 border-4 border-transparent border-b-slate-900"></div>
            </div>
          </label>
        </div>
        
        {/* Resizable Component Container */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden p-4 py-16 ${preventPageBreaks ? 'print-pagination' : ''}`}
          ref={fullScreenRef}
        >
          <div className='relative w-full' style={{ resize: 'both', overflow: 'auto', width: componentSize.width, height: componentSize.height }}>
            {/* Component Content */}
            <div key={resetKey} className={`size-full ${preventPageBreaks ? 'print-pagination' : ''}`} data-component-content>
              {Component ? (
                isDirty && editedHTML ? (
                  <div dangerouslySetInnerHTML={{ __html: editedHTML }} />
                ) : (
                  <Component schema={schema} data={userData ?? undefined} />
                )
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 p-3 shadow-lg">
                      <svg className="size-full text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">Component not available</h3>
                    <p className="mt-2 text-sm font-medium text-slate-600">Please try again later</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Instructions - OUTSIDE the editable container, non-interactive */}
        <div 
          className={`pointer-events-none fixed bottom-4 left-1/2 z-[1000000] -translate-x-1/2 select-none rounded-lg px-4 py-2 text-sm text-white ${isDirty ? 'bg-amber-600/80' : 'bg-black/50'}`}
          style={{ zIndex: 1000000 }}
        >
          <p>Double-click to edit • Click for menu • Drag corners to resize • ESC to exit</p>
        </div>
      </div>
    );
    
    return createPortal(fullscreenContent, document.body);
  }

  return (
    <>
      <div className="flex h-[calc(100vh-65px)] flex-col overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 lg:overflow-hidden">
        {/* Header */}
        <div className="z-40 shrink-0 border-b border-white/20 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
            <div className="space-y-2">
              <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                {visual.name}
              </h1>
              <p className="text-sm font-medium text-slate-600 sm:text-base">{visual.description}</p>
              <div className="flex flex-col space-y-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:space-x-6 sm:space-y-0 sm:text-sm">
                <span className="flex items-center">
                  <div className="mr-2 size-2 rounded-full bg-blue-500"></div>
                  {visual.author}
                </span>
                <span className="flex items-center">
                  <div className="mr-2 size-2 rounded-full bg-purple-500"></div>
                  {visual.slug}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-10 sm:px-6 lg:flex-row lg:overflow-hidden lg:px-8">
          <div className="grid size-full gap-8 lg:grid-cols-2 lg:overflow-visible">
            {/* Left Panel - Input */}
            <div className="flex h-full flex-col space-y-6  pb-8">
              {/* Data Input Section */}
              <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white/80 shadow-xl ring-1 ring-white/20 backdrop-blur-xl">
                <div className="shrink-0 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-emerald-50/50 px-6 py-4">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Input Data</h2>
                    {schema && (
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                        <button
                          onClick={() => setShowSchemaModal(true)}
                          className="group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl sm:w-auto"
                        >
                          <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Schema
                        </button>
                        <button
                          onClick={copyAsPrompt}
                          className="group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl sm:w-auto"
                        >
                          {copied ? (
                            <>
                              <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy Schema as Prompt
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col space-y-4 overflow-y-auto p-6">
                  <div className="flex flex-1 flex-col">
                    <label htmlFor="json-input" className="mb-3 block text-sm font-semibold text-slate-700">
                      JSON Data
                    </label>
                    <textarea
                      id="json-input"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder="Enter JSON data here based on the schema above..."
                      className="min-h-[calc(150px)] flex-1 resize-none rounded-2xl border-0 bg-slate-50 p-4 text-sm text-slate-900 shadow-inner transition-all duration-300 placeholder:text-slate-500 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Status Messages */}
                  {jsonError && (
                    <div className="flex shrink-0 items-start rounded-2xl border border-red-200/50 bg-gradient-to-r from-red-50 to-red-100/50 p-4 shadow-lg">
                      <div className="mr-3 mt-0.5 size-5 shrink-0 rounded-full bg-red-500 p-1">
                        <svg className="size-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-red-800">{jsonError}</p>
                    </div>
                  )}
                  {userData && !jsonError && (
                    <div className="flex shrink-0 items-start rounded-2xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 shadow-lg">
                      <div className="mr-3 mt-0.5 size-5 shrink-0 rounded-full bg-emerald-500 p-1">
                        <svg className="size-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-emerald-800">Valid JSON - Component will render with this data</p>
                    </div>
                  )}

                  {/* Clear Data Button */}
                  {userData && (
                    <button
                      onClick={handleClearData}
                      className="group inline-flex w-full shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-slate-400 hover:bg-slate-50 hover:shadow-xl"
                    >
                      <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear Data
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Output */}
            <div className="flex h-full max-w-[calc(100vw-47px)] flex-col space-y-6 pb-8 lg:min-h-0">
              <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white/80 shadow-xl ring-1 ring-white/20 backdrop-blur-xl lg:min-h-0">
                <div className="shrink-0 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-purple-50/50 px-6 py-4">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Preview</h2>
                      {userData && (
                        <p className="mt-1 text-sm font-medium text-purple-600">Rendering with custom data</p>
                      )}
                    </div>

                    {/* Action Buttons and Settings */}
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                      {/* Print Settings Checkbox */}
                      <label className="group relative flex cursor-pointer items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:text-sm">
                        <input
                          type="checkbox"
                          checked={preventPageBreaks}
                          onChange={(e) => setPreventPageBreaks(e.target.checked)}
                          className="size-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                        />
                        <span className="whitespace-nowrap">Better Print</span>
                        {/* Info Icon */}
                        <div className="relative">
                          <svg 
                            className="size-4 text-slate-400 transition-colors hover:text-slate-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {/* Tooltip */}
                          <div className="invisible absolute right-0 top-full z-50 mt-2 w-64 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100">
                            <p className="mb-1 font-medium">Better Print Mode</p>
                            <p className="text-slate-300">Prevents sections, tables, and content blocks from being split across pages. Keeps headings with their content and ensures cleaner print layouts.</p>
                            <div className="absolute bottom-full right-4 -mb-1 border-4 border-transparent border-b-slate-900"></div>
                          </div>
                        </div>
                      </label>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
                        {/* Full Screen Button */}
                        <button
                          onClick={toggleFullScreen}
                          disabled={!Component}
                          className="group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:from-slate-700 hover:to-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
                        >
                          <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span className="hidden sm:inline">Full Screen</span>
                          <span className="sm:hidden">Full</span>
                        </button>

                        {/* PDF Button */}
                        <button
                          onClick={handlePrint}
                          disabled={isPrinting || !Component}
                          className="group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
                        >
                          {isPrinting ? (
                            <>
                              <svg className="mr-2 size-4 animate-spin transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span className="hidden sm:inline">Printing...</span>
                              <span className="sm:hidden">Printing</span>
                            </>
                          ) : (
                            <>
                              <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              PDF
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`relative flex flex-1 flex-col overflow-scroll pr-8 ${preventPageBreaks ? 'print-pagination' : ''}`} data-component-ref>
                  {/* Edit Hint - shown when not dirty yet */}
                  {!isDirty && Component && (
                    <div className="sticky inset-x-0 top-0 z-10 mx-4 mt-4 flex items-center rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-xs text-blue-600 shadow-sm ring-1 ring-blue-100">
                      <svg className="mr-2 size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Tip:</strong> Double-click to edit text • Click for context menu</span>
                    </div>
                  )}
                  
                  {/* Changes Indicator */}
                  {isDirty && (
                    <div className="sticky inset-x-0 top-0 z-10 mx-4 mt-4 flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 shadow-sm ring-1 ring-amber-200">
                      <div className="flex items-center text-xs text-amber-700">
                        <svg className="mr-2 size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>You have unsaved changes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {undoStack.length > 0 && (
                          <button
                            onClick={handleUndo}
                            className="rounded-md bg-amber-200/60 px-2 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-200"
                          >
                            Undo
                          </button>
                        )}
                        <button
                          onClick={handleResetChanges}
                          className="rounded-md bg-amber-200/60 px-2 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-200"
                        >
                          Reset All
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {Component ? (
                    <div key={resetKey} ref={componentRef} className={`flex-1 rounded-2xl p-6 ${preventPageBreaks ? 'print-pagination' : ''}`} data-component-content>
                      {isDirty && editedHTML ? (
                        <div dangerouslySetInnerHTML={{ __html: editedHTML }} />
                      ) : (
                        <Component schema={schema} data={userData ?? undefined} />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100/50">
                      <div className="text-center">
                        <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 p-3 shadow-lg sm:size-16">
                          <svg className="size-full text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900 sm:text-xl">
                          Loading Component...
                        </h3>
                        <p className="mt-2 text-sm font-medium text-slate-600">
                          {visual.name} is being loaded
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schema Modal */}
      {showSchemaModal && schema && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[calc(100vh-150px)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Schema</h2>
                <button
                  onClick={() => setShowSchemaModal(false)}
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Modal Content */}
            <div className="max-h-[calc(90vh-300px)] overflow-hidden">
              <div className="relative m-4 overflow-hidden rounded-2xl bg-slate-50 p-4 shadow-inner">
                <button
                  onClick={copySchemaToClipboard}
                  className="absolute right-10 top-4 z-10 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  title="Copy schema"
                >
                  {copiedIcon ? (
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                <pre className="max-h-[calc(90vh-370px)] overflow-y-scroll pr-20 font-mono text-sm  text-slate-700">
                  {jsonOutput || 'No schema available'}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200/50 bg-slate-50/50 px-6 py-4">
              <div className="flex flex-col space-y-3 sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0">
                <button
                  onClick={copyAsPrompt}
                  className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                >
                  {copied ? (
                    <>
                      <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Schema as Prompt
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSchemaModal(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-slate-400 hover:bg-slate-50 hover:shadow-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisualRenderer;
