FROM nginx:stable-alpine

RUN mkdir -p /var/www

#ADD . /var/www
COPY ./nginx.conf /etc/nginx/nginx.conf

CMD ["nginx"]
