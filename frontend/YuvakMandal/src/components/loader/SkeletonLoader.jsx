import React from 'react';
import PropTypes from 'prop-types';

/**
 * SkeletonLoader component for displaying animated loading placeholders
 * @param {Object} props - Component props
 * @param {string} props.type - Type of skeleton (card, text, avatar, etc.)
 * @param {string} props.size - Size of the skeleton (sm, md, lg)
 * @param {number} props.count - Number of skeleton items to display
 * @param {boolean} props.rounded - Whether to make the skeleton rounded
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.height - Custom height (in pixels)
 * @param {number} props.width - Custom width (in pixels)
 */
const SkeletonLoader = ({
  type = 'text',
  size = 'md',
  count = 1,
  rounded = false,
  className = '',
  height,
  width,
}) => {
  // Define the animation class for the pulse effect
  const animationClass = 'animate-pulse bg-gradient-to-r from-gray-300 via-gray-300 to-gray-200 bg-[length:400%_100%] animate-shimmer';
  
  // Get dimensions based on type and size
  const getDimensions = () => {
    let dimensions = {};
    
    // Base type dimensions
    switch (type) {
      case 'avatar':
        dimensions = { height: 'h-10', width: 'w-10', rounded: 'rounded-full' };
        break;
      case 'card':
        dimensions = { height: 'h-40', width: 'w-full', rounded: 'rounded-lg' };
        break;
      case 'card-sm':
        dimensions = { height: 'h-24', width: 'w-full', rounded: 'rounded-md' };
        break;
      case 'text':
        dimensions = { height: 'h-4', width: 'w-full', rounded: 'rounded' };
        break;
      case 'thumbnail':
        dimensions = { height: 'h-16', width: 'w-16', rounded: 'rounded-md' };
        break;
      default:
        dimensions = { height: 'h-4', width: 'w-full', rounded: 'rounded' };
    }
    
    // Adjust dimensions based on size
    if (size === 'sm') {
      dimensions.height = type === 'text' ? 'h-2' : 'h-20';
      dimensions.width = type === 'text' ? 'w-24' : 'w-full';
    } else if (size === 'lg') {
      dimensions.height = type === 'text' ? 'h-6' : 'h-64';
      dimensions.width = 'w-full';
    }
    
    // Override with custom dimensions if provided
    if (height) dimensions.height = `h-[${height}px]`;
    if (width) dimensions.width = width === 'full' ? 'w-full' : `w-[${width}px]`;
    
    return dimensions;
  };
  
  const { height: heightClass, width: widthClass, rounded: roundedClass } = getDimensions();
  
  // Create skeleton items based on count
  const skeletonItems = Array(count).fill(0).map((_, index) => {
    const key = `skeleton-${type}-${index}`;
    
    // Return the appropriate skeleton based on type
    switch (type) {
      case 'card':
      case 'card-sm':
        return (
          <div 
            key={key} 
            className={`${animationClass} ${heightClass} ${widthClass} ${rounded ? 'rounded-lg' : roundedClass} ${className} overflow-hidden mb-4`}
            style={{ backgroundSize: '400% 100%' }}
          />
        );
      
      case 'user-card':
        return (
          <div 
            key={key} 
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 ${className} mb-4`}
          >
            <div className={`${animationClass} h-48 w-full`} style={{ backgroundSize: '400% 100%' }}></div>
            <div className="p-4 space-y-3">
              <div className={`${animationClass} h-5 w-3/4 rounded`} style={{ backgroundSize: '400% 100%' }}></div>
              <div className={`${animationClass} h-4 w-full rounded`} style={{ backgroundSize: '400% 100%' }}></div>
              <div className={`${animationClass} h-4 w-1/2 rounded`} style={{ backgroundSize: '400% 100%' }}></div>
            </div>
          </div>
        );
      
      case 'dashboard-card':
        return (
          <div 
            key={key} 
            className={`bg-white p-6 rounded-lg shadow ${className} mb-4`}
          >
            <div className={`${animationClass} h-5 w-2/3 rounded mb-4`} style={{ backgroundSize: '400% 100%' }}></div>
            <div className="space-y-2">
              <div className={`${animationClass} h-4 w-1/2 rounded`} style={{ backgroundSize: '400% 100%' }}></div>
              <div className={`${animationClass} h-4 w-3/4 rounded`} style={{ backgroundSize: '400% 100%' }}></div>
              <div className={`${animationClass} h-4 w-1/3 rounded`} style={{ backgroundSize: '400% 100%' }}></div>
            </div>
          </div>
        );
      
      case 'text-block':
        return (
          <div key={key} className={`space-y-2 ${className} mb-4`}>
            <div className={`${animationClass} h-4 w-full rounded`} style={{ backgroundSize: '400% 100%' }}></div>
            <div className={`${animationClass} h-4 w-5/6 rounded`} style={{ backgroundSize: '400% 100%' }}></div>
            <div className={`${animationClass} h-4 w-4/6 rounded`} style={{ backgroundSize: '400% 100%' }}></div>
          </div>
        );
      
      default:
        return (
          <div 
            key={key} 
            className={`${animationClass} ${heightClass} ${widthClass} ${rounded ? 'rounded' : roundedClass} ${className} mb-2`}
            style={{ backgroundSize: '400% 100%' }}
          />
        );
    }
  });
  
  return <>{skeletonItems}</>;
};

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf(['text', 'card', 'card-sm', 'avatar', 'thumbnail', 'user-card', 'dashboard-card', 'text-block']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  count: PropTypes.number,
  rounded: PropTypes.bool,
  className: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default SkeletonLoader;