#!/bin/bash
inotifywait -m -r -e modify,create,delete,move /etc/nginx/conf.d /etc/nginx/nginx.conf | while read path action file; do
    echo "Nginx config changed: $path/$file - $action. Reloading Nginx..."
    nginx -s reload
done