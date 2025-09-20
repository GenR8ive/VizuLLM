#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

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

function parseCliArgs() {
  const args = process.argv.slice(2);
  
  // Check if we have positional arguments (npm is passing them this way)
  if (args.length > 0 && !args[0].startsWith('-')) {
    // Handle positional arguments from npm script
    if (args.length >= 3) {
      return {
        name: args[0],
        description: args[1],
        author: args[2]
      };
    }
    return {};
  }

  // Handle proper CLI arguments
  const options = {
    name: {
      type: 'string',
      short: 'n'
    },
    description: {
      type: 'string',
      short: 'd'
    },
    author: {
      type: 'string',
      short: 'a'
    },
    help: {
      type: 'boolean',
      short: 'h'
    }
  };

  try {
    const { values } = parseArgs({ 
      options, 
      allowPositionals: true,
      args: args
    });
    
    return values;
  } catch (error) {
    console.error('❌ Error parsing arguments:', error.message);
    showHelp();
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🎨 VizuLLM Visual Generator

Usage:
  npm run generate-visual                                           # Interactive mode
  npm run generate-visual -- --name "Visual Name" --description "Description" --author "username"

Options:
  -n, --name <name>              Visual name (e.g., "Invoice Generator")
  -d, --description <desc>       Visual description
  -a, --author <username>        Your GitHub username
  -h, --help                     Show this help message

Examples:
  npm run generate-visual
  npm run generate-visual -- --name "Chart Builder" --description "Interactive chart creation tool" --author "johndoe"
  npm run generate-visual -- -n "Dashboard" -d "Analytics dashboard" -a "jane"
`);
}

async function getComponentDetails(args) {
  const details = {};

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Check if all required args are provided
  const hasAllArgs = args.name && args.description && args.author;

  if (hasAllArgs) {
    // CLI Mode - use provided arguments without prompting
    console.log('🎨 VizuLLM Visual Generator (CLI Mode)\n');
    details.componentName = args.name.trim();
    details.description = args.description.trim();
    details.author = args.author.trim();
  } else {
    // Interactive Mode - prompt for missing parameters
    console.log('🎨 VizuLLM Visual Generator (Interactive Mode)\n');
    console.log('This script will help you create a new visual component from the template.\n');

    details.componentName = await question('Visual name (e.g., "Invoice Generator"): ');
    details.description = await question('Visual description: ');
    details.author = await question('Your GitHub username: ');
  }

  // Validate inputs
  if (!details.componentName?.trim()) {
    throw new Error('Visual name is required');
  }
  if (!details.description?.trim()) {
    throw new Error('Visual description is required');
  }
  if (!details.author?.trim()) {
    throw new Error('Author username is required');
  }

  return details;
}

async function confirmGeneration(componentName, slug, author, description, isCliMode) {
  console.log('\n📋 Visual Details:');
  console.log(`Name: ${componentName}`);
  console.log(`Slug: ${slug}`);
  console.log(`Author: ${author}`);
  console.log(`Description: ${description}`);

  if (isCliMode) {
    // In CLI mode, proceed without confirmation
    console.log('\n✅ Proceeding with generation...');
    return true;
  } else {
    // In interactive mode, ask for confirmation
    const confirm = await question('\nProceed with generation? (y/N): ');
    return confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes';
  }
}

async function generateVisual() {
  try {
    // Parse command line arguments
    const args = parseCliArgs();
    const isCliMode = args.name && args.description && args.author;

    // Get component details
    const { componentName, description, author } = await getComponentDetails(args);
    
    // Generate slugs and names
    const slug = slugify(componentName);
    const componentNamePascal = pascalCase(componentName);

    // Confirm generation
    const shouldProceed = await confirmGeneration(componentName, slug, author, description, isCliMode);
    
    if (!shouldProceed) {
      console.log('❌ Generation cancelled.');
      return;
    }

    // Create component directory
    const componentDir = path.join(__dirname, '..', 'visuals', slug);
    if (fs.existsSync(componentDir)) {
      throw new Error(`Visual directory already exists: ${componentDir}`);
    }

    fs.mkdirSync(componentDir, { recursive: true });
    console.log(`✅ Created directory: ${componentDir}`);

    // Read template files
    const templateDir = path.join(__dirname, '..', 'visuals', 'visual-template');
    
    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

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
    if (!fs.existsSync(listPath)) {
      console.warn('⚠️  visuals/list.json not found, creating new file');
      fs.writeFileSync(listPath, '[]');
    }

    const listContent = JSON.parse(fs.readFileSync(listPath, 'utf8'));
    
    // Check if component already exists in the list
    const existingComponent = listContent.find(comp => comp.slug === slug);
    if (existingComponent) {
      throw new Error(`Component with slug '${slug}' already exists in visuals/list.json`);
    }

    const newComponent = {
      name: componentName,
      slug: slug,
      author: author,
      description: description,
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
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the generator
generateVisual();