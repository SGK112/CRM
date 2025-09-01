import { simple } from '@/lib/simple-ui';

export default function CatalogPage() {
  return (
    <div className={simple.page()}>
      <div className={simple.card()}>
        <div className={simple.section()}>
          <h1 className={simple.text.title()}>Price Sheets</h1>
          <p className={simple.text.body('mt-2')}>Manage vendor price sheets and material lists.</p>
        </div>
      </div>
    </div>
  );
}
