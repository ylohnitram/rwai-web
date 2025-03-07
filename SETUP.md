# TokenDirectory - Supabase Setup

This documentation describes the process of setting up Supabase for the TokenDirectory application.

## 1. Creating a Supabase Project

1. Sign in to [Supabase](https://supabase.com/) or create an account
2. Click on "New Project" and create a new project
3. Fill in the project name and database password

## 2. Authentication Configuration

1. In the Supabase dashboard, go to "Authentication" > "Settings"
2. In the "Email Auth" section, check that "Enable Email Signup" is enabled
3. In the "URL Configuration" section, set:
   - Site URL: URL of your application (e.g., https://yourdomain.com)
   - Redirect URLs: Add URLs for redirection after login/logout (e.g., https://yourdomain.com/auth/callback)

## 3. Creating Tables and Functions

1. Go to the "SQL Editor" section
2. Create a new query
3. Insert and run the SQL code from the `supabase/schema.sql` file

## 4. Creating an Administrator Account

1. Go to the "Authentication" > "Users" section
2. Click on "Invite" and enter an email for the admin account
3. The user will receive an email with an invitation and will set a password
4. After creating the account, go to the "Table Editor" > "profiles" section
5. Find the user record and change the role value from "user" to "admin"

## 5. Connecting with the Application

1. In the Supabase dashboard, go to "Project Settings" > "API"
2. Copy the "Project URL" and "anon public" key
3. Add these values to your application's environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. For server operations, also copy the "service_role" key to the variable
   - `SUPABASE_SERVICE_ROLE_KEY`

## 6. Testing

1. Run the application
2. Go to /login and sign in with the administrator account
3. After logging in, you should have access to the /admin path

