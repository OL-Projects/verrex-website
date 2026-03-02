const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'portal', 'dashboard', 'estimates', 'page.tsx');
let f = fs.readFileSync(filePath, 'utf8');

// Notes label
f = f.replace('>Notes</label>', '>{T.notes}</label>');

// Special instructions placeholder - match the unicode ellipsis
f = f.replace(/placeholder="Special instructions\u2026"/, 'placeholder={T.est.specialInstructions}');

// Attachments label
f = f.replace('>Attachments</label>', '>{T.est.attachments}</label>');

// + Attach label
f = f.replace('+ Attach', '+ {T.attach}');

// Qty label
f = f.replace('>Qty</label>', '>{T.qty}</label>');

// Unit Price label
f = f.replace('>Unit Price</label>', '>{T.unitPrice}</label>');

// Calculated Price label
f = f.replace('>Calculated Price</label>', '>{T.est.calculatedPrice}</label>');

// Add Room / Add Window / Add Door buttons
f = f.replace(/> Add Room<\/button>/g, '> {T.addRoom}</button>');
f = f.replace(/> Add Window<\/button>/g, '> {T.addWindow}</button>');
f = f.replace(/> Add Door<\/button>/g, '> {T.addDoor}</button>');

// Summary section
f = f.replace('>Products Subtotal</span>', '>{T.est.productsSubtotal}</span>');
f = f.replace('>Installation ({t.totalUnits}', '>{T.est.installation} ({t.totalUnits}');
f = f.replace('>Delivery $<', '>{T.est.deliveryLabel} $<');
f = f.replace('>Subtotal Before Tax</span>', '>{T.est.subtotalBeforeTax}</span>');
f = f.replace('>Trim Total</span>', '>{T.est.trimTotal}</span>');

// Sticky bar labels
f = f.replace('>Settings</span>', '>{T.settings}</span>');
f = f.replace('>Reset</span>', '>{T.est.resetAll}</span>');
f = f.replace('>Save</span>', '>{T.save}</span>');
f = f.replace('>Preview</span>', '>{T.preview}</span>');
f = f.replace('>Export PDF</span>', '>{T.est.exportPdf}</span>');
// Send button (first occurrence in sticky bar)
f = f.replace('>Send</span>', '>{T.est.send}</span>');

// Send modal header
f = f.replace('>Send Estimate</span>', '>{T.est.sendEstimate}</span>');

// PDF status messages - handle unicode chars
f = f.replace(/> PDF downloaded \u2014 please attach it to your outgoing email<\//, '> {T.est.pdfDownloaded}</');
f = f.replace(/> Generating and downloading PDF\u2026<\//, '> {T.est.generatingPdf}</');

// No email
f = f.replace('>(no email)</span>', '>({T.est.noEmail})</span>');

// Copy/Open buttons
f = f.replace(/📋 Copy Email Text/, '{T.est.copyEmailText}');
f = f.replace('Open Email Client', '{T.est.openEmailClient}');

// Acceptance & Signatures section
f = f.replace('>Acceptance & Signatures</p>', '>{T.est.acceptanceSignatures}</p>');
f = f.replace('By signing below, the client accepts the terms, specifications, and pricing outlined in this estimate.', '{T.est.signatureDisclaimer}');
f = f.replace('>Click to sign</span>', '>{T.est.clickToSign}</span>');
f = f.replace('>+ Add clause</button>', '>{T.est.addClause}</button>');

// Override global rate text
f = f.replace('Override global rate (${est.installPerUnit}/unit)', '{T.est.overrideGlobalRate} (${est.installPerUnit}/{T.est.unit})');
f = f.replace('Custom install price', '{T.est.customInstallPrice}');

fs.writeFileSync(filePath, f);
console.log('Done - all replacements applied successfully');
