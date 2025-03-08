import { getSupabaseClient } from "@/lib/supabase";
import { Notification } from "@/types/project";

/**
 * Creates a notification
 */
export async function createNotification(
  userId: string,
  projectId: string,
  message: string,
  type: 'approval' | 'rejection' | 'changes_requested' | 'system'
): Promise<Notification> {
  const supabase = getSupabaseClient();
  
  const notification = {
    user_id: userId,
    project_id: projectId,
    message,
    type,
    read: false
  };
  
  const { data, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating notification:", error);
    throw new Error(`Error creating notification: ${error.message}`);
  }
  
  return data as Notification;
}

/**
 * Gets notifications for the current user
 */
export async function getUserNotifications(
  limit: number = 10,
  page: number = 1
): Promise<{ data: Notification[], count: number }> {
  const supabase = getSupabaseClient();
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("No active session found. Please log in.");
  }
  
  const offset = (page - 1) * limit;
  
  // Fetch notifications
  const { data, error, count } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error("Error fetching notifications:", error);
    throw new Error(`Error fetching notifications: ${error.message}`);
  }
  
  return { data: data as Notification[], count: count || 0 };
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);
  
  if (error) {
    console.error("Error marking notification as read:", error);
    throw new Error(`Error marking notification as read: ${error.message}`);
  }
}

/**
 * Marks all notifications as read for the current user
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("No active session found. Please log in.");
  }
  
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", session.user.id)
    .eq("read", false);
  
  if (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error(`Error marking all notifications as read: ${error.message}`);
  }
}

/**
 * Gets the count of unread notifications for the current user
 */
export async function getUnreadNotificationsCount(): Promise<number> {
  const supabase = getSupabaseClient();
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return 0; // No active session, so no notifications
  }
  
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id)
    .eq("read", false);
  
  if (error) {
    console.error("Error counting unread notifications:", error);
    throw new Error(`Error counting unread notifications: ${error.message}`);
  }
  
  return count || 0;
}

/**
 * Sends an email notification (placeholder for actual email service integration)
 * In a real app, you would use an email service like SendGrid, Mailgun, etc.
 */
export async function sendEmailNotification(
  email: string,
  subject: string,
  message: string
): Promise<void> {
  // This is a placeholder for actual email service integration
  console.log(`Email notification to ${email}:`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
  
  // In a real implementation, you would call your email service here
  // For example, with SendGrid:
  // await sgMail.send({
  //   to: email,
  //   from: 'notifications@rwa-directory.com',
  //   subject,
  //   text: message,
  // });
}
