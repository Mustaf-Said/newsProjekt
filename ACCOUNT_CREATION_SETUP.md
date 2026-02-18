# Account Creation Fix - Setup Instructions

## Problem Fixed

- ✅ Users can now create accounts with Name, Email, Password, and Confirm Password
- ✅ Foreign key constraint errors resolved
- ✅ Success message shows in sidebar (no popup alert)
- ✅ Automatic profile creation via database trigger

## What Changed

### 1. **Database Trigger (MUST RUN)**

File: `create_profile_trigger.sql`

**Action Required:**

1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `create_profile_trigger.sql`
3. Paste and run it

This creates an automatic trigger that creates a profile row in `public.profiles` when a user signs up in `auth.users`.

### 2. **Auth Page Updated**

File: `app/(site)/auth/page.tsx`

Changes:

- Full Name field (required for signup only)
- Confirm Password field (validates both passwords match)
- Password validation (6+ characters)
- Success message with green checkmark + "Continue to Sign In" button
- Sends `full_name` in user metadata during signup
- Removed direct database API calls (trigger handles it now)

### 3. **RLS Policies Updated**

File: `supabase_profiles_rls_policies.sql`

Already includes:

- `"Users can read own profile"` - Users can view their own data
- `"Users can insert own profile"` - For authenticated users
- `"Service role can insert profiles"` - For API/admin access
- `"Users can update own profile"` - Users can edit their own profile

## Form Fields

### Sign Up (New Users Only):

- Full Name (required)
- Email (required)
- Password (required, min 6 chars)
- Confirm Password (required, must match)

### Sign In (Existing Users):

- Email (required)
- Password (required)

## How It Works Now

1. User fills form and clicks "Create Account"
2. Form validates all fields
3. `supabase.auth.signUp()` is called with email, password, and full_name in metadata
4. Supabase automatically creates the user in `auth.users`
5. **Database trigger fires automatically** and creates profile in `public.profiles`
6. Success message shows to user
7. User can click "Continue to Sign In" to login

## Testing Steps

1. ✅ Run the SQL trigger file in Supabase
2. ✅ Restart your Next.js development server
3. ✅ Go to `http://localhost:3000/auth`
4. ✅ Click "Don't have an account? Sign Up"
5. ✅ Fill in all fields and create account
6. ✅ Should see success message
7. ✅ Check Supabase → profiles table to verify profile was created

## Troubleshooting

**Problem:** Still getting foreign key error

- **Solution:** Make sure you ran the trigger SQL in Supabase SQL Editor

**Problem:** Profile created but full_name is empty

- **Solution:** The trigger reads from `raw_user_meta_data->>'full_name'` - verify metadata is being set

**Problem:** User created but profile not visible

- **Solution:** Check RLS policies - might need to run the RLS policy file again

## Files Modified

- ✅ `app/(site)/auth/page.tsx` - Auth form with all new fields
- ✅ `create_profile_trigger.sql` - Database trigger (NEW - MUST RUN)
- ✅ `supabase_profiles_rls_policies.sql` - RLS policies (optional update)
- ✅ `app/api/auth/create-profile/route.ts` - API route (no longer used but left for backup)
