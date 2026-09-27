# Last Round

Last Round is an Astro app with a local night tracker, optional Supabase email accounts, and a protected owner dashboard for managing venue listings.

## Owner dashboard setup

1. In Supabase SQL Editor, run [`supabase-admin-setup.sql`](supabase-admin-setup.sql).
2. Start the app with `npm run dev`, open the Account screen, and create an account.
3. In Supabase Dashboard, open **Authentication > Users**, copy that account's UUID, and run this in SQL Editor:

```sql
insert into public.admin_users (user_id)
values ('YOUR-AUTH-USER-UUID');
```

4. Sign out and sign back in. The **Owner dashboard** link will appear in the app, and `/` will let you add, edit, feature, hide, or delete listings.

The browser only needs the public Supabase URL and publishable/anon key in `.env.local`:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Never place a Supabase `service_role` key in a `PUBLIC_*` variable or in browser code.

## Development

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
