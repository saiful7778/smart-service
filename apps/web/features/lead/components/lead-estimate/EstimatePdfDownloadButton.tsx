"use client";

import { lazy, Suspense } from "react";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";

import { buttonVariants } from "@workspace/ui/components/button";

const EstimatePdf = lazy(() =>
  import("@workspace/pdf/templates/EstimatePdf").then((mod) => ({
    default: mod.EstimatePdf,
  }))
);

export function EstimatePdfDownloadButton({
  estimateId,
  estimateData,
}: {
  estimateId: string;
  estimateData: React.ComponentProps<typeof EstimatePdf>["estimateData"];
}) {
  return (
    <Suspense fallback={<div className="text-xs/relaxed">Loading pdf...</div>}>
      <PDFDownloadLink
        data-slot="button"
        document={<EstimatePdf estimateData={estimateData} />}
        fileName={`estimate-${estimateId}.pdf`}
        className={buttonVariants({
          variant: "default",
          size: "default",
        })}
      >
        {({ loading }) =>
          loading ? (
            <span>Loading pdf...</span>
          ) : (
            <>
              <Download />
              <span>Download Estimate</span>
            </>
          )
        }
      </PDFDownloadLink>
    </Suspense>
  );
}
