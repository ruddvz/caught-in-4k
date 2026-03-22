const React = require('react');

/**
 * Hook to detect when an element enters the viewport.
 * @param {React.RefObject} ref - The ref of the element to observe.
 * @param {Object} options - IntersectionObserver options.
 * @returns {boolean} - Whether the element is currently visible in the viewport.
 */
const useInViewport = (ref, options = { threshold: 0.1 }) => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                // Stop observing after it becomes visible for entrance animation
                observer.unobserve(entry.target);
            }
        }, options);

        observer.observe(ref.current);

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [ref, options]);

    return isVisible;
};

module.exports = useInViewport;
