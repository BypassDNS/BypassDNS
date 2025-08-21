import asyncio
import random, string
from datetime import datetime, timedelta
import subprocess
import requests
from urllib3.exceptions import InsecureRequestWarning
import os
import re
import threading
import json
import ipaddress
import httpx

turnstile_key=os.getenv("TURNSTILE_SECRET_KEY").strip()
reverse_domain = os.getenv("DOMAIN")
removal_webhook = os.getenv("REMOVAL_WEBHOOK")
webhook_url=os.getenv("DC_WEBHOOK")

def is_private_ip(ip_address_str):
    try:
        ip = ipaddress.ip_address(ip_address_str)
        return ip.is_private
    except ValueError:
        return False


async def cloudflare_verify(token, ip):
    cloudflare_url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    cloudflare_payload = {"secret": turnstile_key,"response": token,"remoteip": ip}
    async with httpx.AsyncClient(http2=False) as client:
        r = await client.post(cloudflare_url,data=cloudflare_payload,headers={"Content-Type": "application/x-www-form-urlencoded"})
        r.raise_for_status()
        return r.json().get("success", False)


def random_char(y):
    return ''.join(random.choice(string.ascii_letters) for x in range(y))


async def webhook_send(type, msg):
    if not webhook_url or not removal_webhook:
        return
    payload = {"content": msg}
    headers = {"Content-Type": "application/json"}
    match type:
        case 1:
            try:
                requests.post(webhook_url, data=json.dumps(payload), headers=headers)
            except:
                pass
        case 2:
            try:
                requests.post(removal_webhook, data=json.dumps(payload), headers=headers)
            except:
                pass
        case _:
            pass


async def create_files(domain, ip, temp, protocol=None, port=None, user=None, password=None, disableHtmlInjection=False):
    file_path = "./nginx/template.conf"

    if user and password is not None:
        file_path = "./nginx/template-pass.conf"
        cmd = [
            "htpasswd",
            "-b",
            "-c",
            f"/etc/nginx/htpasswd/{temp}.{reverse_domain}_htpasswd",
            user,
            password
        ]

        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    with open(file_path, 'r') as file:
        file_content = ''
        line = file.readline()
        
        while line:
            file_content += line
            line = file.readline()

    expire_at = str(datetime.now() + timedelta(days=1))

    content = (
        file_content
        .replace("{temp}", temp)
        .replace("{IP}", ip)
        .replace("{EXPIRE_AT}", expire_at)
        .replace("{PORT}", str(port))
        .replace("{PROTOCOL}", str(protocol))
        .replace("{HTMLINJECTION}", str(disableHtmlInjection))
        .replace("{REVERSE_DOMAIN}", reverse_domain)
    )

    requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)
    headers = {"Host": domain}
    initial_url = f"https://{ip}"
    response = requests.get(initial_url, headers=headers, verify=False)

    if "www." in response.url:
        content = content.replace("{domain}", f"www.{domain}")
    else:
        content = content.replace("{domain}", domain)

    f = open(f"/etc/nginx/conf.d/{temp}.{reverse_domain}.conf", "a")
    f.write(content)
    f.close()


def expired_links():
    conf_dir = "/etc/nginx/conf.d"
    message = ""
    pattern = re.compile(r'proxy_set_header\s+BypassDNS-Expiration-Proxy\s+"([^"]+)"')
    now = datetime.now()
    for filename in os.listdir(conf_dir):
        filepath = os.path.join(conf_dir, filename)
        if os.path.isfile(filepath):
            with open(filepath, "r") as f:
                for line in f:
                    match = pattern.search(line)
                    if match:
                        date_str = match.group(1)
                        expiration = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S.%f")
                        if now > expiration:
                            htpasswd_file = f"/etc/nginx/htpasswd/{filename.replace(".conf", "")}_htpasswd"
                            if os.path.isfile(htpasswd_file):
                                os.remove(f"/etc/nginx/htpasswd/{filename.replace(".conf", "")}_htpasswd")

                            message += f"Expired: **{filename}** (expired at **{expiration}**)\n"
                            message += "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n"
                            os.remove(f"/etc/nginx/conf.d/{filename}")
                        break
    
    if message:
        webhook_send(2, message)

    timer = threading.Timer(600, expired_links)
    timer.daemon = True
    timer.start()
    return

def HtmlInjection (expire, ip):
    injection = (
        '<meta charset="UTF-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        '<style>.topbar_bypassdns{position:fixed;top:10px;left:10px;z-index:9999;background-color:#f0f0f0;padding:8px 12px;border:1px solid #ccc;border-radius:6px;font-size:14px;font-family:Arial;color:#333;box-shadow:0 2px 5px rgba(0,0,0,0.1)}.countdown_bypassdns{font-weight:bold;color:#e74c3c}</style>'
        '<div class="topbar_bypassdns" id="topbar_bypassdns">This link expires in '
        '<span id="countdown_bypassdns_div" class="countdown_bypassdns">Loading...</span><br>'
        f'You\'re accessing: <a style="color:MediumSeaGreen;" href="https://domain-bypassdns" target="_blank">https://domain-bypassdns</a><br>'
        f'On the IP: <span id="ip-bypassdns" style="color:MediumSeaGreen;">{ip}</span>'
        '</div>'
        '<script>'
        f'var countDownDate_bypassdns=new Date("{expire}").getTime();'
        'var x=setInterval(function(){'
        'const saoPauloDate = new Date('
        'new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })'
        ');'
        'var now=saoPauloDate.getTime();'
        'var distance_bypassdns=countDownDate_bypassdns-now;'
        'var days=Math.floor(distance_bypassdns/(1000*60*60*24));'
        'var hours=Math.floor((distance_bypassdns%(1000*60*60*24))/(1000*60*60));'
        'var minutes=Math.floor((distance_bypassdns%(1000*60*60))/(1000*60));'
        'var seconds=Math.floor((distance_bypassdns%60000)/1000);'
        'document.getElementById("countdown_bypassdns_div").innerHTML=days+"d "+hours+"h "+minutes+"m "+seconds+"s ";'
        'if(distance_bypassdns<0){clearInterval(x);location.reload();document.getElementById("countdown_bypassdns_div").innerHTML="EXPIRED";}'
        '},1000);'
        '</script>'
    )

    return injection