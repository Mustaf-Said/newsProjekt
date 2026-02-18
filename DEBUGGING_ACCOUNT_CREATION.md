# Account Creation - Debugging Guide

## Quick Checklist - Do This First

### Step 1: Check Supabase Email Configuration

Go to: **Supabase Dashboard → Project Settings → Email Templates**

Look for these settings:

- ✓ Email provider is configured (not "dummy")
- ✓ Sender name and email are set
- ✓ Email templates exist for "Confirm signup"

**If NO email provider is set:**
This is why confirmation emails aren't being sent!
[Contact Supabase support or configure an email provider]

---

### Step 2: Check if Trigger was Created

Go to: **Supabase Dashboard → SQL Editor → New query**

Run this to check if trigger exists:

```sql
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

**Expected result:** One row with `on_auth_user_created` and `tgenabled = true`

**If empty:** The trigger was NOT created! Run the SQL from `create_profile_trigger.sql` again.

---

### Step 3: Check if Users/Profiles Were Created

Go to: **Supabase Dashboard → SQL Editor → New query**

Check auth.users:

```sql
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

Check public.profiles:

```sql
SELECT id, email, full_name, created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;
```

**What to look for:**

- Are the user rows there?
- Is `email_confirmed_at` NULL or has a date?
- Are profiles created?

---

### Step 4: Check Email Settings

Go to: **Supabase Dashboard → Authentication → Providers**

Look for these settings:

- **Confirm email:** should be OFF for testing OR
- **Email provider:** should be configured

---

## Solution Options

### Option A: Disable Email Confirmation (For Testing)

Go to: **Authentication → Providers → Email**

Settings:

- Turn OFF "Confirm email"
- User account will be active immediately
- No email confirmation needed

**Pros:** Works immediately for testing
**Cons:** Less secure, no email verification

### Option B: Configure Email Provider (Recommended)

Go to: **Project Settings → Email Templates**

Configure one of these:

- SendGrid
- Mailgun
- AWS SES
- Postmark

---

## What Happens After Each Setup

### After Disabling Email Confirmation:

1. User signs up
2. Account created immediately
3. Can sign in right away
4. Trigger creates profile automatically
5. No email confirmation needed

### After Configuring Email Provider:

1. User signs up
2. Account created
3. Confirmation email sent
4. User must click email link
5. Then can sign in
6. Trigger creates profile automatically

---

## Testing Steps

### Test 1: Verify Trigger is Working

```sql
-- Run this in SQL Editor to manually create a test user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test-id-' || gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  'test-hash',
  NOW(),
  NOW(),
  NOW(),
  jsonb_build_object('full_name', 'Test User')
)
RETURNING id;
```

Then check if profile was created in public.profiles with same ID.

---

## Common Errors

| Error                                   | Cause                                   | Fix                                                    |
| --------------------------------------- | --------------------------------------- | ------------------------------------------------------ |
| Signup succeeds but can't sign in       | Email confirmation enabled but not sent | Disable email confirmation OR configure email provider |
| Success message but no profile created  | Trigger not created                     | Run SQL from `create_profile_trigger.sql`              |
| "Invalid login credentials" immediately | User not in auth.users                  | Check email settings                                   |
| Confirmation email never arrives        | Email provider not configured           | Configure email provider in Supabase                   |

---

## Quick Fix (Fastest Option)

1. Go to **Supabase Dashboard → Authentication → Providers → Email**
2. Turn OFF "Confirm email"
3. Restart your Next.js dev server
4. Try creating account again
5. Should work immediately!

Once working, you can enable email confirmation and configure a provider.
