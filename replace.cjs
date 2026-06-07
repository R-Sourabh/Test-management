const fs = require('fs');

const replacements = {
  // Brand
  '#6D7EF2': 'brand',
  '#5E71EC': 'brand-hover',
  '#191D59': 'brand-dark',
  '#EEF3FF': 'brand-light',
  '#2E63F5': 'brand-alt',
  '#315EF6': 'brand-alt',
  '#4C6FFF': 'brand-alt',
  
  // Content
  '#1F2A3C': 'content-main',
  '#3A4658': 'content-body',
  '#4F5C6F': 'content-muted',
  '#6E7A8A': 'content-subtle',
  '#8B96A8': 'content-lighter',
  '#AAB4C3': 'content-lightest',
  '#BEC7D3': 'content-lighter',
  
  // Surface
  '#EBF0F6': 'surface-base',
  '#E8EDF5': 'surface-card',
  '#E4EAF3': 'surface-input',
  '#F4F6FB': 'surface-hover',
  '#2F3A4C': 'surface-dark',
  
  // Status Success
  '#25A76C': 'status-success',
  '#E8F8F0': 'status-success-bg',
  '#BDE8D3': 'status-success-border',
  '#3AC3B2': 'status-success', 
  
  // Status Warning
  '#D3A127': 'status-warning',
  '#FFF9EC': 'status-warning-bg',
  '#FFD67A': 'status-warning-border',
  
  // Status Danger
  '#D14343': 'status-danger',
  '#F26D6D': 'status-danger-hover',
  '#FFF5F5': 'status-danger-bg',
  '#F2C7C7': 'status-danger-border',
  '#FF8484': 'status-danger-hover', 
  '#FF7C7C': 'status-danger-hover', 
  
  // Font sizes
  '\\[14px\\]': 'sm',
  '\\[12px\\]': 'xs',
  '\\[16px\\]': 'base',
  '\\[20px\\]': 'xl',
};

const files = [
  'src/features/questions/AddQuestionsPage.tsx',
  'src/features/tests/PreviewPublishPage.tsx',
  'src/features/tests/DashboardPage.tsx',
  'src/features/tests/CreateEditTestPage.tsx',
  'src/components/layout/AppLayout.tsx',
  'src/features/auth/LoginPage.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    Object.entries(replacements).forEach(([hex, name]) => {
      const safeHex = hex.startsWith('#') ? `\\[${hex}\\]` : hex;
      const regex = new RegExp(safeHex, 'gi');
      content = content.replace(regex, name);
    });
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
