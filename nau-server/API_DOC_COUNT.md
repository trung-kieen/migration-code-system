# API Documentation - Count API

## Base URL

[http://localhost:3002](http://localhost:3002)

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

- Client có thể chạy bằng `eval(response.code + response.call)` để in số.
- `n` phải là số nguyên >= 0.
- 404 nếu gọi sai endpoint.
