import * as React from 'react';

export function useDeviceProfile() {
  const [profile, setProfile] = React.useState(() => ({
    isTouch: window.matchMedia('(pointer: coarse)').matches,
    isSmallScreen: window.innerWidth < 768,
    isStandalone:
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true, // iOS
  }));

  React.useEffect(() => {
    const handler = () => {
      setProfile({
        isTouch: window.matchMedia('(pointer: coarse)').matches,
        isSmallScreen: window.innerWidth < 768,
        isStandalone:
          window.matchMedia('(display-mode: standalone)').matches ||
          window.navigator.standalone === true,
      });
    };

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return profile;
}

