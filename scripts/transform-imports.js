#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Regular expression to match relative imports
// This will match imports starting with './' or '../' or just local files without './'
const relativeImportRegex =
  /(import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"])([\.\/][^'"]*?|[^@\/][^'"/][^'"]*?)(['"])/g;

// Function to determine the directory part of the current file path
function getTargetDirectory(filePath) {
  const fileDir = path.dirname(filePath);
  const fileName = path.basename(filePath, path.extname(filePath));
  return path.basename(fileDir);
}

// Function to transform a single file
function transformFile(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, "utf-8");

    // Only process if it's a JavaScript or TypeScript file
    if (!filePath.match(/\.(js|jsx|ts|tsx)$/)) {
      return false;
    }

    const dirName = getTargetDirectory(filePath);

    // Transform relative imports to alias imports
    const newContent = content.replace(
      relativeImportRegex,
      (match, prefix, importPath, suffix) => {
        // If it's already using an alias or an external package, don't modify
        if (
          importPath.startsWith("@/") ||
          (importPath.startsWith("@") && importPath[1] !== "/")
        ) {
          return match;
        }

        // Handle different types of relative paths
        let newPath;

        if (importPath.startsWith("./")) {
          // Convert ./File to @/dirName/File
          newPath = "@/" + dirName + "/" + importPath.substring(2);
        } else if (importPath.startsWith("../")) {
          // Handle any number of '../'
          const segments = importPath.split("/");
          const relativeDepth = segments.filter((s) => s === "..").length;
          const pathSegments = segments.slice(relativeDepth);
          newPath = "@/" + pathSegments.join("/");
        } else if (!importPath.includes("/")) {
          // For imports like "File" without ./ in the same directory
          newPath = "@/" + dirName + "/" + importPath;
        } else {
          // For other cases, assume it's a relative path
          newPath = "@/" + importPath;
        }

        return `${prefix}${newPath}${suffix}`;
      }
    );

    // Only write to file if content has changed
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, "utf-8");
      console.log(`Transformed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Function to recursively process a directory
function processDirectory(directoryPath) {
  let transformedCount = 0;

  // Get all files in the directory
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Skip node_modules and hidden directories
      if (file !== "node_modules" && !file.startsWith(".")) {
        transformedCount += processDirectory(filePath);
      }
    } else if (stats.isFile()) {
      if (transformFile(filePath)) {
        transformedCount++;
      }
    }
  }

  return transformedCount;
}

// Function to clean up a path that might have quotes from drag and drop
function cleanPath(inputPath) {
  // Remove surrounding quotes if they exist
  let cleanedPath = inputPath.trim();
  if (
    (cleanedPath.startsWith("'") && cleanedPath.endsWith("'")) ||
    (cleanedPath.startsWith('"') && cleanedPath.endsWith('"'))
  ) {
    cleanedPath = cleanedPath.substring(1, cleanedPath.length - 1);
  }
  return cleanedPath;
}

// Main function
function main() {
  rl.question(
    "Enter the root directory path (you can drag & drop the folder): ",
    (rootDir) => {
      // Clean up the path from potential drag and drop quotes
      const cleanedRootDir = cleanPath(rootDir);

      // Normalize and resolve the path
      const directoryPath = path.resolve(cleanedRootDir);

      // Check if the directory exists
      if (
        !fs.existsSync(directoryPath) ||
        !fs.statSync(directoryPath).isDirectory()
      ) {
        console.error(`Error: '${directoryPath}' is not a valid directory.`);
        rl.close();
        return;
      }

      console.log(`Processing directory: ${directoryPath}`);

      // Start processing
      const startTime = Date.now();
      const transformedCount = processDirectory(directoryPath);
      const endTime = Date.now();

      console.log(
        `\nOperation completed in ${(endTime - startTime) / 1000} seconds.`
      );
      console.log(`Transformed ${transformedCount} files.`);

      rl.close();
    }
  );
}

// Run the script
main();
