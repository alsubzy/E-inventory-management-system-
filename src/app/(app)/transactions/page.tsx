'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { columns } from './components/columns';
import { DataTable } from '../products/components/data-table';
import { getTransactions } from '@/lib/actions/transactions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TransactionForm } from './components/transaction-form';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventory Transactions"
        description="View all stock movements and record new arrivals or sales."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Record New Transaction</DialogTitle>
              <DialogDescription>
                Create a new stock movement record. Select the type, warehouses, and items.
              </DialogDescription>
            </DialogHeader>
            <TransactionForm onSuccess={() => setTransactions(getTransactions())} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable
        columns={columns}
        data={transactions}
        searchKey="reference"
        searchPlaceholder="Filter by reference..."
      />
    </div>
  );
}

