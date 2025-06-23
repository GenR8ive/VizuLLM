#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function pascalCase(text) {
  return text
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

async function generateVisual() {
  console.log('🎨 VisuLLM Visual Generator\n');
  console.log('This script will help you create a new visual component from the template.\n');

  try {
    // Get component details
    const componentName = await question('Visual name (e.g., "Invoice Generator"): ');
    const description = await question('Visual description: ');
    const author = await question('Your GitHub username: ');
    
    // Generate slugs and names
    const slug = slugify(componentName);
    const componentNamePascal = pascalCase(componentName);
    
    console.log('\n📋 Visual Details:');
    console.log(`Name: ${componentName}`);
    console.log(`Slug: ${slug}`);
    console.log(`Author: ${author}`);
    console.log(`Description: ${description}`);

    const confirm = await question('\nProceed with generation? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Generation cancelled.');
      rl.close();
      return;
    }

    // Create component directory
    const componentDir = path.join(__dirname, '..', 'visuals', slug);
    if (fs.existsSync(componentDir)) {
      console.log(`❌ Visual directory already exists: ${componentDir}`);
      rl.close();
      return;
    }

    fs.mkdirSync(componentDir, { recursive: true });
    console.log(`✅ Created directory: ${componentDir}`);

    // Read template files
    const templateDir = path.join(__dirname, '..', 'visuals', 'visual-template');
    
    // Generate schema.ts
    const schemaTemplate = fs.readFileSync(path.join(templateDir, 'schema.ts'), 'utf8');
    const schemaContent = schemaTemplate
      .replace(/YourComponentSchema/g, `${componentNamePascal}Schema`)
      .replace(/YourComponentData/g, `${componentNamePascal}Data`);
    
    fs.writeFileSync(path.join(componentDir, 'schema.ts'), schemaContent);
    console.log('✅ Generated schema.ts');

    // Generate component.tsx
    const componentTemplate = fs.readFileSync(path.join(templateDir, 'component.tsx'), 'utf8');
    const componentContent = componentTemplate
      .replace(/YourComponentSchema/g, `${componentNamePascal}Schema`)
      .replace(/YourComponentData/g, `${componentNamePascal}Data`)
      .replace(/YourComponent/g, componentNamePascal)
      .replace(/your-component-slug/g, slug);
    
    fs.writeFileSync(path.join(componentDir, 'component.tsx'), componentContent);
    console.log('✅ Generated component.tsx');

    // Copy sample-data.json
    const sampleData = fs.readFileSync(path.join(templateDir, 'sample-data.json'), 'utf8');
    const sampleDataContent = sampleData
      .replace(/Sample Component/g, componentName)
      .replace(/This is a sample subtitle/g, description);
    
    fs.writeFileSync(path.join(componentDir, 'sample-data.json'), sampleDataContent);
    console.log('✅ Generated sample-data.json');

    // Generate metadata.json
    const metadata = {
      name: componentName,
      version: "1.0.0",
      description: description,
      author: author,
      slug: slug
    };
    
    fs.writeFileSync(path.join(componentDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
    console.log('✅ Generated metadata.json');


    // Update visuals/list.json
    const listPath = path.join(__dirname, '..', 'visuals', 'list.json');
    const listContent = JSON.parse(fs.readFileSync(listPath, 'utf8'));
    
    const newComponent = {
      name: componentName,
      slug: slug,
      author: author,
      description: description,
      preview: `visuals/${slug}/preview.png`,
      schema: `visuals/${slug}/schema.ts`,
      componentPath: `visuals/${slug}/component.tsx`
    };
    
    listContent.push(newComponent);
    fs.writeFileSync(listPath, JSON.stringify(listContent, null, 2));
    console.log('✅ Updated visuals/list.json');

    console.log('\n🎉 Visual generated successfully!');
    console.log('\n📁 Next steps:');
    console.log(`1. Navigate to: visuals/${slug}/`);
    console.log('2. Customize the schema in schema.ts');
    console.log('3. Implement your visual in component.tsx');
    console.log('4. Update sample-data.json with realistic data');
    console.log('5. Test your visual: npm run dev');
    console.log(`6. Visit: http://localhost:5173/visual/${slug}`);
    console.log('\n📚 For more information, see CONTRIBUTING.md');

  } catch (error) {
    console.error('❌ Error generating visual:', error.message);
  } finally {
    rl.close();
  }
}

// Run the generator
generateVisual(); 