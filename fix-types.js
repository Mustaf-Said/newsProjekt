const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components', 'ui');

// Patterns to fix
const fixes = [
  // Basic div components
  {
    pattern: /const (\w+) = React\.forwardRef\(\(\{ className, \.\.\.props \}, ref\) => \(/g,
    replacement: 'const $1 = React.forwardRef<\n  React.ElementRef<"div">,\n  React.ComponentPropsWithoutRef<"div">\n>(({ className, ...props }, ref) => ('
  },
  // Components with variant
  {
    pattern: /const (\w+) = React\.forwardRef\(\(\{ className, variant, \.\.\.props \}, ref\) => \(/g,
    replacement: 'const $1 = React.forwardRef<\n  React.ElementRef<"div">,\n  React.ComponentPropsWithoutRef<"div"> & { variant?: any }\n>(({ className, variant, ...props }, ref) => ('
  },
  // Components with children
  {
    pattern: /const (\w+) = React\.forwardRef\(\(\{ className, children, \.\.\.props \}, ref\) => \(/g,
    replacement: 'const $1 = React.forwardRef<\n  React.ElementRef<"div">,\n  React.ComponentPropsWithoutRef<"div">\n>(({ className, children, ...props }, ref) => ('
  }
];

const files = fs.readdirSync(componentsDir);

files.forEach(file => {
  if (!file.endsWith('.tsx')) return;
  
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  let modified = false;
  fixes.forEach(fix => {
    const newContent = content.replace(fix.pattern, fix.replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('Done!');
