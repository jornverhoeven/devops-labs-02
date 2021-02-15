# Labs 02 - Report

---
**NOTE**

For this exercise I chose to *NOT* use the generated Python source, but create a NodeJS application from scratch. 
This was done because of my professional experience with NodeJS web applications, and thus focussing on what matters in this exercise. (Instead of fighting against Python)

---

Link to [Git repository (jornverhoeven/devops-labs-02)](https://github.com/jornverhoeven/devops-labs-02)

Link to [Docker hub (jjverhoeven/devops-labs-02)](https://hub.docker.com/repository/docker/jjverhoeven/devops-labs-02)


## Introduction

- **Plan**: The initial steps were setting up the expectations of the service. Using Swagger to generate a formal API description with expected in- and outputs.

- **Code**: The coding obviously involves creating the implementation. 

- **Build**: Building of the software is essential in case of the type of testing that was done using `newman`. This is in essence a end-to-end test that is being tested against a running instance. Therefore building a Dockerfile in which the service was running is essential.

- **Test**: Testing of the software is detrimental for building high-quality software. Without the validation of tests it is impossible to guarrantee the softwares precision and correctness. 

- **Release**: After a successfull build and test phase we can publish our Docker images to dockerhub, which we can then use to easilly deploy a new service instance (to for example AWS).

## Tasks
[//]: # (2.1a)
### Q2.1a

```yaml
definitions:
  Student:
    type: "object"
    properties:
      student_id:
        type: "integer"
      first_name:
        type: "string"
      last_name:
        type: "string"
      grades:
        type: "object"
        additionalProperties:
          type: "number"
        example:
          devops: 8.0
          softwareProcess: 8.0
```

[//]: # (2.1b)
### Q2.1b

```yaml
delete:      
      summary: "Delete a student"
      description: ""
      operationId: "deleteStudent"
      produces:
      - "application/json"
      parameters:
      - name: "student_id"
        in: "path"
        description: "ID of student to delete"
        required: true
        type: "integer"
        format: "int64"
      responses:      
        200:
          description: "successful operation"
          schema:
            $ref: "#/definitions/Student"
        400:
          description: "Invalid ID supplied"
        404:
          description: "Student not found"
```

[//]: # (2.5a)
### Q2.5a

```docker
FROM ubuntu:20.04

WORKDIR /app
ADD ./dist/labs-02 application

VOLUME ["/app/swagger.yaml", "/app/students.json"]
CMD /app/application
```

## Serivce Granularity
The way this project was set up makes it fully detachable from one another. The `student.models.js` file is a simple in-memory database that can read and write to a file as persistance storage. This model can easilly be replaced with for example a MongoDB or any SQL database, by just implementing the standard `repository` pattern that is used by almost all packages.
The advantage from separating them is that it is very easy to change the actual implementation without having to re-do the entire codebase. 

For this simple service it is probably easy enough to use MongoDB as there is no relational information, and the objects are really small. 
The usage of this service itself is probably nearly nothing, and therefore it would be easiest to spin-up a seperate MongoDB instance using for example `docker-compose` or `docker swarm`. 
As the data in this example requires no protection from corruption or encryption it is enough to self host it.
If this would be an issue, using a cloud based mongodb from for example AWS would be more suitable as they guarrantee that the data will be available and backed-up.