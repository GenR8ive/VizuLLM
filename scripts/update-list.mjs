#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function updateVisualsList() {
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

    // Create a map of existing components by slug for quick lookup
    const existingComponentsMap = new Map();
    existingList.forEach(component => {
      existingComponentsMap.set(component.slug, component);
    });

    // Track which components we've processed
    const processedSlugs = new Set();
    const newComponents = [];
    const updatedComponents = [];

    // Process all component directories
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

        const componentEntry = {
          name: metadata.name || dirName,
          slug: metadata.slug || dirName,
          author: metadata.author || 'unknown',
          description: metadata.description || 'No description available',
          schema: schemaPath,
          componentPath: `visuals/${dirName}/component.tsx`,
          createdAt: metadata.createdAt || Date.now()
        };

        // Check if this is an existing component
        const existingComponent = existingComponentsMap.get(dirName);
        if (existingComponent) {
          // Update existing component with latest metadata
          const updatedComponent = {
            ...existingComponent,
            name: componentEntry.name,
            author: componentEntry.author,
            description: componentEntry.description,
            schema: componentEntry.schema,
            componentPath: componentEntry.componentPath,
            createdAt: componentEntry.createdAt
          };
          updatedComponents.push(updatedComponent);
          processedSlugs.add(dirName);
          console.log(`🔄 Updated existing component: ${dirName}:`);
          console.log(`   Name: ${componentEntry.name}`);
          console.log(`   Author: ${componentEntry.author}`);
          console.log(`   Description: ${componentEntry.description}`);
          console.log('');
        } else {
          // This is a new component
          newComponents.push(componentEntry);
          processedSlugs.add(dirName);
          console.log(`🆕 Added new component: ${dirName}:`);
          console.log(`   Name: ${componentEntry.name}`);
          console.log(`   Author: ${componentEntry.author}`);
          console.log('');

        }

      } catch (error) {
        console.log(`❌ Error processing ${dirName}: ${error.message}`);
      }
    }

    // Remove components that no longer exist
    const removedComponents = existingList.filter(component => 
      !fs.existsSync(path.join(visualsDir, component.slug))
    );
    
    if (removedComponents.length > 0) {
      console.log('🗑️  Removed components:');
      removedComponents.forEach(component => {
        console.log(`   - ${component.name} (${component.slug})`);
      });
      console.log('');
    }

    // Combine new components with updated existing components and sort by createdAt (newest first)
    const updatedList = [
      ...newComponents,
      ...existingList
        .filter(component => fs.existsSync(path.join(visualsDir, component.slug)))
        .map(component => {
          const updatedComponent = updatedComponents.find(updated => updated.slug === component.slug);
          return updatedComponent || component;
        })
    ].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Write updated list
    fs.writeFileSync(listPath, JSON.stringify(updatedList, null, 2));
    
    console.log(`🎉 Successfully updated list.json with ${updatedList.length} components`);
    console.log(`📄 Updated file: ${listPath}`);
    
    // Show summary
    console.log('\n📋 Final list:');
    updatedList.forEach((component, index) => {
      const isNew = newComponents.some(newComp => newComp.slug === component.slug);
      const isUpdated = updatedComponents.some(updatedComp => updatedComp.slug === component.slug);
      let marker = '✅';
      if (isNew) marker = '🆕';
      else if (isUpdated) marker = '🔄';
      console.log(`${index + 1}. ${marker} ${component.name} (${component.slug}) - by ${component.author}`);
    });

    if (newComponents.length > 0) {
      console.log(`\n✨ Added ${newComponents.length} new component(s) to the beginning of the list`);
    }
    
    if (updatedComponents.length > 0) {
      console.log(`🔄 Updated ${updatedComponents.length} existing component(s) with latest metadata`);
    }

  } catch (error) {
    console.error('❌ Error updating visuals list:', error.message);
    process.exit(1);
  }
}

// Run the script
updateVisualsList(); 