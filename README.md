# BypassDNS project
This project started as a method for studying Python applications (Django + Flask was the first stack **AND PHP**). Yes, I know it does not make sense to most of the persons to see two frameworks like this to work as backend and frontend, however, that was the way I found to make it work on the first website (RIP https://bypassdns.link).

Also, I everytime struggled to provide clients/friends temporary links for them to check how their website look like on the new server as most of the links expires after some minutes, and the client just came back and says: _- hey the temporary link expired_. And there you go having to try to generate a new one _(when not rate limited by the free plan)_

Now, with assistance of AI (lovable.dev), which gave me fancy frontend pages, dialogs, etc, I was able to push this project further and make it easily deployable with DOCKER with the previous FLASK backend I had saved (with some better coding)

![header](https://i.imgur.com/v23jvOx.png)

# About the HTML injection

Please note that this HTML injection is only to show data about this temporary link. What **IP, DOMAIN it's accessing and WHEN the link expires**:
![html](https://i.imgur.com/kgOSu5m.png)

## Should I run this locally?

Well. This will depend on how much are you willing to spend, debug, code, configure. However, you are free to take this and try it locally. Just check the recommendations on the following texts.

## Recommendations for self-hosted
By default, the BypassDNS setup works by the following:
- 2 Dockered nginx servers one handles the first request, focused on the api and the main website, and the other one does the reverse proxy and automatically reloads whenever there are any updates to /etc/nginx/conf.d. The /etc/nginx/conf.d is properly mapped on the volumes from compose.yml
- Backend + Frontend also dockered which does not expose the port to  public IPS, so they are accessible through the domains only.

To self-host this, you need at least:
- A valid domain name _**(I recommend hosting through Cloudflare and configure the SSL to FULL _not FULL STRICT_, so it does not verify the self-signed on the server, it has a self signed ssl from nginx)**_. However, you can install yourself a valid SSL if you want.
- 1 public IP addresses. Previously, it had to has 2 public IP addresses, however, I managed to fix this.
- Turnstile enabled on your account to configure your domains _**(since turnstile is free, I chose it, you're free to try to adapt any other captcha to the website)**_
- Docker with Docker compose
- _Patience_

# Installation of the setup

By default, everything is already set up on the compose.yml file and the Dockerfiles under docker subdirectory. _Please note that changing this structure requires coding change on the files_.

You can clone the repository with git clone:
```bash
git clone https://github.com/BypassDNS/bypassdns-stack.git && cd bypassdns-stack
```

Once you have the stack cloned to your machine, you can start setting up the .env files. You should rename the .env.example that is on the root directory of the repository.

```bash
cp .env.example .env
```
You'll see some variables, let's go through them:

```bash
#---------------------
# NGINX CONFIGURATION
#---------------------
IP= # This IP will be mapped for the public NGINX
DOMAIN_NAME= # There you should fill with your domain name. It'll automatically update the default nginx file for website + api
#---------------------
# BACKEND ENV:
#---------------------
TURNSTILE_SECRET_KEY= # Secret key from turnstile captcha
USE_WEBHOOK=No # Yes or anything else. If it's yes, then configure the URLS :)
DC_WEBHOOK= # Webhook for new temporary links
REMOVAL_WEBHOOK= # Webhook to update for any removed temporary link (expired)
ABUSE_EMAIL= # Email that will show on user agent, where the origin server can reach you.
#---------------------
# FRONTEND ENV
#---------------------
VITE_TURNSTILE_SITE_KEY= # Site key from turnstile captcha
```

If you don't provide one of the above _(besides the webhook part)_ the stack **will not run**. Also, you need to point your domain/wildcard entry. You can use Cloudflare. Your DNS zone should look like this:
![dns](https://i.imgur.com/zsBZHUi.png)

With your DNS created, and the variables set, you should be able to deploy your containers:

```bash
docker compose up -d --build
```

After you start the docker compose setup, you should see 4 containers popping up:
```bash
~$ docker compose ps
NAME                      IMAGE                   COMMAND                  SERVICE       CREATED         STATUS         PORTS
bypassdns-backend-1       bypassdns-backend       "waitress-serve --ho…"   backend       6 minutes ago   Up 6 minutes   5000/tcp
bypassdns-bypassproxy-1   bypassdns-bypassproxy   "/docker-entrypoint.…"   bypassproxy   6 minutes ago   Up 6 minutes   80/tcp
bypassdns-bypassweb-1     bypassdns-bypassweb     "/docker-entrypoint.…"   bypassweb     6 minutes ago   Up 6 minutes   YOURIP:80->80/tcp, YOURIP:443->443/tcp
bypassdns-frontend-1      bypassdns-frontend      "docker-entrypoint.s…"   frontend      6 minutes ago   Up 6 minutes   4173/tcp
```

The containers beside the first nginx (AKA bypassdns-bypassweb) is only one exposed to the internet. So, your API backend endpoint, frontend, etc, are only accessible through this NGINX.

# Issues

As far as I know, and tested, I didn't encounter any **ISSUES** so far. However, if you face anything on the [https://bypassdns.dev](https://bypassdns.dev) website, please open an issue on this GitHub, or if you don't want to public share your the **IP** and **Domain**, please open a ticket/message on our discord community

[![discord](https://i.imgur.com/JZ3koyr.png)](https://discord.gg/fwjtsMKMqC)

# Pull Requests

You are more than welcome to send pull requests with new ideas/suggestions. By now, there's no plan to have authentication system, or anything like this. Maybe in the future.

## License

[MIT](https://choosealicense.com/licenses/mit/)
```
MIT License

Copyright (c) 2025 - bnt0p <bnt0p@bypassdns.link>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```