// Utility functions for better export quality

export const ensureStylesApplied = (element: HTMLElement) => {
  // Force layout recalculation
  element.style.display = 'block';
  element.style.visibility = 'visible';
  element.style.opacity = '1';
  element.style.position = 'relative';

  // Ensure all child elements have proper styles
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl) {
      try {
        // Get computed styles from the original element
        const computedStyle = window.getComputedStyle(htmlEl);
        if (computedStyle) {
          // Copy ALL computed styles to inline styles for better preservation
          const stylesToCopy = [
            'background-color',
            'background-image',
            'background-size',
            'background-position',
            'background-repeat',
            'color',
            'border',
            'border-top',
            'border-right',
            'border-bottom',
            'border-left',
            'border-radius',
            'border-width',
            'border-style',
            'border-color',
            'padding',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left',
            'margin',
            'margin-top',
            'margin-right',
            'margin-bottom',
            'margin-left',
            'font-size',
            'font-weight',
            'font-family',
            'line-height',
            'text-align',
            'text-decoration',
            'text-transform',
            'display',
            'flex-direction',
            'flex-wrap',
            'justify-content',
            'align-items',
            'align-content',
            'flex',
            'flex-grow',
            'flex-shrink',
            'flex-basis',
            'width',
            'height',
            'min-width',
            'min-height',
            'max-width',
            'max-height',
            'position',
            'top',
            'right',
            'bottom',
            'left',
            'z-index',
            'overflow',
            'overflow-x',
            'overflow-y',
            'white-space',
            'word-wrap',
            'word-break',
            'box-shadow',
            'opacity',
            'transform',
            'transition'
          ];

          stylesToCopy.forEach(styleProp => {
            const value = computedStyle.getPropertyValue(styleProp);
            if (value && value !== 'initial' && value !== 'normal' && value !== 'auto' && value !== 'none') {
              htmlEl.style.setProperty(styleProp, value, 'important');
            }
          });

          // Special handling for gradients and complex backgrounds
          const bgImage = computedStyle.getPropertyValue('background-image');
          if (bgImage && bgImage !== 'none') {
            htmlEl.style.setProperty('background-image', bgImage, 'important');
          }

          // Ensure visibility
          if (htmlEl.style.visibility === 'hidden') {
            htmlEl.style.setProperty('visibility', 'visible', 'important');
          }
          if (htmlEl.style.display === 'none') {
            htmlEl.style.setProperty('display', 'block', 'important');
          }
          if (htmlEl.style.opacity === '0') {
            htmlEl.style.setProperty('opacity', '1', 'important');
          }
        }
      } catch (error) {
        // Ignore errors for elements that can't be styled
        console.warn('Could not apply styles to element:', error);
      }
    }
  });

  // Force a reflow to ensure styles are applied
  element.offsetHeight;
};

export const waitForRender = (ms: number = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const waitForImages = (element: HTMLElement): Promise<void> => {
  return new Promise((resolve) => {
    const images = element.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      resolve();
      return;
    }

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        onImageLoad();
      } else {
        img.addEventListener('load', onImageLoad);
        img.addEventListener('error', onImageLoad); // Resolve even on error
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      resolve();
    }, 10000);
  });
};
