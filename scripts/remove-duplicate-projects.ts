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
  approved: boolean;
  featured: boolean;
  // Add other fields as needed
}

async function removeDuplicateProjects() {
  console.log('Starting duplicate project cleanup...');
  
  try {
    // Get all projects
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('id, name, status, approved, featured, created_at, updated_at');
    
    if (fetchError) {
      throw new Error(`Error fetching projects: ${fetchError.message}`);
    }
    
    if (!projects || projects.length === 0) {
      console.log('No projects found. Nothing to do.');
      return;
    }
    
    console.log(`Found ${projects.length} total projects.`);
    
    // Group projects by normalized name (case-insensitive, trimmed)
    const projectsByName: Record<string, Project[]> = {};
    projects.forEach((project: Project) => {
      const normalizedName = project.name.trim().toLowerCase();
      if (!projectsByName[normalizedName]) {
        projectsByName[normalizedName] = [];
      }
      projectsByName[normalizedName].push(project);
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
    let totalDuplicatesRenamed = 0;
    
    for (const name of duplicateNames) {
      const duplicates = projectsByName[name];
      console.log(`\nProcessing duplicates for "${duplicates[0].name}" (${duplicates.length} entries found):`);
      
      // List all duplicates
      duplicates.forEach((project, i) => {
        console.log(`  ${i+1}. ID: ${project.id}, Status: ${project.status}, Approved: ${project.approved}, Created: ${new Date(project.created_at).toLocaleString()}`);
      });
      
      // Choose the best candidate to keep:
      // Priority: 1. Approved and featured, 2. Approved, 3. Featured, 4. Oldest
      
      // First, sort by priority criteria
      const sortedDuplicates = [...duplicates].sort((a, b) => {
        // Priority 1: Approved AND Featured
        if (a.approved && a.featured && !(b.approved && b.featured)) return -1;
        if (b.approved && b.featured && !(a.approved && a.featured)) return 1;
        
        // Priority 2: Approved
        if (a.approved && !b.approved) return -1;
        if (b.approved && !a.approved) return 1;
        
        // Priority 3: Featured
        if (a.featured && !b.featured) return -1;
        if (b.featured && !a.featured) return 1;
        
        // Priority 4: Status 'approved'
        if (a.status === 'approved' && b.status !== 'approved') return -1;
        if (b.status === 'approved' && a.status !== 'approved') return 1;
        
        // Priority 5: Oldest (created first)
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      
      // The best candidate is now at index 0
      const keepProject = sortedDuplicates[0];
      const projectsToProcess = sortedDuplicates.slice(1); // All except the first one
      
      console.log(`  Keeping project ID: ${keepProject.id}, Name: "${keepProject.name}", Status: ${keepProject.status}`);
      
      // Process each duplicate except the one we're keeping
      for (const project of projectsToProcess) {
        try {
          // Attempt to delete - this might fail due to foreign key constraints
          const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', project.id);
          
          if (deleteError) {
            console.log(`  Could not delete project ID ${project.id}: ${deleteError.message}`);
            console.log(`  Attempting to rename it instead...`);
            
            // Try renaming with a suffix to make it unique
            const newName = `${project.name} (Duplicate ${Date.now()})`;
            const { error: updateError } = await supabase
              .from('projects')
              .update({ name: newName })
              .eq('id', project.id);
            
            if (updateError) {
              console.error(`  Failed to rename project: ${updateError.message}`);
            } else {
              console.log(`  Successfully renamed project ID ${project.id} to "${newName}"`);
              totalDuplicatesRenamed++;
            }
          } else {
            console.log(`  Successfully deleted project ID ${project.id}`);
            totalDuplicatesRemoved++;
          }
        } catch (err) {
          console.error(`  Error processing project ID ${project.id}:`, err);
        }
      }
    }
    
    console.log(`\nCleanup complete!`);
    console.log(`Results:`);
    console.log(`- Removed: ${totalDuplicatesRemoved} duplicate projects`);
    console.log(`- Renamed: ${totalDuplicatesRenamed} duplicate projects`);
    console.log(`- Total processed: ${totalDuplicatesRemoved + totalDuplicatesRenamed} projects`);
    
  } catch (error) {
    console.error('Error cleaning up duplicate projects:', error);
    process.exit(1);
  }
}

// Run the cleanup
removeDuplicateProjects();
