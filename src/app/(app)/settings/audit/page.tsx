'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { getAuditLogs } from "@/lib/actions/audit";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        setLogs(getAuditLogs());
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Audit Trail"
                description="Monitor all system activities and user actions."
            />

            <div className="border rounded-lg bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-medium">{log.userId}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{log.action}</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                                </TableCell>
                            </TableRow>
                        ))}
                        {logs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No audit logs found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
