import React, { Suspense } from 'react';
import StudioPageContent from './StudioPageContent';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <StudioPageContent />
    </Suspense>
  );
}
