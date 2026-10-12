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

## Important Key Safety

The app can use the Supabase **anon public** key.

Do not place the **service role** key inside the app. The service role key is for private admin/server use only.

## First Sync Plan

After the tables are created, the app can be updated to:

1. Download active products and prices from Supabase.
2. Save those products locally on the phone.
3. Upload completed POS sales to Supabase.
4. Keep unsynced sales on the phone if internet is not available.
