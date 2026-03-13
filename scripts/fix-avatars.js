const fs = require('fs');
const p = 'c:/Users/Spiro/Desktop/WEB.2026/verrex/src/app/[locale]/portal/dashboard/messages/message-bubble.tsx';
let f = fs.readFileSync(p, 'utf8');

// 1. Add avatar helper after senderColor definition
const avatarHelper = [
  '',
  '  // Avatar helper',
  '  const senderAvatar = msg.sender.image',
  '  const senderInitial = msg.sender.name?.charAt(0)?.toUpperCase() || "?"',
  ''
].join('\n');

f = f.replace(
  /const senderColor = ([^\n]+)/,
  'const senderColor = $1' + avatarHelper
);

// 2. Add avatar rendering component as an inline JSX snippet
// We'll add a small Avatar component snippet that can be used in the bubble
// For non-mine messages, we show a small circle avatar before the sender name

// In the text message sender name section (line ~170), add avatar before name
f = f.replace(
  /{showSender && isGroup && !isMine && \(\n<p className=\{`text-\[11px\] font-semibold mb-0\.5/,
  '{showSender && !isMine && (\n<div className="flex items-center gap-1.5 mb-0.5">\n{senderAvatar ? <img src={senderAvatar} alt="" className="h-4 w-4 rounded-full object-cover" /> : <div className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-[8px] font-bold text-blue-600">{senderInitial}</div>}\n<p className={`text-[11px] font-semibold'
);

// Close the wrapper div after the sender name
f = f.replace(
  /font-semibold mb-0\.5 \$\{senderColor\}`\}>\{msg\.sender\.name\}<\/p>\n\)}/,
  'font-semibold mb-0.5 ${senderColor}`}>{msg.sender.name}</p>\n</div>\n)}'
);

// Also update image-only messages sender (line ~108)
f = f.replace(
  /{showSender && isGroup && !isMine && \(\n<p className=\{`text-\[11px\] font-semibold mb-1 px-1/,
  '{showSender && !isMine && (\n<div className="flex items-center gap-1.5 mb-1 px-1">\n{senderAvatar ? <img src={senderAvatar} alt="" className="h-4 w-4 rounded-full object-cover" /> : <div className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-[8px] font-bold text-blue-600">{senderInitial}</div>}\n<p className={`text-[11px] font-semibold'
);

// Close that wrapper too
f = f.replace(
  /font-semibold mb-1 px-1 \$\{senderColor\}`\}>\{msg\.sender\.name\}<\/p>\n\)}/,
  'font-semibold ${senderColor}`}>{msg.sender.name}</p>\n</div>\n)}'
);

fs.writeFileSync(p, f);
console.log('Done! Avatar code injected into message-bubble.tsx');
