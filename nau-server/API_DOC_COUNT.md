# API Documentation - Count API

## Project: nau-server

### Base URL

[http://localhost:3002](http://localhost:3002)

### Chạy backend

1. Cài đặt phụ thuộc:

```bash
npm install
```

2. Chạy development (auto reload khi thay đổi):

```bash
npm run start
```

> Server sẽ chạy trên **port 3002**.

---

## GET /nau/:n

Trả về một hàm JS dưới dạng chuỗi để client có thể in số từ 0 tới `n`.

### URL Parameters

- `n` (number) - số nguyên >= 0

### Example Request

```
GET /nau/15
```

### Example Response

```json
{
  "code": "\nfunction printCountToN(n) {\n  if (!Number.isInteger(n) || n < 0) {\n    throw new Error(\"N must be an integer >= 0\");\n  }\n  for (let i = 0; i <= n; i++) {\n    console.log(i);\n  }\n}\n",
  "call": "printCountToN(15);"
}
```

### Notes

- Client có thể chạy bằng:

```js
eval(response.code + response.call);
```

để in số từ 0 → n.

- `n` phải là số nguyên >= 0.
- 404 nếu gọi sai endpoint.

---
