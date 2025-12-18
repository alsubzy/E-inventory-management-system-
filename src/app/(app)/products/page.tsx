import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { mockProducts } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Products"
        description="Manage your products, stock levels, and pricing."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>
      <DataTable columns={columns} data={mockProducts} />
    </div>
  );
}
