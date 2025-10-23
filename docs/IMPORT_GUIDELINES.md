# Import Guidelines

## Import Order Standard

Organize imports in the following order for consistency across the codebase:

### 1. React & Core Libraries
```typescript
import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
```

### 2. External Libraries
```typescript
import { format } from 'date-fns';
import { z } from 'zod';
```

### 3. Internal Utilities & Helpers
```typescript
import { cn } from '@/lib/utils';
import { formatUSD, formatVND } from '@/lib/utils';
```

### 4. UI Components (Common/Shared)
```typescript
import { Button } from '@/components/ui/Button';
import { TextBox, OptionBox } from '@/components/common';
```

### 5. Types
```typescript
import type { Employee } from '@/types/employee';
import type { Order } from '@/types/order';
// OR combine with values
import {
  type Employee,
  getEmployeeInitials,
} from '@/types/employee';
```

### 6. Feature-Specific Imports
```typescript
import { useEmployeeStore } from '@/features/employees';
import { useOrderStore } from '@/features/orders';
```

### 7. Relative Imports (Local)
```typescript
import { EmployeeCard } from './EmployeeCard';
import { OrderSummary } from '../components/OrderSummary';
```

## Complete Example

```typescript
// features/employees/components/EmployeeCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  type Employee,
  getEmployeeInitials,
} from '@/types/employee';
import { useEmployeeStore } from '@/features/employees';

interface EmployeeCardProps {
  employee: Employee;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  // Component logic
};
```

## Path Aliases

Use the following aliases instead of relative paths:

- `@/components/*` - Shared UI components
- `@/features/*` - Feature modules
- `@/types/*` - TypeScript types
- `@/lib/*` - Utility functions
- `@/hooks/*` - Custom hooks
- `@/store/*` - Global stores
- `@/services/*` - API services
- `@/utils/*` - Helper utilities
- `@/constants/*` - Constants

## Best Practices

### ✅ DO:
```typescript
import { Button } from '@/components/ui/Button';
import { useEmployeeStore } from '@/features/employees';
import type { Employee } from '@/types/employee';
```

### ❌ DON'T:
```typescript
import { Button } from '../../../components/ui/Button';
import { useEmployeeStore } from '../store/useEmployeeStore';
import type { Employee } from '../../../types/employee';
```

## Feature Index Exports

Each feature should have an `index.ts` that exports public APIs:

```typescript
// features/employees/index.ts
export { EmployeeList } from './pages/EmployeeList';
export { EmployeeCreate } from './pages/EmployeeCreate';
export { useEmployeeStore } from './store/useEmployeeStore';
```

This allows clean imports:
```typescript
import { EmployeeList, useEmployeeStore } from '@/features/employees';
```

## Type Imports

Use `type` keyword for type-only imports:

```typescript
// ✅ Good
import type { Employee } from '@/types/employee';
import { type Employee, getEmployeeInitials } from '@/types/employee';

// ❌ Avoid
import { Employee } from '@/types/employee'; // if Employee is only used as type
```

## Grouping with Blank Lines

Separate import groups with blank lines for better readability:

```typescript
import React from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

import type { Employee } from '@/types/employee';
import { useEmployeeStore } from '@/features/employees';
```
