// Mock decorators - they just return the value as-is in tests
// In Jest, decorators don't execute, so these are no-ops

export const field = (columnName: string) => {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    // No-op in tests
    return descriptor;
  };
};

export const date = (columnName: string) => {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    return descriptor;
  };
};

export const readonly = (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
  return descriptor;
};

export const children = (relationName: string) => {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    return descriptor;
  };
};

export const text = (columnName: string) => {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    return descriptor;
  };
};

export const relation = (relationName: string, relationId: string) => {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    return descriptor;
  };
};

