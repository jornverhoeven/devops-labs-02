# Labs 02 - Students REST API

## Development Quickstart

```bash
docker-compose up -d
npm install
npm run start:dev
```

### Example requests

**List all students:**
```bash
curl http://localhost:3000/api/student
```

**Create a new student:**
```bash
curl http://localhost:3000/api/student \
-X POST \
-H "Content-Type: application/json" \
-d '{"first_name":"Jorn", "last_name":"Verhoeven", "grades": {}}'
```

**Get a single student:**
```bash
curl http://localhost:3000/api/student/${id}
```


**Update students info:**
```bash
curl http://localhost:3000/api/student/${id} \
-X PUT \
-H "Content-Type: application/json" \
-d '{"student_id":1, "first_name":"Jorn", "last_name":"Verhoeven", "grades": { "devOps": 8.0 }}'
```

**Delete a single student:**
```bash
curl http://localhost:3000/api/student/${id} \
-X DELETE
```
