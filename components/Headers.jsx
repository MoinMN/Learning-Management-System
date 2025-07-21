// Main page title - responsive font sizes
export const PageHeading = ({ children, className = '' }) => (
  <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight ${className}`}>
    {children}
  </h1>
);

// Section heading - responsive with optional border
export const SectionHeading = ({ children, className = '', withBorder = false }) => (
  <h2 className={`text-lg sm:text-xl font-semibold text-gray-200 mb-4 ${className} ${withBorder ? 'pb-2 border-b border-gray-200 dark:border-gray-700' : ''
    }`}>
    {children}
  </h2>
);

// Card heading with responsive spacing
export const CardHeading = ({ children, className = '' }) => (
  <h3 className={`text-base sm:text-lg font-medium text-gray-300 mb-2 sm:mb-3 ${className}`}>
    {children}
  </h3>
);
