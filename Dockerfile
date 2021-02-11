FROM ubuntu:20.04

WORKDIR /app
ADD ./dist/labs-02 application

VOLUME ["/app/swagger.yaml", "/app/students.json"]
CMD /app/application