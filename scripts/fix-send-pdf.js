const fs = require('fs');

// ═══ Fix ESTIMATES page ═══
const p = 'src/app/[locale]/portal/dashboard/estimates/page.tsx';
let f = fs.readFileSync(p, 'utf8');

// 1. Add import for uploadPdfBlob (after SendDocumentModal import)
f = f.replace(
  'import { SendDocumentModal } from "@/components/portal/send-document-modal"',
  'import { SendDocumentModal } from "@/components/portal/send-document-modal"\nimport { uploadPdfBlob } from "@/lib/upload-pdf"'
);

// 2. Add state variables (after sendToModal state)
f = f.replace(
  'const [sendToModal, setSendToModal] = useState(false)',
  'const [sendToModal, setSendToModal] = useState(false)\n  const [sendToPdfUrl, setSendToPdfUrl] = useState("")\n  const [sendToUploading, setSendToUploading] = useState(false)'
);

// 3. Replace the "Send to..." button (3 lines: button open, content, button close)
// Find the exact pattern and replace
const oldButton = `<button onClick={() => setSendToModal(true)} className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition flex items-center gap-1.5" title="Send to contacts">
          <Eye className="h-4 w-4" /><span className="hidden sm:inline">Send to\u2026</span>
        </button>`;

const newButton = `<button onClick={async () => {
          setSendToUploading(true); try {
            const { pdf: renderPdf } = await import("@react-pdf/renderer")
            const pdfDoc = <EstimatePDFDocument est={est} logo={logo || undefined} sigs={sigs} glassSettings={estCfg} gstRate={estCfg.gstRate} qstRate={estCfg.qstRate} showInstallation={estCfg.showInstallation} showDelivery={estCfg.showDelivery} showGST={estCfg.showGST} showQST={estCfg.showQST} paymentStages={estCfg.paymentStages} locale={locale} />
            const blob = await renderPdf(pdfDoc).toBlob()
            const url = await uploadPdfBlob(blob, "Estimate-" + est.estimateNumber + ".pdf")
            setSendToPdfUrl(url); setSendToModal(true)
          } catch (err) { console.error("PDF upload:", err); setSendToModal(true) } finally { setSendToUploading(false) }
        }} disabled={sendToUploading} className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 transition flex items-center gap-1.5" title="Send to contacts">
          {sendToUploading ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="hidden sm:inline">Preparing\u2026</span></> : <><Eye className="h-4 w-4" /><span className="hidden sm:inline">Send to\u2026</span></>}
        </button>`;

if (f.includes(oldButton)) {
  f = f.replace(oldButton, newButton);
  console.log('  ✓ Button replaced');
} else {
  console.log('  ⚠ Button not found, trying line-by-line...');
  // Try simpler match
  f = f.replace(
    'onClick={() => setSendToModal(true)}',
    `onClick={async () => {
          setSendToUploading(true); try {
            const { pdf: renderPdf } = await import("@react-pdf/renderer")
            const pdfDoc = <EstimatePDFDocument est={est} logo={logo || undefined} sigs={sigs} glassSettings={estCfg} gstRate={estCfg.gstRate} qstRate={estCfg.qstRate} showInstallation={estCfg.showInstallation} showDelivery={estCfg.showDelivery} showGST={estCfg.showGST} showQST={estCfg.showQST} paymentStages={estCfg.paymentStages} locale={locale} />
            const blob = await renderPdf(pdfDoc).toBlob()
            const url = await uploadPdfBlob(blob, "Estimate-" + est.estimateNumber + ".pdf")
            setSendToPdfUrl(url); setSendToModal(true)
          } catch (err) { console.error("PDF upload:", err); setSendToModal(true) } finally { setSendToUploading(false) }
        }} disabled={sendToUploading}`
  );
  // Add Loader2 import check
  f = f.replace(
    '<Eye className="h-4 w-4" /><span className="hidden sm:inline">Send to\u2026</span>',
    '{sendToUploading ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="hidden sm:inline">Preparing\u2026</span></> : <><Eye className="h-4 w-4" /><span className="hidden sm:inline">Send to\u2026</span></>}'
  );
  console.log('  ✓ Button replaced (fallback)');
}

// 4. Update SendDocumentModal fileUrl to use uploaded URL
f = f.replace(
  "fileUrl: `/api/portal/estimates/${activeId}/pdf`",
  "fileUrl: sendToPdfUrl"
);

// 5. Check if Loader2 is imported
if (!f.includes('Loader2')) {
  // Add Loader2 to lucide-react imports
  f = f.replace(
    /from "lucide-react"/,
    (match) => {
      // Find the import block and add Loader2
      return match;
    }
  );
  // Simpler: just add at top
  f = f.replace(
    'import { SendDocumentModal }',
    'import { Loader2 } from "lucide-react"\nimport { SendDocumentModal }'
  );
}

fs.writeFileSync(p, f);
console.log('✅ Estimates page updated');

// Verify
const verify = fs.readFileSync(p, 'utf8');
console.log('  Has uploadPdfBlob import:', verify.includes('uploadPdfBlob'));
console.log('  Has sendToPdfUrl state:', verify.includes('sendToPdfUrl'));
console.log('  Has sendToUploading state:', verify.includes('sendToUploading'));
console.log('  fileUrl uses sendToPdfUrl:', verify.includes('fileUrl: sendToPdfUrl'));
