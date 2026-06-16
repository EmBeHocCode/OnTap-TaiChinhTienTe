# Web ôn tập Tài chính – Tiền tệ – Ngân hàng

## Cách chạy
Mở `index.html` bằng Chrome hoặc Edge là dùng được. Không cần XAMPP, Node.js hay internet.

## Tính năng
- 175 câu trắc nghiệm đầy đủ A/B/C/D.
- Chia 7 chương.
- Chọn làm 10 / 25 / 50 câu hoặc toàn bộ.
- Trộn câu hỏi, trộn đáp án.
- Hiện đáp án đúng.
- Tự lưu đúng/sai bằng localStorage.
- Có danh sách câu sai để ôn lại.

## Cấu trúc
- `index.html`: trang chính.
- `assets/style.css`: giao diện.
- `assets/app.js`: logic ôn tập.
- `data/questions.js`: dữ liệu 175 câu.


## Bản sửa keyword
- Phần từ khóa nhận diện chỉ lấy từ câu hỏi, không lấy đáp án để tránh lộ đáp án.


## Bản sửa đúng ý
- Không hiện dòng keyword lấy từ đáp án.
- Keyword được bôi đậm trực tiếp trong câu hỏi, tương tự bản Word.
- Đáp án chỉ hiện sau khi chọn hoặc bấm hiện đáp án.
