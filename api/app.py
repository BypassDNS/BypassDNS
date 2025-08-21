import json
from pathlib import Path
from flask import Flask, request, Response, redirect, url_for
import requests
from urllib3.exceptions import InsecureRequestWarning
import validators
import asyncio
from utils import create_files, random_char, expired_links, is_private_ip, cloudflare_verify, HtmlInjection, webhook_send
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)
expired_links()

reverse_domain=os.getenv("DOMAIN")
webhook_url=os.getenv("DC_WEBHOOK")
abuse_email=os.getenv("ABUSE_EMAIL")
use_webhook=os.getenv("USE_WEBHOOK")

require_headers = [
    "BypassDNS-Domain-Proxy",
    "BypassDNS-IP-Proxy",
    "BypassDNS-Expiration-Proxy",
]

@app.route('/bypassdns/createbatchlink', methods=['POST'])
async def batchlink():
    if not request.get_json(silent=True):
        data = {"created": 0, "link": None,
                "msg": f"Your body does not seems to be a json . . ."}
        return json.dumps(data), 400
    
    if "turnstileToken" not in request.get_json():
        data = {"created": 0, "link": None, "msg": f"No turnstileToken on your request."}
        return json.dumps(data), 400

    cf = await cloudflare_verify(request.get_json()["turnstileToken"], request.headers.get("Cf-Connecting-Ip"))
    if not cf:
        data = {"created": 0, "link": None, "msg": f"Captcha failed!"}
        return json.dumps(data), 400

    # Checking if any of the domains provided are invalid or IPS are private
    for proxy in request.get_json()["entries"]:
        if not validators.ipv4(proxy["ip"]) and not is_private_ip(proxy["ip"]):
            data = {"created": 0, "link": None, "msg": f"You didn't provide an IP address or one of the provided are invalid.\nThe failed IP address provided was: {proxy["ip"]}"}
            return json.dumps(data), 400

        if not validators.domain(proxy["domain"]):
            data = {"created": 0, "link": None, "msg": f"You didn't provide a domain name or one of the provided domain are invalid.\nThe failed odomain provided was: {proxy["domain"]}"}
            return json.dumps(data), 400
    webhook_msg = "Batch creation detected!\n"
    templinks = []
    for proxy in request.get_json()["entries"]:    
        domain = proxy["domain"]
        ip = proxy["ip"]
        protocol = proxy["protocol"]
        port = proxy["port"]
        username = proxy["username"]
        password = proxy["password"]
        disableHtmlJsInjection = proxy["disableHtmlJsInjection"]
        tempdomain = random_char(7).lower()
        while True:
            my_file = Path(f"/etc/nginx/conf.d/{tempdomain}.{reverse_domain}.conf")
            if my_file.is_file():
                tempdomain = random_char(7).lower()
            else:
                break

        await create_files(domain, ip, tempdomain, protocol, port, username, password, disableHtmlJsInjection)
        data = {"created": 1, "link": f"{tempdomain}.{reverse_domain}", "domain": domain, "ip": ip,"protocol": protocol, "port":port,"username": username, "password": password,"msg": "Success"}
        templinks.append(data)

    if use_webhook == "Yes":
        for entry in templinks:
            webhook_msg += (
                f"Creator: **{request.headers.get("Cf-Connecting-Ip")}**\n"
                f"Time:**{datetime.now()}**\n"
                f"Domain: **{entry['domain']}**\n"
                f"IP: **{entry['ip']}**\n"
                f"Temp link: **{tempdomain}.{reverse_domain}**\n\n"
                f"Protocol: **{entry['protocol']}**\n"
                f"Port:**{entry['port']}**\n"
                f"Html injection?:**{disableHtmlJsInjection}**\n"
                f"#----------------------------\n"
            )

        await webhook_send(1, webhook_msg)
    return json.dumps(templinks), 200


@app.route('/bypassdns/createlink', methods=['POST'])
async def createlink():
    if not request.get_json(silent=True):
        data = {"created": 0, "link": None,
                "msg": f"Your body does not seems to be a json . . ."}
        return json.dumps(data), 400
    
    if "turnstileToken" not in request.get_json():
        data = {"created": 0, "link": None, "msg": f"No turnstileToken on your request."}
        return json.dumps(data), 400

    cf = await cloudflare_verify(request.get_json()["turnstileToken"], request.headers.get("Cf-Connecting-Ip"))

    if not cf:
        data = {"created": 0, "link": None, "msg": f"Captcha failed!"}
        return json.dumps(data), 400
        
    if not request.method == "POST":
        data = {"created": 0, "link": None,
                "msg": f"We only accept post requests. But you shouldn't not even using this :P"}
        return json.dumps(data), 400

    domain = request.get_json()["domain"]
    ip = request.get_json()["ip"]
    protocol = request.get_json()["protocol"]
    port = request.get_json()["port"]
    username = request.get_json()["username"]
    password = request.get_json()["password"]
    disableHtmlJsInjection = request.get_json()["disableHtmlJsInjection"]

    if not validators.ipv4(ip) and not is_private_ip(ip):
        data = {"created": 0, "link": None,
                "msg": f"You didn't provide an IP address or it's invalid.\nThe IP address provided was: {ip}"}
        return json.dumps(data), 400

    if not validators.domain(domain):
        data = {"created": 0, "link": None,
                "msg": f"You didn't provide a domain name or it's invalid.\nThe domain provided was: {domain}"}
        return json.dumps(data), 400


    if domain and ip:
        tempdomain = random_char(7).lower()
        while True:
            my_file = Path(f"/etc/nginx/conf.d/{tempdomain}.{reverse_domain}.conf")
            if my_file.is_file():
                tempdomain = random_char(7).lower()
            else:
                break   

        await create_files(domain, ip, tempdomain, protocol, port, username, password, disableHtmlJsInjection)
        data = {"created": 1, "link": f"{tempdomain}.{reverse_domain}","msg": "Success"}
        if use_webhook == "Yes":
            webhook_msg = f"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\nCreator: **{request.headers.get("Cf-Connecting-Ip")}**\nTime:**{datetime.now()}**\nDomain: **{domain}**\nIP: **{ip}**\nTemp link: **{tempdomain}.{reverse_domain}**\n\nProtocol: **{protocol}**\nPort:**{port}**\nHtml injection?:**{disableHtmlJsInjection}**\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
            await webhook_send(1, webhook_msg)

        return json.dumps(data)

    data = {"created": 0, "link": None, "msg": "Something is missing"}
    return json.dumps(data), 400


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
async def index(path):
    for h in require_headers:
        if not request.headers.get(h):
            return Response("", status=403)

    requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)
    headers = {"Host": request.headers.get('BypassDNS-Domain-Proxy'),"X-Forwarded-For": request.headers.get("X-Forwarded-For"),"User-Agent": f"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36/1.0 | This request came from a temporary BypassDNS link: {request.headers.get('Referer')} | report abuse at {abuse_email}","Content-Security-Policy": "upgrade-insecure-requests","X-Real-IP": request.headers["X-Real-Ip"]}
    if request.method == "POST":
        if request.headers.get("BypassDNS-Port") != "None":
            proxy = requests.post(f'{request.headers.get("BypassDNS-Protocol")}://{request.headers.get('BypassDNS-IP-Proxy')}:{request.headers.get("BypassDNS-Port")}{request.path}', data=request.body.decode('utf-8'), headers=request.headers, verify=False)
        else:
            proxy = requests.post(f'{request.headers.get("BypassDNS-Protocol")}://{request.headers.get('BypassDNS-IP-Proxy')}{request.path}', data=request.body.decode('utf-8'), headers=request.headers, verify=False)

        return Response(proxy.content, mimetype=proxy.headers.get("Content-Type"))
    
    if request.headers.get("BypassDNS-Port") != "None":
        proxy = requests.get(f'{request.headers.get("BypassDNS-Protocol")}://{request.headers.get('BypassDNS-IP-Proxy')}:{request.headers.get("BypassDNS-Port")}{request.path}', headers=headers, verify=False)
    else:
        proxy = requests.get(f'{request.headers.get("BypassDNS-Protocol")}://{request.headers.get('BypassDNS-IP-Proxy')}{request.path}', headers=headers, verify=False)
    
    if proxy.headers.get("Content-Type").startswith("text/html"):
        if request.headers.get("BypassDNS-Disable-HtmlInjection") == "False":
            html = proxy.content.decode("utf-8", errors="ignore")
            html = html.replace("</head>", f"{HtmlInjection(request.headers.get('BypassDNS-Expiration-Proxy'))}\n</head>", 1)
            return Response(html, mimetype=proxy.headers.get("Content-Type"))

    return Response(proxy.content, mimetype=proxy.headers.get("Content-Type"))
