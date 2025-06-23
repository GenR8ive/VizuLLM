#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateVisualsList() {
  console.log('🔄 Updating visuals list...\n');

  try {
    const visualsDir = path.join(__dirname, '..', 'visuals');
    const listPath = path.join(visualsDir, 'list.json');
    
    // Read existing list.json
    let existingList = [];
    if (fs.existsSync(listPath)) {
      existingList = JSON.parse(fs.readFileSync(listPath, 'utf8'));
      console.log(`📖 Found existing list with ${existingList.length} components`);
    }

    // Get all directories in visuals folder
    const items = fs.readdirSync(visualsDir, { withFileTypes: true });
    const componentDirs = items
      .filter(item => item.isDirectory())
      .filter(item => item.name !== 'visual-template') // Exclude template
      .map(item => item.name);

    console.log(`📁 Found ${componentDirs.length} component directories: ${componentDirs.join(', ')}\n`);

    const updatedList = [];

    for (const dirName of componentDirs) {
      const componentDir = path.join(visualsDir, dirName);
      const metadataPath = path.join(componentDir, 'metadata.json');
      
      if (!fs.existsSync(metadataPath)) {
        console.log(`⚠️  Warning: No metadata.json found in ${dirName}, skipping...`);
        continue;
      }

      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        
        // Check if component.tsx exists
        const componentPath = path.join(componentDir, 'component.tsx');
        if (!fs.existsSync(componentPath)) {
          console.log(`⚠️  Warning: No component.tsx found in ${dirName}, skipping...`);
          continue;
        }

        // Check if schema file exists (could be .ts or .json)
        let schemaPath = null;
        const schemaTsPath = path.join(componentDir, 'schema.ts');
        const schemaJsonPath = path.join(componentDir, 'schema.json');
        
        if (fs.existsSync(schemaTsPath)) {
          schemaPath = `visuals/${dirName}/schema.ts`;
        } else if (fs.existsSync(schemaJsonPath)) {
          schemaPath = `visuals/${dirName}/schema.json`;
        } else {
          console.log(`⚠️  Warning: No schema file found in ${dirName}, skipping...`);
          continue;
        }

        // Check if preview image exists
        const previewPath = path.join(componentDir, 'preview.png');
        const previewExists = fs.existsSync(previewPath);

        const componentEntry = {
          name: metadata.name || dirName,
          slug: metadata.slug || dirName,
          author: metadata.author || 'unknown',
          description: metadata.description || 'No description available',
          preview: `visuals/${dirName}/preview.png`,
          schema: schemaPath,
          componentPath: `visuals/${dirName}/component.tsx`
        };

        updatedList.push(componentEntry);
        
        console.log(`✅ Processed ${dirName}:`);
        console.log(`   Name: ${componentEntry.name}`);
        console.log(`   Author: ${componentEntry.author}`);
        console.log(`   Preview: ${previewExists ? '✅' : '❌'} (${previewExists ? 'exists' : 'missing'})`);
        console.log('');

      } catch (error) {
        console.log(`❌ Error processing ${dirName}: ${error.message}`);
      }
    }

    // Sort by name for consistent ordering
    updatedList.sort((a, b) => a.name.localeCompare(b.name));

    // Write updated list
    fs.writeFileSync(listPath, JSON.stringify(updatedList, null, 2));
    
    console.log(`🎉 Successfully updated list.json with ${updatedList.length} components`);
    console.log(`📄 Updated file: ${listPath}`);
    
    // Show summary
    console.log('\n📋 Final list:');
    updatedList.forEach((component, index) => {
      console.log(`${index + 1}. ${component.name} (${component.slug}) - by ${component.author}`);
    });

  } catch (error) {
    console.error('❌ Error updating visuals list:', error.message);
    process.exit(1);
  }
}

// Run the script
updateVisualsList(); 