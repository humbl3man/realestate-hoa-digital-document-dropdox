"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "next-view-transitions"
import { DeletePortalDialog } from "./delete-portal-dialog"
import { cn } from "@/lib/utils"
import React from "react"

export type PortalData = {
  id: string
  name: string
  slug: string
  priceInCents: number
  fileCount: number
  createdAt: Date
  updatedAt: Date | null
}

export const columns: ColumnDef<PortalData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Portal Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const displayName = name.length > 20 ? name.slice(0, 20) + "..." : name
      return (
        <Link
          href={`/dashboard/portals/${row.original.id}`}
          className="hover:underline underline-offset-2 inline-block w-fit font-semibold text-foreground"
          style={{ viewTransitionName: `portal-name-${row.original.id}` } as React.CSSProperties}
          title={name.length > 20 ? name : undefined}
        >
          {displayName}
        </Link>
      )
    },
  },
  {
    id: "publicUrl",
    header: "Public URL",
    cell: ({ row }) => {
      const publicUrl = `/p/${row.original.slug}`
      return (
        <Link
          href={publicUrl}
          target="_blank"
          className="text-muted-foreground hover:text-accent flex items-center gap-1.5 transition-colors"
        >
          {publicUrl}
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      )
    }
  },
  {
    accessorKey: "priceInCents",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("priceInCents")) / 100
      return <span className="text-muted-foreground">${amount.toFixed(2)}</span>
    }
  },
  {
    accessorKey: "fileCount",
    header: "Files",
    cell: ({ row }) => {
      const count: number = row.getValue("fileCount")
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
            count === 0
              ? "bg-muted text-muted-foreground ring-border"
              : "bg-success/10 text-success ring-success/20"
          )}
        >
          {count} {count === 1 ? "file" : "files"}
        </span>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date: Date = row.getValue("createdAt")
      return <span className="text-muted-foreground">{date.toLocaleDateString()}</span>
    }
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Modified At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date: Date | null = row.getValue("updatedAt")
      if (!date) return <span className="text-muted-foreground">-</span>
      if (date.getTime() === 0) return <span className="text-muted-foreground">-</span>
      return <span className="text-muted-foreground">{date.toLocaleDateString()}</span>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const portal = row.original
      return (
        <div className="flex items-center justify-end gap-2">
          <DeletePortalDialog portalId={portal.id} portalName={portal.name} />
        </div>
      )
    },
  },
]
