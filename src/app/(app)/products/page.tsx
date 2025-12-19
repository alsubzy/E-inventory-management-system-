'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { getProductsDB } from '@/lib/actions/products-db';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProductForm } from './components/product-form';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    const result = await getProductsDB();
    if (result.success) {
      setProducts(result.products);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Products"
        description="Manage your products, stock levels, and pricing."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new product in your inventory.
              </DialogDescription>
            </DialogHeader>
            <ProductForm onSuccess={loadProducts} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading products...</div>
      ) : (
        <DataTable columns={columns} data={products} searchPlaceholder="Filter products..." />
      )}
    </div>
  );
}
