# Tài Liệu Triển Khai: Caching, Versioning và Giả Lập Local

Tài liệu này mô tả chi tiết về tính năng tối ưu hóa băng thông (Caching & Versioning) và hướng dẫn chạy môi trường giả lập hệ thống phân tán ngay trên máy cục bộ (Local Simulation) bằng Docker.

## 1. Tính Năng Caching & Versioning

Mục tiêu của tính năng này là giảm tải băng thông mạng bằng cách lưu trữ code xử lý (caching) tại phía Client (trình duyệt) và chỉ tải lại khi Server có phiên bản code mới.

### Cơ Chế Hoạt Động

1.  **Versioning (Đánh phiên bản):**
    - Cả `nau-server` và `fib-server` đều được gán một hằng số `VERSION` (ví dụ: `1.0.0`).
    - Client lưu trữ phiên bản code hiện tại của từng endpoint trong bộ nhớ tạm (`useRef`).

2.  **Luồng Xử Lý (Workflow):**
    - **Bước 1:** Khi người dùng gửi request, Client sẽ kiểm tra xem đã có code trong cache chưa.
    - **Bước 2:** Client gửi HTTP Request kèm theo query parameter `?client_version=<version_hien_tai>`.
    - **Bước 3 (Tại Server):** Server so sánh `client_version` nhận được với `VERSION` hiện tại của nó.
      - **Trường hợp 1 - Khớp (Cache Hit):** Server trả về response nhẹ chỉ chứa metadata (`{ cached: true, version: '1.0.0' }`), không kèm theo `code`.
      - **Trường hợp 2 - Không Khớp (Cache Miss):** Server trả về response đầy đủ (`{ code: '...', version: '1.0.0', cached: false }`).
    - **Bước 4 (Tại Client):**
      - Nếu nhận được `cached: true`: Client sử dụng code đang lưu trong cache để thực thi.
      - Nếu nhận được code mới: Client cập nhật cache và thực thi code mới.

### Các File Đã Thay Đổi

- **Backend (`nau-server/src/index.ts`, `fib-server/src/main.ts`):**
  - Thêm hằng số `VERSION`.
  - Logic kiểm tra `req.query.client_version`.
- **Frontend (`src/lib/api.ts`, `src/app/page.tsx`):**
  - Cập nhật hàm `getCode` để gửi `client_version`.
  - Thêm `codeCache` để lưu trạng thái.
  - Hiển thị log trạng thái (Hit/Miss) trên giao diện.

---

## 2. Hướng Dẫn Giả Lập Môi Trường (Local Simulation)

Để mô phỏng hệ thống phân tán (gồm Load Balancer và nhiều máy trạm) ngay trên máy tính cá nhân, chúng tôi sử dụng **Docker Compose** với cấu hình mạng nội bộ.

### Kiến Trúc Giả Lập

Chúng ta sẽ chạy 6 container cùng lúc:

1.  **Frontend (Next.js):** Cổng giao tiếp người dùng (Port `3000`).
2.  **Load Balancer (Nginx):** Phân phối tải (Port `8080`).
3.  **Nau Server (x2):** 2 instance giả lập 2 máy server tính toán đơn giản.
4.  **Fib Server (x2):** 2 instance giả lập 2 máy server tính Fibonacci.

### Các Bước Cài Đặt & Chạy

**Yêu cầu:** Máy tính đã cài đặt [Docker](https://www.docker.com/) và Docker Compose.

1.  **Khởi động hệ thống:**
    Tại thư mục gốc của dự án, chạy lệnh:

    ```bash
    docker-compose -f docker-compose.local.yml up -d --build
    ```

    _Lệnh này sẽ build lại các image (Frontend, Backend) và khởi tạo mạng ảo._

2.  **Truy cập ứng dụng:**
    Mở trình duyệt và truy cập:

    ```
    http://localhost:3000
    ```

3.  **Kiểm tra tính năng:**
    - Chọn endpoint `/nau` hoặc `/fib`.
    - Nhập số `N` và bấm **Thực thi Migration**.
    - **Lần đầu:** Log sẽ báo "📥 Đã tải Code mới".
    - **Lần tiếp theo:** Log sẽ báo "⚡ Sử dụng Code Cached" (nếu không đổi Server Version).

4.  **Dừng hệ thống:**
    Để tắt và dọn dẹp container:
    ```bash
    docker-compose -f docker-compose.local.yml down
    ```

### Cấu Hình Chi Tiết

- **`docker-compose.local.yml`**: File định nghĩa toàn bộ stack.
- **`nginx/nginx.local.conf`**: Cấu hình Nginx đặc biệt cho môi trường local, trỏ upstream về các container name (`fib-server-1`, `nau-server-1`...) thay vì IP cứng.
- **`frontend/Dockerfile`**: File build cho Frontend Next.js.

## 3. Khắc Phục Sự Cố (Troubleshooting)

- **Lỗi kết nối Frontend -> Backend:**
  Đảm bảo container `load-balancer` đang chạy (`docker ps`). Frontend giao tiếp với Load Balancer qua internal network tại địa chỉ `http://load-balancer:80`.
- **Lỗi Build Frontend:**
  Nếu gặp lỗi liên quan đến Node version, hãy kiểm tra `frontend/Dockerfile`. Hiện tại đang sử dụng `node:20-alpine` để tương thích với Next.js mới nhất.
