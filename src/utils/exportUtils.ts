// Utility functions for better export quality

export const ensureStylesApplied = (element: HTMLElement) => {
  // Force layout recalculation
  element.style.display = 'block';
  element.style.visibility = 'visible';
  element.style.opacity = '1';
  
  // Ensure all child elements have proper styles
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.style) {
      // Force computed styles to be applied
      htmlEl.style.transform = htmlEl.style.transform || 'none';
      htmlEl.style.transition = htmlEl.style.transition || 'none';
      
      // Ensure Tailwind classes are properly applied
      const computedStyle = window.getComputedStyle(htmlEl);
      if (computedStyle) {
        // Copy important computed styles to inline styles
        const importantStyles = [
          'background-color',
          'color',
          'border',
          'border-radius',
          'padding',
          'margin',
          'font-size',
          'font-weight',
          'text-align',
          'display',
          'flex-direction',
          'justify-content',
          'align-items',
          'width',
          'height',
          'min-width',
          'min-height',
          'max-width',
          'max-height'
        ];
        
        importantStyles.forEach(style => {
          const value = computedStyle.getPropertyValue(style);
          if (value && value !== 'initial' && value !== 'normal') {
            htmlEl.style.setProperty(style, value, 'important');
          }
        });
      }
    }
  });
};

export const waitForRender = (ms: number = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}; 