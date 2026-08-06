export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "TetherDocs",
  platformFeePercentage: 10,
  maxUploadMb: Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB) || 5,
  maxDocsPerPortal: Number(process.env.NEXT_PUBLIC_MAX_DOCS_PER_PORTAL) || 10,
};
