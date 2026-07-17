"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  deleteDocumentAction,
  updatePortal,
  deletePortal,
} from "../../actions";
import { appConfig } from "@/config";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Upload,
  FileText,
  Trash2,
  ArrowLeft,
  Save,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { FormError } from "@/components/ui/form-error";
import { toast } from "sonner";

interface Document {
  id: string;
  portalId: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
}

interface Portal {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  priceInCents: number;
  createdAt: Date;
}

interface PortalManagerProps {
  portal: Portal;
  documents: Document[];
}

export function PortalManager({ portal, documents }: PortalManagerProps) {
  const [name, setName] = useState(portal.name);
  const [slug, setSlug] = useState(portal.slug);
  const [description, setDescription] = useState(portal.description || "");
  const [price, setPrice] = useState((portal.priceInCents / 100).toFixed(2));

  const [savingSettings, setSavingSettings] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingPortal, setDeletingPortal] = useState(false);

  const [settingsError, setSettingsError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [isDragOver, setIsDragOver] = useState(false);

  const router = useRouter();

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsError("");

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setSettingsError("Please enter a valid price greater than $0.");
      setSavingSettings(false);
      return;
    }

    if (description.length > 100) {
      setSettingsError("Description must be 100 characters or less.");
      setSavingSettings(false);
      return;
    }

    try {
      await updatePortal(portal.id, {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, ""),
        description: description || undefined,
        priceInCents: Math.round(parsedPrice * 100),
      });
      toast.success("Settings saved successfully!");
      router.refresh();
    } catch (err: any) {
      setSettingsError(err?.message || "Failed to update portal settings.");
      toast.error("Failed to update portal settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    
    if (validFiles.length === 0) {
      setUploadError("Only PDF files are allowed.");
      return;
    }

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    for (const file of validFiles) {
      formData.append("file", file);
    }
    formData.append("portalId", portal.id);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload files.");
      }

      router.refresh();
    } catch (err: any) {
      setUploadError(err?.message || "File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(Array.from(files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFiles(Array.from(files));
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    setDeletingId(docId);
    try {
      await deleteDocumentAction(docId, portal.id);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeletePortal = async () => {
    setDeletingPortal(true);
    try {
      await deletePortal(portal.id);
      toast.success("Portal deleted successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete portal.");
      setDeletingPortal(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const publicPortalUrl = `/p/${portal.slug}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className={buttonVariants({
            variant: "ghost",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <Link
          href={publicPortalUrl}
          target="_blank"
          className={buttonVariants({
            variant: "accent",
          })}
        >
          View Public Page
          <ExternalLink width={30} height={30} />
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {portal.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage portal settings and upload documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle: Document list & Uploader */}
        <div className="lg:col-span-2 space-y-8">
          {/* Disclaimer Banner */}
          <div className="bg-accent/5 border border-accent/50 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Important Privacy Notice</p>
              <p>
                Please ensure that you do not upload any documents containing sensitive personal information, such as Social Security Numbers (SSN), driver's license numbers, or full bank account details.
              </p>
            </div>
          </div>

          {/* Uploader Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg">
                Upload PDF Files
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Drag and drop your PDF files here, or click to browse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label
                htmlFor="pdf-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-muted/30"
                }`}
              >
                <input
                  id="pdf-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  onClick={(e) => {
                    e.currentTarget.value = "";
                  }}
                  accept="application/pdf"
                  className="sr-only"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-foreground animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  {uploading ? (
                    <p className="text-sm font-medium text-foreground">
                      Uploading PDF documents...
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">
                        Drag & drop file(s) here, or{" "}
                        <span className="text-accent underline">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Only PDF files are supported
                      </p>
                    </>
                  )}
                </div>
              </label>
              {uploadError && (
                <FormError className="mt-4">{uploadError}</FormError>
              )}
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg">
                Documents in Bundle ({documents.length})
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                These files will be zipped and emailed to buyers upon successful
                purchase.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t border-border">
              {documents.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <FileText className="w-12 h-12 text-secondary mb-3" />
                  <h3 className="font-medium text-lg text-foreground">
                    No documents yet
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Upload your first PDF document above. These files will be
                    zipped and emailed to buyers upon successful purchase.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium py-3 pl-6">
                        Filename
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Size
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Added
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right pr-6">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="border-b border-border hover:bg-muted/30"
                      >
                        <TableCell className="font-medium text-foreground py-3 pl-6 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span
                            className="truncate max-w-[240px] sm:max-w-xs"
                            title={doc.fileName}
                          >
                            {doc.fileName}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatBytes(doc.fileSize)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === doc.id}
                            onClick={() => handleDeleteDoc(doc.id)}
                            aria-label={`Delete ${doc.fileName}`}
                          >
                            {deletingId === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Settings Form */}
        <div className="space-y-6 sticky top-24 self-start">
          <Card className="bg-secondary/2 border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg">
                Portal Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Update storefront pricing and URL slug.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-xs font-medium text-foreground"
                  >
                    Portal Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background border-border text-foreground focus-visible:ring-primary focus-visible:border-primary"
                    required
                    disabled={savingSettings}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="slug"
                    className="text-xs font-medium text-foreground"
                  >
                    Public Slug
                  </Label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                      /p/
                    </span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSlug(
                          val
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-_]/g, ""),
                        );
                      }}
                      className="rounded-l-none bg-background border-border text-foreground focus-visible:ring-primary focus-visible:border-primary"
                      required
                      disabled={savingSettings}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Portal URL preview:{" "}
                    <code className="text-foreground">{`/p/${slug}`}</code>
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="description"
                    className="text-xs font-medium text-foreground"
                  >
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="e.g. Official document package for secure distribution..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={100}
                    className="bg-background border-border text-foreground focus-visible:ring-primary focus-visible:border-primary resize-none"
                    disabled={savingSettings}
                  />
                  <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                    {description.length}/100 characters.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="price"
                    className="text-xs font-medium text-foreground"
                  >
                    Price (USD)
                  </Label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="in line-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={price}
                      placeholder="100.00"
                      onChange={(e) => setPrice(e.target.value)}
                      className="rounded-l-none bg-background border-border text-foreground focus-visible:ring-primary focus-visible:border-primary"
                      required
                      disabled={savingSettings}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                    The platform retains a {appConfig.platformFeePercentage}%
                    fee on each transaction.
                  </p>
                </div>

                {settingsError && <FormError>{settingsError}</FormError>}

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full mt-2"
                  disabled={savingSettings}
                >
                  {savingSettings ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full mt-4"
                      disabled={deletingPortal}
                    />
                  }
                >
                  {deletingPortal ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Portal
                    </>
                  )}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Portal</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this portal? This action
                      cannot be undone and all associated documents will be
                      permanently removed.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose render={<Button variant="ghost" />}>
                      Cancel
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleDeletePortal}
                      disabled={deletingPortal}
                    >
                      {deletingPortal ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Portal"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
