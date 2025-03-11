import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface Project {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Add other fields as needed
}

async function removeDuplicateProjects() {
  console.log('Starting duplicate project cleanup...');
  
  try {
    // Get all projects
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('id, name, status, created_at, updated_at');
    
    if (fetchError) {
      throw new Error(`Error fetching projects: ${fetchError.message}`);
    }
    
    if (!projects || projects.length === 0) {
      console.log('No projects found. Nothing to do.');
      return;
    }
    
    console.log(`Found ${projects.length} total projects.`);
    
    // Group projects by name
    const projectsByName: Record<string, Project[]> = {};
    projects.forEach((project: Project) => {
      const name = project.name.trim().toLowerCase();
      if (!projectsByName[name]) {
        projectsByName[name] = [];
      }
      projectsByName[name].push(project);
    });
    
    // Find duplicates
    const duplicateNames = Object.keys(projectsByName).filter(name => projectsByName[name].length > 1);
    
    if (duplicateNames.length === 0) {
      console.log('No duplicate projects found. Database is clean!');
      return;
    }
    
    console.log(`Found ${duplicateNames.length} project names with duplicates.`);
    
    // Process each set of duplicates
    let totalDuplicatesRemoved = 0;
    for (const name of duplicateNames) {
      const duplicates = projectsByName[name];
      console.log(`\nProcessing duplicates for "${duplicates[0].name}" (${duplicates.length} entries found):`);
      
      // List all duplicates
      duplicates.forEach((project, i) => {
        console.log(`  ${i+1}. ID: ${project.id}, Status: ${project.status}, Created: ${new Date(project.created_at).toLocaleString()}`);
      });
      
      // Keep the "best" one:
      // 1. Keep approved projects if available
      // 2. Otherwise keep the oldest project
      let keepIndex = 0;
      
      // Find approved projects
      const approvedProjects = duplicates.filter((p, i) => {
        if (p.status === 'approved') {
          return true;
        }
        return false;
      });
      
      if (approvedProjects.length > 0) {
        // If there are multiple approved projects, keep the oldest one
        const oldestApproved = approvedProjects.reduce((prev, current) => 
          new Date(prev.created_at) < new Date(current.created_at) ? prev : current
        );
        keepIndex = duplicates.findIndex(p => p.id === oldestApproved.id);
      } else {
        // Keep the oldest project
        const oldest = duplicates.reduce((prev, current) => 
          new Date(prev.created_at) < new Date(current.created_at) ? prev : current
        );
        keepIndex = duplicates.findIndex(p => p.id === oldest.id);
      }
      
      // Mark which one we're keeping
      console.log(`  Keeping #${keepIndex+1} (ID: ${duplicates[keepIndex].id})`);
      
      // Delete all others
      const projectsToDelete = duplicates.filter((_, i) => i !== keepIndex);
      const idsToDelete = projectsToDelete.map(p => p.id);
      
      if (idsToDelete.length > 0) {
        console.log(`  Deleting ${idsToDelete.length} duplicate(s)...`);
        
        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .in('id', idsToDelete);
        
        if (deleteError) {
          console.error(`  Error deleting duplicates: ${deleteError.message}`);
          console.log(`  Skipping to next set of duplicates.`);
        } else {
          console.log(`  Successfully deleted ${idsToDelete.length} duplicates.`);
          totalDuplicatesRemoved += idsToDelete.length;
        }
      }
    }
    
    console.log(`\nCleanup complete. Removed ${totalDuplicatesRemoved} duplicate projects.`);
    
  } catch (error) {
    console.error('Error cleaning up duplicate projects:', error);
    process.exit(1);
  }
}

// Run the cleanup
removeDuplicateProjects();
