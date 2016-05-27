FROM python:2.7
ENV PYTHONUNBUFFERED 1
RUN apt-get update && apt-get install -y nodejs npm
RUN ln -s /usr/bin/nodejs /usr/bin/node
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
RUN npm install
RUN ./node_modules/bower/bin/bower install --allow-root
EXPOSE 8000
ENTRYPOINT  ["gunicorn", "-b", "0.0.0.0:8000", "-k", "flask_sockets.worker", "--log-file=-", "server:app"]
