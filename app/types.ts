export interface LoaderData {
  helmet?: {
    title: {
      toComponent: () => React.ReactNode;
    };
  };
} 