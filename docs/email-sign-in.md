# Email sign-in without Resend

Plankz Deckz keeps its Auth.js email magic links and database sessions. Nodemailer sends the link through a configured SMTP account. The storefront does not need a Resend account, SDK, domain verification, or database migration for sign-in.

## Set up the existing Plankz Gmail account

Use the brand mailbox `plankz.deckz@gmail.com` if its owner can create a Google app password. Google requires 2-Step Verification for app passwords; some account security settings prevent their use. Create an app password named for the storefront in the Google Account security settings. Do not use the normal Google password.

Set these Vercel project environment variables for the environment being tested:

| Variable                | Value                                               |
| ----------------------- | --------------------------------------------------- |
| `EMAIL_SERVER_HOST`     | `smtp.gmail.com`                                    |
| `EMAIL_SERVER_PORT`     | `465`                                               |
| `EMAIL_SERVER_USER`     | `plankz.deckz@gmail.com`                            |
| `EMAIL_SERVER_PASSWORD` | The Google app password, entered as a Vercel secret |
| `EMAIL_FROM`            | `PLANKZ DECKZ <plankz.deckz@gmail.com>`             |

The sender address must match the Gmail account or a sender alias configured in that account. Do not keep the old `noreply@plankzdeckz.com` sender with this Gmail setup. The application also supports another SMTP provider using the same five variables. Port 465 uses immediate TLS; other ports require STARTTLS.

Redeploy after changing Vercel environment variables. Request a magic link from the deployed `/login` page, confirm it reaches the inbox, open it, and verify access to `/admin` for an address listed in `ADMIN_EMAILS`. Test once in Preview before changing Production. If delivery fails, the login form must display an error; it must not display “Check your email”. Inspect Vercel runtime error metadata without copying verification links or secret values.

Remove the old Resend SMTP password from Vercel when the replacement is working. Existing database sessions and order history are unaffected. Gmail is suitable for low-volume initial access; if sign-in volume grows, change only the SMTP credentials to a transactional email service.
