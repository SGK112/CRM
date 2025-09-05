'use client';

import { simple } from '@/lib/simple-ui';
import CommunicationsHub from '@/components/CommunicationsHub';

export default function InboxPage() {
  return (
    <div className={simple.page()}>
      <CommunicationsHub />
    </div>
  );
}
