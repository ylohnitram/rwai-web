import { NextResponse } from "next/server";
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
// This bypasses Supabase's API and RLS completely
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    // Create pool if it doesn't exist
    const connectionString = process.env.POSTGRES_CONNECTION_STRING;
    
    if (!connectionString) {
      throw new Error('POSTGRES_CONNECTION_STRING environment variable is not set');
    }
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

export async function POST(
  request: Request
) {
  try {
    // Get request data
    const data = await request.json();
    const { id, action, notes } = data;
    
    if (!id || !action) {
      return NextResponse.json({ 
        error: "Missing required parameters: id and action" 
      }, { status: 400 });
    }
    
    console.log(`Direct SQL update for project ${id}, action: ${action}`);
    
    // Determine the new status based on the action
    let newStatus;
    let updateSql;
    
    switch (action) {
      case 'approve':
        newStatus = 'approved';
        updateSql = `UPDATE public.projects SET status = $1 WHERE id = $2 RETURNING *`;
        break;
      case 'reject':
        newStatus = 'rejected';
        updateSql = `UPDATE public.projects SET status = $1 WHERE id = $2 RETURNING *`;
        break;
      case 'request-changes':
        if (!notes) {
          return NextResponse.json({ 
            error: "Notes are required for request-changes action" 
          }, { status: 400 });
        }
        newStatus = 'changes_requested';
        updateSql = `UPDATE public.projects SET status = $1, review_notes = $2 WHERE id = $3 RETURNING *`;
        break;
      default:
        return NextResponse.json({ 
          error: "Invalid action. Must be 'approve', 'reject', or 'request-changes'" 
        }, { status: 400 });
    }
    
    // Get database pool
    const dbPool = getPool();
    
    // Execute SQL
    let result;
    if (action === 'request-changes') {
      result = await dbPool.query(updateSql, [newStatus, notes, id]);
    } else {
      result = await dbPool.query(updateSql, [newStatus, id]);
    }
    
    if (result.rowCount === 0) {
      return NextResponse.json({ 
        error: `Project with ID ${id} not found` 
      }, { status: 404 });
    }
    
    // Return success
    return NextResponse.json({
      success: true,
      message: `Project ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'changes requested'} successfully`,
      data: result.rows[0]
    });
  } catch (err: any) {
    console.error(`Error in direct update: ${err.message}`);
    console.error(err.stack);
    
    return NextResponse.json({ 
      error: `Server error: ${err.message}` 
    }, { status: 500 });
  }
}
