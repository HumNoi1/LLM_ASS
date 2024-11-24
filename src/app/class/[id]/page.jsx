import { Suspense } from 'react';
import ClassFolderClient from './ClassFolderClient';

async function ClassPage({ params }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClassFolderClient classId={params.id} />
    </Suspense>
  );
}

export default ClassPage;