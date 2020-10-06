
frontend:
	docker run --name atsp-frontend -p 80:80 -v "$(PWD)/frontend/":/usr/share/nginx/html:ro -d nginx
