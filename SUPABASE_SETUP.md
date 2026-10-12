# ChamsApp Supabase Setup

Project URL:

```text
https://nzgdfygljemhapabbsnf.supabase.co
```

## Create the Tables

1. Open the Supabase project dashboard.
2. Go to **SQL Editor**.
3. Open `supabase/schema.sql` from this project.
4. Copy the full SQL script.
5. Paste it into Supabase SQL Editor.
6. Click **Run**.

This creates the cloud tables for:

- branches
- products
- price history
- sales transactions
- sales items
- sync logs

## Create Login Users

After `supabase/schema.sql` is complete:

1. Go to **SQL Editor** again.
2. Open `supabase/user_auth.sql` from this project.
3. Copy the full SQL script.
4. Paste it into Supabase SQL Editor.
5. Click **Run**.

This creates the cloud user table and secure login function for:

- main app login
- POS crew login

Starter test users:

| Username | Password | Access |
| --- | --- | --- |
| `admin` | `Admin@12345` | App and POS |
| `crew1` | `Crew@12345` | POS only |

Change these passwords before real store use.

## Create Void Approval Requests

After `supabase/user_auth.sql` is complete:

1. Go to **SQL Editor** again.
2. Open `supabase/void_approvals.sql` from this project.
3. Copy the full SQL script.
4. Paste it into Supabase SQL Editor.
5. Click **Run**.

This creates the table used when crew requests a supervisor-approved void.

## Allow Card Payments

After `supabase/schema.sql` is complete:

1. Go to **SQL Editor** again.
2. Open `supabase/payment_methods.sql` from this project.
3. Copy the full SQL script.
4. Paste it into Supabase SQL Editor.
5. Click **Run**.

This allows POS uploads for Cash, GCash, and Credit/Debit Card payments.

## Important Key Safety

The app can use the Supabase **anon public** key.

Do not place the **service role** key inside the app. The service role key is for private admin/server use only.

## First Sync Plan

After the tables are created, the app can be updated to:

1. Download active products and prices from Supabase.
2. Save those products locally on the phone.
3. Upload completed POS sales to Supabase.
4. Keep unsynced sales on the phone if internet is not available.
