# Labs 02 - Students REST API

![build-status](https://travis-ci.com/jornverhoeven/devops-labs-02.svg?branch=master)

## Development Quickstart

```bash
docker-compose up -d
npm install
npm run start:dev
```

### Example requests

**List all students:**
```bash
curl http://localhost:8080/service-api/student
```

**Create a new student:**
```bash
curl http://localhost:8080/service-api/student \
-X POST \
-H "Content-Type: application/json" \
-d '{"first_name":"Jorn", "last_name":"Verhoeven", "grades": {}}'
```

**Get a single student:**
```bash
curl http://localhost:8080/service-api/student/${id}
```


**Update students info:**
```bash
curl http://localhost:8080/service-api/student/${id} \
-X PUT \
-H "Content-Type: application/json" \
-d '{"student_id":1, "first_name":"Jorn", "last_name":"Verhoeven", "grades": { "devOps": 8.0 }}'
```

**Delete a single student:**
```bash
curl http://localhost:8080/service-api/student/${id} \
-X DELETE
```
